interface Deps {
  /** 包名称 */
  name: string
  /** 定义 */
  value: {
    /** 包名称 */
    name: string
    /** 包版本 */
    version: string
    /** 是否开发依赖 */
    dev: boolean
  }
}

export const deps: Deps[] = [
  {
    name: 'sass',
    value: {
      name: 'sass',
      version: '^1.63.6',
      dev: true,
    },
  },
]
