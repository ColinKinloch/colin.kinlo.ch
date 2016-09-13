import fs from 'fs'
import http from 'http'
import spdy from 'spdy'

import Koa from 'koa'
import serve from 'koa-static'
import convert from 'koa-convert'
import lusca from 'koa-lusca'

const app = new Koa()

const ADDRESS = '0.0.0.0'
const HTTP = 8080
const HTTPS = 8181
const LE = '/etc/letsencrypt/live/colin.kinlo.ch'
const PUBLIC = './dist/public/'

const announce = (protocol, address, port) => () =>
  console.log('Server started at', `${protocol}://${address}:${port}`)

app.use((ctx, next) => {
  ctx.set('Upgrade', 'HTTP/2.0, HTTPS/1.3')
  return next()
})
.use(convert(lusca({
  xssProtection: true,
  xframe: 'DENY',
  cto: 'nosniff',
  csp: {
    policy: {
      'default-src': "'self'"
    }
  },
  hsts: {
    maxAge: 15768000,
    includeSubDomains: true,
    preload: true
  }
})))
.use(serve(PUBLIC))

http.createServer(app.callback())
  .listen(HTTP, ADDRESS, announce('http', ADDRESS, HTTP))

try {
  spdy.createServer({
    key: fs.readFileSync(LE + '/privkey.pem'),
    cert: fs.readFileSync(LE + '/fullchain.pem'),
    ca: fs.readFileSync(LE + '/chain.pem')
  }, app.callback())
    .listen(HTTPS, ADDRESS, announce('https', ADDRESS, HTTPS))
} catch (error) {
  if (error.code === 'ENOENT') console.log('TLS auth data not found at', error.path, 'not starting https')
  else console.error(error.message)
}
