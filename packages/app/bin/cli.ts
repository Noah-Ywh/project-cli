import { env, cwd, argv } from 'node:process'

import { execa } from 'execa'
import chalk from 'chalk'
import ora from 'ora'
import semver from 'semver'
import { Command } from 'commander'

import { getPkg, checkNodeVersion, boxenLog } from '../src/utils'

const pkg = getPkg('../../package.json', import.meta.url)

checkNodeVersion(pkg.engines.node, '@noahyu/project-cli')

const updateCli = async () => {
  const spinner = ora('Loading...\n').start()

  setTimeout(() => {
    spinner.color = 'yellow'
    spinner.text = '检查更新...\n'
  }, 1000)

  let latestVersion
  try {
    const version = await execa('npm', ['view', '@noahyu/project-cli', 'version'], {
      cwd: cwd(),
    })
    latestVersion = version.stdout
  } catch {
    spinner.fail('更新失败，在 npm 上找不到 @noahyu/project-cli')
    console.log(`${chalk.yellow('→')} 请自行更新在其他包管理器安装的 @noahyu/project-cli`)
    console.log(`${chalk.yellow('→')} 当前版本：${pkg.version}`)
    return
  }

  if (semver.satisfies(pkg.version, latestVersion, { includePrerelease: true })) {
    spinner.succeed('已经是最新版本')
    return
  }

  spinner.text = '正在更新...\n'
  await execa('npm', ['install', '@noahyu/project-cli@latest', '-g'], { cwd: cwd() })
  const { stdout: version } = await execa('pcli', ['-v'], { cwd: cwd() })
  spinner.succeed(`已更新，当前版本：${version}`)
}

const program = new Command()
program.version(pkg.version, '-v, --version').usage('<command> [options]')

program
  .name('pcli')
  .command('create <app-name>')
  .description(chalk.yellow('创建新项目'))
  .action(async (name: string) => {
    boxenLog(
      `
  Project CLI

  GitHub: ${chalk.cyanBright('https://github.com/Noah-Ywh/project-cli')}
      `,
      {
        borderColor: '#0bc39d',
        borderStyle: 'round',
        padding: 1,
        margin: 1,
        textAlignment: 'left',
      },
    )

    await updateCli()

    console.log(`${chalk.yellow('→')} 继续...\n`)

    env.CLI_VERSION = pkg.version
    const create = (await import('../src/create')).default
    create(name)
  })

program.parse(argv)
