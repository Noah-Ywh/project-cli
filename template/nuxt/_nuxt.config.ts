/* global defineNuxtConfig */
// https://nuxt.com/docs/api/configuration/nuxt-config
import { createRobots, removeRobots } from './_scripts/create-robots'
import { zhCN } from './_config/locale'
export default defineNuxtConfig({
  app: {
    head: {
      title: '<%= description %>',
      htmlAttrs: {
        lang: 'zh-cn',
      },
      meta: [
        { charset: 'utf-8' },
        {
          hid: 'description',
          name: 'description',
          content: '<%= description %>',
        },
        {
          hid: 'keywords',
          name: 'keywords',
          content: '<%= description %>',
        },
        { name: 'format-detection', content: 'telephone=no' },
        {
          hid: 'robots',
          name: 'robots',
          content: process.env.NUXT_ENV_MODE === 'test' ? 'none' : 'all',
        },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },
  css: ['primevue/resources/themes/lara-light-teal/theme.css'],
  modules: [
    [
      '@spruce-hub/nuxt-fetch',
      {
        '/api': {
          pathRewrite: {
            '^/api': '/api',
          },
          apiHostEnv: 'API_HOST',
          apiHostUrl: 'http://example.api.com/',
          cookieName: 'access_token',
        },
      },
    ],
    [
      '@spruce-hub/nuxt-route',
      {
        authPath: ['/account/'],
        loginPath: '/login',
        cookieName: 'access_token',
        excludePath: ['/login', '/register'],
      },
    ],
    [
      'nuxt-primevue',
      {
        /** 组件前缀 */
        components: {
          prefix: 'Prime',
        },
        /** 主要配置 */
        options: {
          /** 开启波纹 */
          ripple: true,
          /** 配置语言环境 */
          locale: {
            ...zhCN,
          },
        },
      },
    ],
  ],
  plugins: [],
  devServer: {
    port: 3000,
  },
  experimental: {
    asyncContext: true,
  },
  hooks: {
    'build:before': () => {
      if (process.env.NODE_ENV !== 'development') {
        createRobots(process.env.NUXT_ENV_MODE || '')
      }
    },
    'build:error': () => {
      removeRobots()
    },
    'nitro:build:public-assets': () => {
      removeRobots()
    },
  },
})
