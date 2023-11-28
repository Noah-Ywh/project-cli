/** 通用返回类型 (/hm) */
interface ApiRes {
  /** 响应类型 */
  success: boolean
  /** 响应状态码 */
  code: number
  /** 响应信息 */
  message: string
  /** 响应错误 */
  error: []
}

interface HttpError {
  /** http 状态码 */
  statusCode: number
  /** http 状态信息 */
  statusMessage: string
  /** 触发栈 */
  stack: string
}

/** 深层递归所有字段修改为可选 */
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Array<infer U>
      ? Array<DeepPartial<U>>
      : DeepPartial<T[K]>
    : T[K]
}
