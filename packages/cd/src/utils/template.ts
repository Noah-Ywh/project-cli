import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import ejs from 'ejs'

/**
 * 渲染配置文件模板
 * @param templateData 模板数据
 * @returns 渲染后的配置文件内容
 */
export function renderConfigTemplate(templateData: {
  envName: string
  buildCommand: string
  buildDir: string
  host: string
  port: string
  username: string
  privateKeyPath?: string
  deployPath: string
  pm2AppName?: string
}): string {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const templatePath = join(__dirname, '../templates/config.ejs')

  try {
    const templateContent = readFileSync(templatePath, 'utf-8')
    return ejs.render(templateContent, templateData)
  } catch (error) {
    throw new Error(`模板渲染失败: ${error}`)
  }
}
