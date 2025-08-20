import { existsSync } from 'fs'
import { resolve, join } from 'path'
import { execa } from 'execa'
import fse from 'fs-extra'
import archiver from 'archiver'
import { NodeSSH } from 'node-ssh'
import ora from 'ora'
import chalk from 'chalk'
import inquirer from 'inquirer'

/** 部署配置接口 - 定义所有部署相关的配置选项 */
export interface DeployConfig {
  /** 构建命令 - 可选，用于在部署前构建项目，如 'npm run build' */
  buildCommand?: string
  /** 构建输出目录 - 必需，指定构建后的文件目录，如 'dist' 或 '.output' */
  buildDir: string
  /** 版本号 - 可选，指定部署版本，如 'v1.0.0'，不指定则在部署时询问 */
  version?: string
  /** 服务器连接配置 - 必需，包含所有服务器连接信息 */
  server: {
    /** 服务器地址 - 必需，IP地址或域名，如 '192.168.1.100' */
    host: string
    /** SSH端口 - 可选，默认22，服务器SSH连接端口 */
    port?: number
    /** 用户名 - 必需，SSH登录用户名，如 'root' */
    username: string
    /** 密码 - 可选，SSH登录密码，与privateKey二选一 */
    password?: string
    /** 私钥路径 - 可选，SSH私钥文件路径，与password二选一，更安全 */
    privateKey?: string
    /** 部署路径 - 必需，服务器上的部署目录，如 '/var/www/app' */
    deployPath: string
  }
  /** PM2配置 - 可选，进程管理器配置 */
  pm2?: {
    /** 应用名称 - 必需，PM2中的应用名称，用于重启应用 */
    appName: string
    /** 是否重启 - 可选，默认true，部署后是否自动重启PM2应用 */
    restart?: boolean
  }
  /** 排除文件列表 - 可选，打包时要排除的文件/目录模式，如 ['node_modules/**'] */
  excludeFiles?: string[]
  /** 部署前命令 - 可选，部署前在本地执行的命令数组，如 ['npm test'] */
  beforeDeploy?: string[]
  /** 部署后命令 - 可选，部署后在服务器上执行的命令数组，如 ['npm install'] */
  afterDeploy?: string[]
}
/** 部署命令选项接口 - deploy命令的参数选项 */
interface DeployOptions {
  /** 配置文件路径 - 必需，pcli-cd.config.js文件的路径 */
  config: string
  /** 版本号 - 可选，命令行指定的版本号，会覆盖配置文件中的版本 */
  version?: string
}
/** 列表命令选项接口 - list命令的参数选项 */
interface ListOptions {
  /** 配置文件路径 - 必需，用于获取服务器连接信息 */
  config: string
}
/** 回滚命令选项接口 - rollback命令的参数选项 */
interface RollbackOptions {
  /** 配置文件路径 - 必需，用于获取服务器连接信息 */
  config: string
  /** 目标版本号 - 可选，要回滚到的版本，不指定则交互式选择 */
  version?: string
}

export async function deployCommand(options: DeployOptions): Promise<void> {
  const configPath = resolve(process.cwd(), options.config)

  if (!existsSync(configPath)) {
    console.log(chalk.red(`❌ 配置文件不存在: ${configPath}`))
    console.log(chalk.yellow('💡 请创建 pcli-cd.config.js 配置文件'))
    process.exit(1)
  }

  let config: DeployConfig
  try {
    // 支持 ES 模块和 CommonJS 两种格式
    const configModule = await import(configPath)
    config = configModule.default || configModule
  } catch (error) {
    console.log(chalk.red(`❌ 配置文件读取失败: ${error}`))
    process.exit(1)
  }

  // 如果没有指定版本，询问用户或自动生成
  if (!config.version && !options.version) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'version',
        message: '请输入版本号 (例如: v1.0.0):',
        default: `v${new Date().toISOString().slice(0, 19).replace(/[-:]/g, '').replace('T', '-')}`,
        validate: (input) => input.trim() !== '' || '版本号不能为空',
      },
    ])
    config.version = answers.version
  } else {
    config.version = options.version || config.version
  }

  await deploy(config)
}

async function deploy(config: DeployConfig): Promise<void> {
  const spinner = ora()
  const tempDir = join(process.cwd(), '.deploy-temp')
  const zipPath = join(tempDir, 'build.zip')
  const version = config.version || `v${Date.now()}`
  const buildDirName = config.buildDir.split('/').pop() || 'build'

  try {
    // 1. 清理临时目录
    await fse.remove(tempDir)
    await fse.ensureDir(tempDir)

    // 2. 执行构建前命令
    if (config.beforeDeploy) {
      spinner.start('执行构建前命令...')
      for (const cmd of config.beforeDeploy) {
        await execa('bash', ['-c', cmd], { stdio: 'inherit' })
      }
      spinner.succeed('构建前命令执行完成')
    }

    // 3. 执行构建
    if (config.buildCommand) {
      spinner.start('正在构建项目...')
      await execa('bash', ['-c', config.buildCommand], { stdio: 'inherit' })
      spinner.succeed('项目构建完成')
    }

    // 4. 检查构建目录
    const buildPath = resolve(process.cwd(), config.buildDir)
    if (!existsSync(buildPath)) {
      throw new Error(`构建目录不存在: ${buildPath}`)
    }

    // 5. 压缩文件
    spinner.start('正在压缩文件...')
    await createZip(buildPath, zipPath, config.excludeFiles)
    spinner.succeed('文件压缩完成')

    // 6. 上传到服务器
    spinner.start('正在连接服务器...')
    const ssh = new NodeSSH()

    await ssh.connect({
      host: config.server.host,
      port: config.server.port || 22,
      username: config.server.username,
      password: config.server.password,
      privateKey: config.server.privateKey,
    })
    spinner.succeed('服务器连接成功')

    // 7. 创建版本目录
    const versionDirName = `${buildDirName}-${version}`
    const versionPath = join(config.server.deployPath, versionDirName)
    const currentLinkPath = join(config.server.deployPath, buildDirName)

    spinner.start('正在准备部署目录...')
    // 确保部署路径存在
    await ssh.execCommand(`mkdir -p ${config.server.deployPath}`)
    // 创建版本目录
    await ssh.execCommand(`mkdir -p ${versionPath}`)
    spinner.succeed('部署目录准备完成')

    // 8. 上传文件
    spinner.start(`正在上传文件到版本目录 ${versionDirName}...`)
    const remoteZipPath = join(versionPath, 'build.zip')
    await ssh.putFile(zipPath, remoteZipPath)
    spinner.succeed('文件上传完成')

    // 9. 在版本目录中解压
    spinner.start('正在解压文件...')
    await ssh.execCommand(`cd ${versionPath} && unzip -o build.zip && rm build.zip`)

    // 将构建目录内容移动到版本目录根部
    await ssh.execCommand(`
      cd ${versionPath} && 
      if [ -d "${buildDirName}" ]; then 
        mv ${buildDirName}/* . 2>/dev/null || true
        mv ${buildDirName}/.[!.]* . 2>/dev/null || true
        rmdir ${buildDirName} 2>/dev/null || true
      fi
    `)
    spinner.succeed('文件解压完成')

    // 10. 执行部署后命令（在新版本目录中）
    if (config.afterDeploy) {
      spinner.start('执行部署后命令...')
      for (const cmd of config.afterDeploy) {
        await ssh.execCommand(cmd, { cwd: versionPath })
      }
      spinner.succeed('部署后命令执行完成')
    }

    // 11. 原子性切换软链接
    spinner.start(`正在切换到新版本 ${version}...`)
    const tempLinkPath = `${currentLinkPath}.tmp.${Date.now()}`

    // 创建临时软链接
    await ssh.execCommand(`ln -sfn ${versionPath} ${tempLinkPath}`)
    // 原子性移动（替换）
    await ssh.execCommand(`mv ${tempLinkPath} ${currentLinkPath}`)

    spinner.succeed(`版本切换完成: ${buildDirName} -> ${versionDirName}`)

    // 12. PM2 重启
    if (config.pm2) {
      spinner.start('正在重启 PM2 应用...')
      const { appName, restart = true } = config.pm2
      if (restart) {
        // 等待一小段时间确保文件系统操作完成
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const result = await ssh.execCommand(`pm2 restart ${appName}`)
        if (result.code === 0) {
          spinner.succeed('PM2 应用重启成功')
        } else {
          // 如果重启失败，尝试启动
          const startResult = await ssh.execCommand(`pm2 start ${appName}`)
          if (startResult.code === 0) {
            spinner.succeed('PM2 应用启动成功')
          } else {
            spinner.warn('PM2 操作失败，请手动检查')
            console.log(chalk.yellow(`重启命令: pm2 restart ${appName}`))
            console.log(chalk.yellow(`启动命令: pm2 start ${appName}`))
          }
        }
      }
    }

    // 13. 清理旧版本（可选，保留最近3个版本）
    spinner.start('正在清理旧版本...')
    await cleanOldVersions(ssh, config.server.deployPath, buildDirName, 3)
    spinner.succeed('旧版本清理完成')

    ssh.dispose()

    // 14. 清理临时文件
    await fse.remove(tempDir)

    console.log(chalk.green('\n🎉 部署完成!'))
    console.log(chalk.blue(`📦 版本: ${version}`))
    console.log(chalk.blue(`🔗 当前链接: ${currentLinkPath} -> ${versionPath}`))

    if (config.pm2) {
      console.log(chalk.blue(`⚡ PM2 应用: ${config.pm2.appName}`))
      console.log(chalk.gray(`   启动文件: ${currentLinkPath}/server/index.mjs`))
    }
  } catch (error) {
    spinner.fail('部署失败')
    console.error(chalk.red(`❌ 错误: ${error}`))

    // 清理临时文件
    await fse.remove(tempDir)
    process.exit(1)
  }
}

async function createZip(
  sourcePath: string,
  outputPath: string,
  excludeFiles: string[] = [],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const output = fse.createWriteStream(outputPath)
    const archive = archiver('zip', { zlib: { level: 9 } })

    output.on('close', () => resolve())
    archive.on('error', (err: Error) => reject(err))

    archive.pipe(output)

    // 添加整个目录，排除指定文件
    archive.glob('**/*', {
      cwd: sourcePath,
      ignore: excludeFiles,
    })

    archive.finalize()
  })
}

// 清理旧版本函数
async function cleanOldVersions(
  ssh: NodeSSH,
  deployPath: string,
  buildDirName: string,
  keepCount: number,
): Promise<void> {
  try {
    // 获取所有版本目录
    const result = await ssh.execCommand(
      `find ${deployPath} -maxdepth 1 -type d -name "${buildDirName}-*" | sort -V`,
    )

    if (result.code !== 0) {
      return // 如果命令失败，跳过清理
    }

    const versionDirs = result.stdout
      .split('\n')
      .filter((dir) => dir.trim())
      .map((dir) => dir.trim())

    // 如果版本数量超过保留数量，删除旧版本
    if (versionDirs.length > keepCount) {
      const dirsToDelete = versionDirs.slice(0, -keepCount)
      for (const dir of dirsToDelete) {
        await ssh.execCommand(`rm -rf "${dir}"`)
      }
    }
  } catch (error) {
    // 清理失败不影响主流程，只记录错误
    console.warn(chalk.yellow(`⚠️ 清理旧版本时出现警告: ${error}`))
  }
}

// 导出初始化配置功能
export async function initConfig(): Promise<void> {
  console.log(chalk.blue('🚀 初始化配置文件'))

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'buildCommand',
      message: '构建命令 (如: npm run build):',
      default: 'npm run build',
    },
    {
      type: 'input',
      name: 'buildDir',
      message: '构建输出目录:',
      default: 'dist',
    },
    {
      type: 'input',
      name: 'host',
      message: '服务器地址:',
      validate: (input) => input.trim() !== '' || '请输入服务器地址',
    },
    {
      type: 'input',
      name: 'port',
      message: '服务器端口:',
      default: '22',
    },
    {
      type: 'input',
      name: 'username',
      message: '用户名:',
      validate: (input) => input.trim() !== '' || '请输入用户名',
    },
    {
      type: 'password',
      name: 'password',
      message: '密码 (留空使用私钥):',
      mask: '*',
    },
    {
      type: 'input',
      name: 'deployPath',
      message: '服务器部署路径:',
      validate: (input) => input.trim() !== '' || '请输入部署路径',
    },
    {
      type: 'input',
      name: 'pm2AppName',
      message: 'PM2 应用名称 (可选):',
    },
  ])

  const config: DeployConfig = {
    buildCommand: answers.buildCommand,
    buildDir: answers.buildDir,
    server: {
      host: answers.host,
      port: parseInt(answers.port),
      username: answers.username,
      password: answers.password || undefined,
      deployPath: answers.deployPath,
    },
    excludeFiles: [], // 空数组，让开发者根据构建产物实际情况配置
  }

  if (answers.pm2AppName) {
    config.pm2 = {
      appName: answers.pm2AppName,
      restart: true,
    }
  }

  const configContent = `// pcli-cd 部署配置文件
export default ${JSON.stringify(config, null, 2)}`

  await fse.writeFile('pcli-cd.config.js', configContent)
  console.log(chalk.green('✅ 配置文件已创建: pcli-cd.config.js'))
}

// 列出服务器上的版本
export async function listVersions(options: ListOptions): Promise<void> {
  const configPath = resolve(process.cwd(), options.config)

  if (!existsSync(configPath)) {
    console.log(chalk.red(`❌ 配置文件不存在: ${configPath}`))
    process.exit(1)
  }

  let config: DeployConfig
  try {
    // 支持 ES 模块和 CommonJS 两种格式
    const configModule = await import(configPath)
    config = configModule.default || configModule
  } catch (error) {
    console.log(chalk.red(`❌ 配置文件读取失败: ${error}`))
    process.exit(1)
  }

  const spinner = ora('正在获取版本列表...')
  spinner.start()

  try {
    const ssh = new NodeSSH()
    await ssh.connect({
      host: config.server.host,
      port: config.server.port || 22,
      username: config.server.username,
      password: config.server.password,
      privateKey: config.server.privateKey,
    })

    const buildDirName = config.buildDir.split('/').pop() || 'build'
    const currentLinkPath = join(config.server.deployPath, buildDirName)

    // 获取当前激活的版本
    const currentResult = await ssh.execCommand(`readlink ${currentLinkPath}`)
    const currentVersion =
      currentResult.code === 0
        ? currentResult.stdout.trim().split('/').pop()?.replace(`${buildDirName}-`, '') || 'unknown'
        : 'unknown'

    // 获取所有版本
    const result = await ssh.execCommand(
      `find ${config.server.deployPath} -maxdepth 1 -type d -name "${buildDirName}-*" | sort -V`,
    )

    if (result.code !== 0) {
      throw new Error('无法获取版本列表')
    }

    const versions = result.stdout
      .split('\n')
      .filter((dir) => dir.trim())
      .map((dir) => {
        const version = dir.trim().split('/').pop()?.replace(`${buildDirName}-`, '') || ''
        return {
          version,
          path: dir.trim(),
          isCurrent: version === currentVersion,
        }
      })
      .reverse() // 最新的在前面

    spinner.succeed('版本列表获取成功')

    if (versions.length === 0) {
      console.log(chalk.yellow('📦 服务器上没有找到任何版本'))
      return
    }

    console.log(chalk.blue('\n📦 已部署的版本:'))
    console.log('─'.repeat(50))

    versions.forEach((version) => {
      const prefix = version.isCurrent ? chalk.green('●') : chalk.gray('○')
      const label = version.isCurrent ? chalk.green(' (当前)') : ''
      const versionText = version.isCurrent
        ? chalk.green(version.version)
        : chalk.white(version.version)

      console.log(`${prefix} ${versionText}${label}`)
    })

    console.log('─'.repeat(50))
    console.log(chalk.gray(`总计: ${versions.length} 个版本`))

    ssh.dispose()
  } catch (error) {
    spinner.fail('获取版本列表失败')
    console.error(chalk.red(`❌ 错误: ${error}`))
    process.exit(1)
  }
}

// 回滚到指定版本
export async function rollbackVersion(options: RollbackOptions): Promise<void> {
  const configPath = resolve(process.cwd(), options.config)

  if (!existsSync(configPath)) {
    console.log(chalk.red(`❌ 配置文件不存在: ${configPath}`))
    process.exit(1)
  }

  let config: DeployConfig
  try {
    // 支持 ES 模块和 CommonJS 两种格式
    const configModule = await import(configPath)
    config = configModule.default || configModule
  } catch (error) {
    console.log(chalk.red(`❌ 配置文件读取失败: ${error}`))
    process.exit(1)
  }

  const buildDirName = config.buildDir.split('/').pop() || 'build'

  // 如果没有指定版本，列出版本让用户选择
  let targetVersion = options.version
  if (!targetVersion) {
    const ssh = new NodeSSH()
    await ssh.connect({
      host: config.server.host,
      port: config.server.port || 22,
      username: config.server.username,
      password: config.server.password,
      privateKey: config.server.privateKey,
    })

    const result = await ssh.execCommand(
      `find ${config.server.deployPath} -maxdepth 1 -type d -name "${buildDirName}-*" | sort -V`,
    )

    if (result.code !== 0) {
      console.log(chalk.red('❌ 无法获取版本列表'))
      process.exit(1)
    }

    const versions = result.stdout
      .split('\n')
      .filter((dir) => dir.trim())
      .map((dir) => dir.trim().split('/').pop()?.replace(`${buildDirName}-`, '') || '')
      .filter(Boolean)
      .reverse()

    if (versions.length === 0) {
      console.log(chalk.yellow('📦 服务器上没有找到任何可回滚的版本'))
      ssh.dispose()
      return
    }

    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'version',
        message: '选择要回滚到的版本:',
        choices: versions,
      },
    ])

    targetVersion = answers.version
    ssh.dispose()
  }

  if (!targetVersion) {
    throw new Error('未指定回滚版本')
  }

  await performRollback(config, targetVersion, buildDirName)
}

// 执行回滚操作
async function performRollback(
  config: DeployConfig,
  targetVersion: string,
  buildDirName: string,
): Promise<void> {
  const spinner = ora()

  try {
    spinner.start('正在连接服务器...')
    const ssh = new NodeSSH()

    await ssh.connect({
      host: config.server.host,
      port: config.server.port || 22,
      username: config.server.username,
      password: config.server.password,
      privateKey: config.server.privateKey,
    })
    spinner.succeed('服务器连接成功')

    const versionDirName = `${buildDirName}-${targetVersion}`
    const versionPath = join(config.server.deployPath, versionDirName)
    const currentLinkPath = join(config.server.deployPath, buildDirName)

    // 检查目标版本是否存在
    spinner.start('正在检查目标版本...')
    const checkResult = await ssh.execCommand(`test -d ${versionPath}`)
    if (checkResult.code !== 0) {
      throw new Error(`版本 ${targetVersion} 不存在`)
    }
    spinner.succeed('目标版本检查通过')

    // 原子性切换软链接
    spinner.start(`正在回滚到版本 ${targetVersion}...`)
    const tempLinkPath = `${currentLinkPath}.tmp.${Date.now()}`

    // 创建临时软链接
    await ssh.execCommand(`ln -sfn ${versionPath} ${tempLinkPath}`)
    // 原子性移动（替换）
    await ssh.execCommand(`mv ${tempLinkPath} ${currentLinkPath}`)

    spinner.succeed(`回滚完成: ${buildDirName} -> ${versionDirName}`)

    // 重启 PM2
    if (config.pm2) {
      spinner.start('正在重启 PM2 应用...')
      const { appName } = config.pm2

      // 等待一小段时间确保文件系统操作完成
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const result = await ssh.execCommand(`pm2 restart ${appName}`)
      if (result.code === 0) {
        spinner.succeed('PM2 应用重启成功')
      } else {
        spinner.warn('PM2 重启失败，请手动检查')
        console.log(chalk.yellow(`手动重启命令: pm2 restart ${appName}`))
      }
    }

    ssh.dispose()

    console.log(chalk.green('\n🎉 回滚完成!'))
    console.log(chalk.blue(`📦 当前版本: ${targetVersion}`))
    console.log(chalk.blue(`🔗 当前链接: ${currentLinkPath} -> ${versionPath}`))

    if (config.pm2) {
      console.log(chalk.blue(`⚡ PM2 应用: ${config.pm2.appName}`))
    }
  } catch (error) {
    spinner.fail('回滚失败')
    console.error(chalk.red(`❌ 错误: ${error}`))
    process.exit(1)
  }
}
