import fse from 'fs-extra'
import parseJson from 'parse-json'

type Package = {
  name: string
  version: string
  engines: {
    node: string
    pnpm: string
  }
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export const getPkg = (path: string, baseUrl: string) => {
  const pkgPath = new URL(path, baseUrl)

  let pkgJson
  try {
    pkgJson = fse.readFileSync(pkgPath, 'utf-8')
  } catch (err) {
    throw new Error(`The package.json file at '${pkgPath}' does not exist`)
  }

  let pkgObj
  try {
    pkgObj = parseJson(pkgJson)
  } catch (err) {
    throw new Error('The package.json is malformed')
  }

  return pkgObj as Package
}
