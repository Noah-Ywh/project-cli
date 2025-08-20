import { exit, version } from 'node:process'

import semver from 'semver'
import chalk from 'chalk'

export const checkNodeVersion = (nodeVersion: string, packageName: string) => {
  if (!semver.satisfies(version, nodeVersion, { includePrerelease: true })) {
    console.log(chalk.red(`你的Node版本为:${version},${packageName}需要Node${nodeVersion}.`))
    exit(1)
  }
}
