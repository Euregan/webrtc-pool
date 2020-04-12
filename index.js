const http = require ('http')
const WebSocket = require('ws')
const fs = require('fs')


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

const wsServer = new WebSocket.Server({server}).on('connection', ws => {
  ws.on('message', message => {
    console.log(`received: ${message}`)
    wsServer.clients.forEach(client => {
      if (client !== ws/* && client.readyState === WebSocket.OPEN*/) {
        client.send(message)
      }
    })
  })

  ws.on('close', () => {
    console.log('Someone disconnected')
  })

  console.log('Someone connected')
})

server.listen(8080)
