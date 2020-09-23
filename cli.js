#!/usr/bin/env node
import yargs from 'yargs'
import st from 'st'
import http from 'http'
import init from './src/init.js'
import { hideBin } from 'yargs/helpers'
import { push, cron } from './src/actions.js'
import { build } from './src/index.js'

const testOptions = yargs => {
  yargs.option('dev', {
    description: 'Run dev server after running the test.'
  })
}

const initOptions = yargs => {
  yargs.positional('cwd', {
    description: 'Directory to initialize in',
    default: process.cwd()
  })
}

const mkhandler = async (cmd, argv) => {
  await cmd(argv)
  if (argv.dev) {
    http.createServer(st({ path: argv.dist, index: true, cache: false, cors: true })).listen(8080, () => {
      console.log('listening http://localhost:8080')
    })
  }
}

// eslint-disable-next-line
yargs(hideBin(process.argv))
  .command('init [cwd]', 'Initialize intersite.', initOptions, init)
  .command('build [source] [dist]', 'Various test commands', yargs => {
    yargs.positional('source', {
      description: 'Directory to build site from',
      default: process.cwd()
    })
    yargs.positional('dist', {
      description: 'Directory to write html',
      default: 'dist'
    })
    testOptions(yargs)
  }, argv => mkhandler(build, argv))
  .command('action', 'GitHub Actions', yargs => {
    yargs.command('push', 'Action for "push" event', () => {}, push)
    yargs.command('cron', 'Action for regular interval', () => {}, cron)
  })
  .help()
  .argv
