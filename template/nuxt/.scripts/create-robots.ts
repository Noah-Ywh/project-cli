import { writeFileSync, unlinkSync, accessSync, constants } from 'node:fs'

const robotsTest = `User-agent: *
Disallow: /
`

const robotsProd = `User-agent: *
Disallow: /member/*
`

export const createRobots = (env: string) => {
  try {
    accessSync('public/robots.txt', constants.F_OK)
    unlinkSync('public/robots.txt')
  } catch (err) {
    console.log('create robots.txt')
  }
  if (env === 'test') {
    writeFileSync('public/robots.txt', robotsTest, 'utf-8')
  } else if (env === 'prod') {
    writeFileSync('public/robots.txt', robotsProd, 'utf-8')
  }
}

export const removeRobots = () => {
  try {
    accessSync('public/robots.txt', constants.F_OK)
    unlinkSync('public/robots.txt')
    console.log('remove robots.txt')
  } catch (err) {
    console.log('robots.txt does not exist')
  }
}
