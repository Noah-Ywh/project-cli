# 组合式函数

> 利用 Vue 的组合式 API 或 Nuxt API 来封装和复用有状态逻辑的函数

| 组合式函数              | 简介                           |
| ----------------------- | ------------------------------ |
| [useResize](#useresize) | 动态获取窗口可视区域的宽/高    |
| [useScroll](#usescroll) | 动态获取滚动条位置以及滚动方向 |

## `useResize`

动态获取窗口可视区域的宽度和高度

```ts
const { clientWidth, clientHeight } = useResize()
```

| 值             | 类型     | 说明               |
| -------------- | -------- | ------------------ |
| `clientWidth`  | `number` | 窗口可视区域的宽度 |
| `clientHeight` | `number` | 窗口可视区域的高度 |

## `useScroll`

动态获取页面滚动条位置以及滚动方向

```ts
const { scrollTop, scrollWheel } = useScroll()
```

| 值            | 类型                | 说明                     |
| ------------- | ------------------- | ------------------------ |
| `scrollTop`   | `number`            | 页面滚动条距离顶部的距离 |
| `scrollWheel` | `'top' \| 'bottom'` | 滚动方向                 |
