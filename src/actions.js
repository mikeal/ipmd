import { build } from './index.js'

const cwd = process.cwd()

const push = async () => {
  const opts = { source: cwd, dist: cwd + '/dist' }
  await build(opts)
}

const cron = async () => {
}

export { push, cron }
