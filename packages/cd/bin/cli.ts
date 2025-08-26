import { program } from 'commander'
import { deployCommand, initConfig, listVersions, rollbackVersion } from '../src'
import { getVersion } from '../src/utils/get-version'

program
  .version(getVersion('../../package.json', import.meta.url), '-v, --version')
  .description('Simple CI/CD deployment tool')

program
  .command('deploy')
  .alias('cd')
  .description('Build and deploy project to server')
  .option('-c, --config <config>', 'Configuration file path', './pcli-cd.config.js')
  .option('-v, --version <version>', 'Specify version number')
  .option(
    '-n, --name <name>',
    'Specify deployment environment name (dev, prod, staging, etc.). If not specified, will prompt to select interactively',
  )
  .action(deployCommand)

program.command('init').description('Initialize CD configuration file').action(initConfig)

program
  .command('list')
  .alias('ls')
  .description('List deployed versions on server')
  .option('-c, --config <config>', 'Configuration file path', './pcli-cd.config.js')
  .option(
    '-n, --name <name>',
    'Specify environment name to list (dev, prod, staging, etc.). If not specified, will prompt to select interactively',
  )
  .action(listVersions)

program
  .command('rollback')
  .alias('rb')
  .description('Rollback to a previous version')
  .option('-c, --config <config>', 'Configuration file path', './pcli-cd.config.js')
  .option('-v, --version <version>', 'Version to rollback to')
  .option(
    '-n, --name <name>',
    'Specify environment name to rollback (dev, prod, staging, etc.). If not specified, will prompt to select interactively',
  )
  .action(rollbackVersion)

program.parse(process.argv)
