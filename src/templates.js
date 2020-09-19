import sanitize from 'sanitize-html'
import showdown from 'showdown'
import html from 'nanohtml'
import raw from 'nanohtml/raw.js'

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

const head = (title, base) => html`
  <head>
    <meta charset="utf-8"/>
    <script src="${base}app.js" type="module"></script>
    <link rel="stylesheet" href="${base}style.css">
  </head>
`

const page = async (parsed, base='/') => {
  const buffers = []
  for await (const buff of parsed.__content) {
    buffers.push(buff)
  }
  const str = (new TextDecoder()).decode(Buffer.concat(buffers))
  const content = sanitize(markdown(str))
  return html`<html>
    ${ head(parsed.title, base) }
    <body>
      <sidebar>
        <p>Sidebar Goes Here</p>
      </sidebar>
      <content>
        ${ raw(content) }
      </content>
  </html>`
}

export { page }
