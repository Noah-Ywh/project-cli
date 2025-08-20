import boxen from 'boxen'
import chalk from 'chalk'

interface Options {
  /** 边框颜色
   *  可使用十六进制格式：'#ff0000'
   * -------------------------- */
  borderColor?:
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'magenta'
    | 'cyan'
    | 'white'
    | 'gray'
    | string

  /** 边框样式
   *  可自定义符号
   * -------------------------- */
  borderStyle?:
    | 'single'
    | 'double'
    | 'round'
    | 'bold'
    | 'singleDouble'
    | 'doubleSingle'
    | 'classic'
    | 'arrow'
    | {
        topLeft: string
        topRight: string
        bottomLeft: string
        bottomRight: string
        top: string
        bottom: string
        left: string
        right: string
      }

  /** 是否减少边框的不透明度
   * -------------------------- */
  dimBorder?: boolean

  /** 在上边框显示一个标题
   * -------------------------- */
  title?: string

  /** 在上边框标题的对齐方式
   * -------------------------- */
  titleAlignment?: 'left' | 'center' | 'right'

  /** 设置固定宽度
   * -------------------------- */
  width?: number

  /** 设置固定高度
   * -------------------------- */
  height?: number

  /** 是否占满终端所有可用空间
   *  也可传入回调函数进行控制尺寸
   * -------------------------- */
  fullscreen?: boolean | ((width: number, height: number) => [width: number, height: number])

  /** 控制内边距
   * -------------------------- */
  padding?: number | { top: number; right: number; bottom: number; left: number }

  /** 控制外边距
   * -------------------------- */
  margin?: number | { top: number; right: number; bottom: number; left: number }

  /** 在终端可用空间内的浮动方式
   * -------------------------- */
  float?: 'left' | 'center' | 'right'

  /** 背景色
   * -------------------------- */
  backgroundColor?:
    | 'black'
    | 'red'
    | 'green'
    | 'yellow'
    | 'blue'
    | 'magenta'
    | 'cyan'
    | 'white'
    | 'gray'
    | string

  /** 文本对齐方式
   * -------------------------- */
  textAlignment?: 'left' | 'center' | 'right'
}

export const boxenLog = (text: string, options?: Options) => {
  console.log(boxen(text, options || {}))
}

export const logger = {
  info: (text: string) => {
    console.log(`${chalk.cyanBright('[INFO]')} ${text}`)
  },
}
