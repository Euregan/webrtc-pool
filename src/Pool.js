import { v4 as uuid } from 'uuid'
import Signaling from './Signaling'
import Connection from './Connection'


class Pool {
  constructor(websocketSignalingUrl) {
    this.uuid = uuid()
    this.signaling = new Signaling(websocketSignalingUrl)
    this.peers = {}

    this.signaling.listen(({type, id}) => {
      switch(type) {
        case 'hello':
          if (!this.peers[id]) {
            this.peers[id] = new Connection(this.signaling, this.uuid, id, true)
            this.signaling.send({type: 'welcome', id: this.uuid})
          }
          break
        case 'welcome':
          if (!this.peers[id]) {
            this.peers[id] = new Connection(this.signaling, this.uuid, id, false)
          }
          break
      }
    })

    this.signaling.send({type: 'hello', id: this.uuid})
  }
}

export default Pool
