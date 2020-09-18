#!/usr/bin/env node
import yargs from 'yargs'
import st from 'st'
import http from 'http'
import { hideBin } from 'yargs/helpers'
import { build } from './src/index.js'

const testOptions = yargs => {
  yargs.option('dev', {
    description: 'Run dev server after running the test.'
  })
}

const mkhandler = async (cmd, argv) => {
  await cmd(argv)
  if (argv.dev) {
   http.createServer(st({ path: process.cwd(), cache: false, cors: true })).listen(8080, () => {
      console.log('listening http://localhost:8080')
    })
  }
}

yargs(hideBin(process.argv))
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
.help()
.argv
