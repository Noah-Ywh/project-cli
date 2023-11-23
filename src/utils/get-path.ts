import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/** 返回 cli-template 目录路径
 * -------------------------- */
export const getRootDir = (): string => {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const ROOT_DIR = join(__dirname, '../../')
  return ROOT_DIR
}
