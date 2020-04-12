import { v4 as uuid } from 'uuid'
import Signaling from './Signaling'
import Connection from './Connection'


class Pool {
  constructor(websocketSignalingUrl) {
    this.uuid = uuid()
    this.signaling = new Signaling(websocketSignalingUrl)
    this.peers = {}
    this.listeners = []

    this.signaling.listen(({type, id}) => {
      switch(type) {
        case 'hello':
          if (!this.peers[id]) {
            this.peers[id] = new Connection(this.signaling, this.uuid, id, () => this.deleteConnection(id), true)
            this.listeners.forEach(listener => this.peers[id].listen(listener))
            this.signaling.send({type: 'welcome', id: this.uuid})
          }
          break
        case 'welcome':
          if (!this.peers[id]) {
            this.peers[id] = new Connection(this.signaling, this.uuid, id, () => this.deleteConnection(id), false)
            this.listeners.forEach(listener => this.peers[id].listen(listener))
          }
          break
      }
    })

    this.signaling.send({type: 'hello', id: this.uuid})
  }

  deleteConnection(id) {
    delete this.peers[id]
  }

  send(message) {
    Object.keys(this.peers)
      .filter(id => this.peers[id].communication.readyState === 'open')
      .forEach(id => this.peers[id].communication.send(message))
  }

  listen(listener) {
    this.listeners.push(listener)
    Object.keys(this.peers).forEach(id => this.peers[id].listen(listener))
  }
}

export default Pool
