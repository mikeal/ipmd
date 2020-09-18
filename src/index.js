import { promises as fs } from 'fs'
import { resolve } from 'path'
import mkdirp from 'mkdirp'
import fm from 'yaml-front-matter'
import showdown from 'showdown'
import sanitize from 'sanitize-html'

sanitize.defaults.allowedTags = [
  'h1',
  'h2',
  ...sanitize.defaults.allowedTags
]

const attrs = [ 'id' ]

sanitize.defaults.allowedAttributes = {
  h1: attrs,
  h2: attrs,
  h3: attrs,
  h4: attrs,
  h5: attrs,
  h6: attrs,
  ...sanitize.defaults.allowedAttributes
}

const markdown = str => {
  const converter = new showdown.Converter()
  return converter.makeHtml(str)
}

const md = filename => filename.endsWith('.md')

const tree = async function * (path, dist, filter=md) {
  path = path.toString()
  if (path === 'node_modules' || path.endsWith('/node_modules') ||
      path.startsWith(dist)) {
    return
  }
  const stat = await fs.stat(path)
  if (stat.isDirectory()) {
    for (const filename of await fs.readdir(path)) {
      if (filename.startsWith('.')) continue
      yield * tree(path + '/' + filename, dist)
    }
  } else {
    if (filter(path)) yield path
  }
}

const build = async argv => {
  let { source, dist } = argv
  source = resolve(source)
  dist = resolve(dist)
  for await (let filename of tree(source, dist)) {
    const buff = await fs.readFile(filename)
    filename = dist + '/' + filename.slice(source.length + 1)
    if (filename.endsWith('README.md')) {
      filename = filename.slice(0, filename.length - 'README.md'.length) + 'index.html'
    } else {
      filename = filename.slice(0, filename.length - '.md'.length) + '.html'
    }
    await mkdirp(filename.slice(0, filename.lastIndexOf('/')))
    const parsed = fm.safeLoadFront(buff)
    console.log(markdown(parsed.__content))
    const html = sanitize(markdown(parsed.__content))
    await fs.writeFile(filename, html)
  }
}

export { tree, build }
