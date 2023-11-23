import { cwd } from 'node:process'
import { relative, resolve } from 'node:path'
import { existsSync, rmSync, mkdirSync } from 'node:fs'

import { execa } from 'execa'
import chalk from 'chalk'

import inquirer from 'inquirer'
import validateProjectName from 'validate-npm-package-name'

import { deps } from './deps'
import { generator } from './render'

async function create(projectName: string) {
  const inCurrent = projectName === '.' // 是否当前目录
  const FINAL_PROJECT_NAME = inCurrent ? relative('../', cwd()) : projectName // 项目名称
  const targetDir = resolve(cwd(), projectName) // 项目根目录的绝对路径

  const result = validateProjectName(FINAL_PROJECT_NAME)

  if (!result.validForNewPackages) {
    console.error(chalk.red(`无效的项目名称: "${FINAL_PROJECT_NAME}"`))
    result.errors &&
      result.errors.forEach((err) => {
        console.error(chalk.red.dim(`Error: ${err}`))
      })
    result.warnings &&
      result.warnings.forEach((warn) => {
        console.error(chalk.red.dim(`Warning: ${warn}`))
      })
    return
  }

  /** 检查路径是否存在
   * -------------------------- */
  if (existsSync(targetDir)) {
    if (inCurrent) {
      const { currentDir } = await inquirer.prompt([
        {
          name: 'currentDir',
          type: 'confirm',
          message: '把当前工作目录设为项目根目录(该选项将合并当前目录下的文件/文件夹)',
        },
      ])
      if (!currentDir) {
        console.error(chalk.red('请输入合法的: <app-name>'))
        return
      }
    } else {
      const { handleDir } = await inquirer.prompt([
        {
          name: 'handleDir',
          type: 'list',
          message: `当前工作路径下已存在 ${FINAL_PROJECT_NAME} 目录: `,
          choices: [
            { name: '覆盖', value: 'overwrite' },
            { name: '取消', value: false },
          ],
        },
      ])
      if (!handleDir) {
        console.error(chalk.red('请输入合法的: <app-name>'))
        return
      } else if (handleDir === 'overwrite') {
        rmSync(targetDir, { recursive: true })
        mkdirSync(FINAL_PROJECT_NAME)
      }
    }
  }

  const options = {
    name: FINAL_PROJECT_NAME,
    targetDir: targetDir,
    framework: '',
    description: '',
    manager: '',
    module: [],
  }
  const answers = await inquirer.prompt([
    {
      name: 'framework',
      type: 'list',
      message: 'Select a framework:',
      default: 'vue',
      choices: [
        { name: 'Vue.js', value: 'vue' },
        { name: 'Nuxt.js', value: 'nuxt' },
        { name: 'Nest.js', value: 'nest' },
      ],
    },
    {
      name: 'description',
      type: 'input',
      message: 'Project description:',
    },
    {
      name: 'manager',
      type: 'list',
      message: 'Select a package manager:',
      default: 'pnpm',
      choices: [
        { name: 'pnpm', value: 'pnpm' },
        { name: 'npm', value: 'npm' },
      ],
    },
    {
      name: 'module',
      type: 'checkbox',
      message: 'Select required modules:',
      choices: deps,
    },
  ])

  Object.assign(options, answers)

  generator(options)

  // await execa('git', ['init'], { cwd: options.targetDir })

  await execa(`${options.manager}`, ['install'], {
    cwd: options.targetDir,
    stdio: 'inherit',
  })

  if (options.manager !== 'pnpm') {
    options.module.forEach((deps) => {
      console.log(deps)
    })
    // await execa(`${options.manager}`, ['add'], {
    //   cwd: options.targetDir,
    //   stdio: 'inherit',
    // })
  }

  await execa(`${options.manager}`, ['run', 'lint'], {
    cwd: options.targetDir,
    stdio: 'inherit',
  })
}

export default create
