const http = require ('http')
const fs = require('fs')
const signaling = require('./server')


const server = http.createServer((request, response) => {
  let data = ''

  request.on('data', chunk => data += chunk.toString())

  request.on('end', () => {
    switch (request.url) {
      case '/':
        response.writeHead(200, {
          "Content-Type": "text/html; charset=utf-8",
        })
        fs.createReadStream('public/index.html').pipe(response)
        break
      case '/app.js':
        response.writeHead(200, {
          "Content-Type": "application/javascript; charset=utf-8",
        })
        fs.createReadStream('public/app.js').pipe(response)
        break
      default :
        response.writeHead(404)
        response.end(JSON.stringify({
          response: 404,
          method: request.method,
          headers: request.headers,
          url: request.url,
          data: data
        }, null, 2))
        break
    }
  })
})

signaling.start(server)

server.listen(8080, error => {
  if (error) {
    console.error(error)
  } else {
    console.log('server started on http://localhost:8080')
  }
})
