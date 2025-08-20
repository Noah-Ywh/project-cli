import { program } from 'commander'
import { deployCommand, initConfig, listVersions, rollbackVersion } from '../src'

program.version('1.0.0').description('Simple CI/CD deployment tool')

program
  .command('deploy')
  .alias('cd')
  .description('Build and deploy project to server')
  .option('-c, --config <config>', 'Configuration file path', './pcli-cd.config.js')
  .option('-v, --version <version>', 'Specify version number')
  .action(deployCommand)

program.command('init').description('Initialize CD configuration file').action(initConfig)

program
  .command('list')
  .alias('ls')
  .description('List deployed versions on server')
  .option('-c, --config <config>', 'Configuration file path', './pcli-cd.config.js')
  .action(listVersions)

program
  .command('rollback')
  .alias('rb')
  .description('Rollback to a previous version')
  .option('-c, --config <config>', 'Configuration file path', './pcli-cd.config.js')
  .option('-v, --version <version>', 'Version to rollback to')
  .action(rollbackVersion)

program.parse(process.argv)
