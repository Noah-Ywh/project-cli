import fse from 'fs-extra'
import parseJson from 'parse-json'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

type PackageJson = {
  name?: string
  version?: string
  [key: string]: unknown
}

/** 获取版本号 */
export function getVersion() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const packageJsonPath = join(__dirname, '../../package.json')

  let packageJsonContent: string
  try {
    packageJsonContent = fse.readFileSync(packageJsonPath, 'utf-8')
  } catch {
    throw new Error(`无法找到 package.json 文件：${packageJsonPath}`)
  }

  let packageData: PackageJson
  try {
    packageData = parseJson(packageJsonContent) as PackageJson
  } catch {
    throw new Error('package.json 文件格式错误，请检查 JSON 语法')
  }

  if (!packageData.version) {
    throw new Error('package.json 中缺少 version 字段')
  }

  return packageData.version || '0.0.0'
}
