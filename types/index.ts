export interface Options {
  /** 项目名称 */
  name: string
  /** 项目路径 */
  targetDir: string
  /** 框架类型 */
  framework: string
  /** 项目描述 */
  description: string
  /** 包管理器 */
  manager: string
  /** 自选依赖 */
  module: Array<{
    name: string
    version: string
    dev: boolean
  }>
}
