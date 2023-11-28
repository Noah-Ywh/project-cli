import { join, dirname, extname, basename } from 'node:path'

import fse from 'fs-extra'
import ejs from 'ejs'
import { globbySync } from 'globby'
import parseJson from 'parse-json'

import { getRootDir } from './utils'

import { Options } from '../types'

interface FilePathList {
  /**模板文件路径 */
  templateFilePath: string

  /**项目文件路径 */
  targetFilePaht: string
}
type Deps = Record<string, string>

/** 排除的文件类型 */
const extnameList = ['.png', '.jpg', '.ico', '.svg']

/** 排序
 * @function combDeps 对依赖进行排序
 * @returns {DepsList} 返回排序后的依赖列表
 * -------------------------- */
const combDeps = (depsList: Deps): Deps => {
  const deps: Deps = {}
  const depsNameList = Object.keys(depsList).sort()
  depsNameList.forEach((depsName) => {
    deps[depsName] = depsList[depsName]
  })
  return deps
}

/**
 * 渲染
 * @param {Array<FilePathList>} filePathList 文件路径集合
 * @param {Options} options 用户选项
 * -------------------------- */
const render = (filePathList: Array<FilePathList>, options: Options): void => {
  filePathList.forEach((filePathItem) => {
    // 项目文件路径
    const targetPath = join(options.targetDir, filePathItem.targetFilePaht)

    // 创建目录
    fse.ensureDirSync(join(options.targetDir, dirname(filePathItem.targetFilePaht)))

    // 如果文件类型是 extnameList 中的其中一项，则采用 base64 格式写入
    if (extnameList.includes(extname(filePathItem.templateFilePath))) {
      // 获取模板文件数据
      const originBuffer = fse.readFileSync(filePathItem.templateFilePath)
      try {
        fse.writeFileSync(targetPath, originBuffer, 'base64')
      } catch (err) {
        console.log(err)
      }
    } else {
      ejs.renderFile(filePathItem.templateFilePath, options, {}, (err, str) => {
        if (basename(targetPath) === 'package.json') {
          const pkg = parseJson(str)
          const dependencies: Deps = {}
          const devDependencies: Deps = {}

          options.module.forEach((deps) => {
            if (deps.dev) {
              devDependencies[deps.name] = deps.version
            } else {
              dependencies[deps.name] = deps.version
            }
          })

          Object.assign(pkg.dependencies as Deps, dependencies)
          Object.assign(pkg.devDependencies as Deps, devDependencies)

          pkg.dependencies = combDeps(pkg.dependencies as Deps)
          pkg.devDependencies = combDeps(pkg.devDependencies as Deps)
          str = JSON.stringify(pkg, null, 2)
        }
        try {
          // 写入文件
          fse.writeFileSync(targetPath, str)
        } catch {
          console.log(err)
        }
      })
    }
  })
}

export const generator = (options: Options): void => {
  // 模板目录
  const templateDir = join(getRootDir(), `../template/${options.framework}`)

  // 模板文件路径列表
  const templateFilePathList = globbySync(['**/*'], { cwd: templateDir, dot: true })

  const filePathList = templateFilePathList.map((item) => {
    // 模板文件路径
    const templateFilePath = join(templateDir, item)

    // 项目文件路径
    const targetFilePaht = item.replace(/^_?/, '')

    return { templateFilePath, targetFilePaht }
  })

  render(filePathList, options)
}
