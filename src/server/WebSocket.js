const WebSocket = require('ws')

module.exports = server => {
  const webSocketServer = new WebSocket.Server({server}).on('connection', socket => {
    socket.on('message', message => {
      webSocketServer.clients.forEach(client => {
        if (client !== socket) {
          client.send(message)
        }
      })
    })
  })

  return webSocketServer
}
