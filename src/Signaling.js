class Signaling {
  constructor(websocketUrl) {
    this.websocket = new WebSocket(websocketUrl)
    this.pendingMessages = []
    this.listeners = []

    this.websocket.onopen = () => {
      console.log('signaling online')
      this.pendingMessages.forEach(message => this.send(message))
      this.pendingMessages = []
    }
    this.websocket.onmessage = ({data}) => this.listeners.forEach(listener => listener(JSON.parse(data)))
  }

  send(message) {
    if (this.websocket.readyState === 1) {
      this.websocket.send(JSON.stringify(message))
    } else {
      this.pendingMessages.push(message)
    }
  }

  listen(listener) {
    this.listeners.push(listener)
  }

  status() {
    switch(this.websocket.readyState) {
      case 0: return 'connecting'
      case 1: return 'open'
      case 2: return 'closing'
      case 3: return 'closed'
    }
  }
}

export default Signaling
