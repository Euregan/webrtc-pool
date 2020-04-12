class Signaling {
  constructor(websocketUrl) {
    this.websocket = new Promise(resolve => {
      const websocket = new WebSocket(websocketUrl)
      websocket.onopen = () => console.log('signaling online') || resolve(websocket)
      websocket.onmessage = ({data}) => this.listeners.forEach(listener => listener(JSON.parse(data)))
    })
    this.listeners = []
  }

  send(message) {
    this.websocket.then(socket =>socket.send(JSON.stringify(message)))
  }

  listen(listener) {
    this.listeners.push(listener)
  }
}

export default Signaling
