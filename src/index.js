import { promises as fs } from 'fs'
import { resolve } from 'path'
import pretty from 'pretty'
import dagdb from '../../dagdb/src/index.js'
import mkdirp from 'mkdirp'
import fm from 'yaml-front-matter'
import * as templates from './templates.js'
import fixed from 'fixed-chunker'

const md = filename => filename.endsWith('.md')

const ignore = [
  'node_modules',
  'package.json',
  'package-lock.json',
  'blockstore.ipld-lfs'
]

const tree = async function * (path, dist, orig, filter = md) {
  path = path.toString()
  for (const filename of ignore) {
    if (path === filename || path.endsWith('/' + filename)) return
  }
  if (path.startsWith(dist)) return
  const stat = await fs.stat(path)
  const promises = []
  if (stat.isDirectory()) {
    for (const filename of await fs.readdir(path)) {
      if (filename.startsWith('.')) continue
      yield * tree(path + '/' + filename, dist, orig)
    }
  } else {
    if (filter(path)) yield path
    else {
      const source = path
      const dest = dist + '/' + source.slice(orig.length + 1)
      const p = mkdirp(dest.slice(0, dest.lastIndexOf('/'))).then(() => {
        console.log('copy', dest)
        return fs.copyFile(source, dest)
      })
      promises.push(p)
    }
  }
  await Promise.all(promises)
}

const writeHTML = async (dist, key, parsed) => {
  let filename = dist + '/' + key
  if (filename.endsWith('README.md')) {
    filename = filename.slice(0, filename.length - 'README.md'.length) + 'index.html'
  } else {
    filename = filename.slice(0, filename.length - '.md'.length) + '.html'
  }
  await mkdirp(filename.slice(0, filename.lastIndexOf('/')))
  const html = await templates.page(parsed)
  console.log('write', filename)
  await fs.writeFile(filename, pretty(html.toString()))
}

const writeDefaults = dist => {
  const files = ['app.js', 'style.css']
  return Promise.all(files.map(f => {
    const url = new URL('../' + f, import.meta.url)
    console.log('seed', dist + '/' + f)
    return fs.copyFile(url, dist + '/' + f)
  }))
}

const toIter = buff => fixed(Object.values([buff]), 1024 * 1000)

const build = async argv => {
  let db = await dagdb.create('inmem')
  let { source, dist } = argv
  await mkdirp(dist)
  source = resolve(source)
  dist = resolve(dist)
  await writeDefaults(dist)
  let promises = []
  for await (const filename of tree(source, dist, source)) {
    const buff = await fs.readFile(filename)
    const key = filename.slice(source.length + 1)
    const parsed = fm.safeLoadFront(buff)
    parsed.__content = toIter(Buffer.from(parsed.__content))
    promises.push(db.set(key, parsed))
  }
  await Promise.all(promises)
  db = await db.update()
  promises = []
  for await (const [key, value] of db.all()) {
    promises.push(writeHTML(dist, key, value))
  }
  await Promise.all(promises)
}

export { tree, build }
