import fse from 'fs-extra'
import parseJson from 'parse-json'

type PackageJson = {
  name?: string
  version?: string
  [key: string]: unknown
}

/** 获取版本号 */
export function getVersion(path: string, baseUrl: string) {
  const packageJsonPath = new URL(path, baseUrl)

  let packageJsonContent: string
  try {
    packageJsonContent = fse.readFileSync(packageJsonPath, 'utf-8')
  } catch {
    throw new Error(`无法找到 package.json 文件：${packageJsonPath}`)
  }

  let packageData: PackageJson
  try {
    packageData = parseJson(packageJsonContent)
  } catch {
    throw new Error('package.json 文件格式错误，请检查 JSON 语法')
  }

  if (!packageData.version) {
    throw new Error('package.json 中缺少 version 字段')
  }

  return packageData.version || '0.0.0'
}
