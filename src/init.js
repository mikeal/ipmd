import { promises as fs } from 'fs'
import prompt from 'prompt-promise'
import dagdb from '../../dagdb/src/index.js'

const stat = async (filename, dest) => {
  let local = null
  try {
    local = await fs.stat(dest)
  } catch (e) {
    if (e.code !== 'ENOENT') throw new Error(e)
  }
  const base = await fs.stat(filename)
  return [ local, base ]
}

const loadAuth = async cwd => {
  let info
  if (!process.env.GITHUB_TOKEN) {
    const authfile = cwd + '/' + '.auth'
    try {
      info = await fs.stat(authfile)
    } catch (e) {
      if (e.code !== 'ENOENT') throw e
      const token = await prompt('GitHub Personal Access Token:')
      prompt.finish()
      console.log('write .auth')
      await fs.writeFile(authfile, JSON.stringify({GITHUB_TOKEN: token}))
    }
    const buff = await fs.readFile(authfile)
    process.env.GITHUB_TOKEN = JSON.parse(buff.toString()).GITHUB_TOKEN
  }
}

const createDatabase = async cwd => {
  let info
  try {
    info = await fs.stat(cwd + '/' + '.git')
  } catch (e) {
    if (e.code !== 'ENOENT') throw e
    throw new Error('Target directory must be the top level of a git repository')
  }
  await loadAuth(cwd)
  const db = await dagdb.create('github-action')
}

const init = async argv => {
  const { cwd } = argv
  await createDatabase(cwd)
  const files = await fs.readdir(new URL('./init-files', import.meta.url))
  const writeFiles = (files, dist) => {
    const writeFile = async filename => {
      const url = new URL('./init-files/' + filename, import.meta.url)
      const dest = dist + '/' + filename
      const [ local, base ] = await stat(url, dest)
      if (base.isDirectory()) {
        if (!local) await mkdirp(dest)
        const _files = await fs.readdir(url)
        return writeFiles(_files.map(f => filename + '/' + f))
      } else {
        if (local) return console.log('skipping, already exits:', filename)
        console.log('write', filename)
        return fs.copyFile(url, dest)
      }
    }
    return Promise.all(files.map(f => writeFile(f)))
  }
  return writeFiles(files, cwd)
}

export default init
