import 'webrtc-adapter'
import Pool from './Pool'

const pool = window.pool = new Pool('ws://localhost:8080')

setInterval(() => {
  const poolNode = document.getElementById('pool')
  poolNode.innerText = JSON.stringify({
    id: pool.uuid,
    signaling: pool.signaling.status(),
    peers: Object.keys(pool.peers).map(key => ({
      id: key,
      status: pool.peers[key].connection.connectionState,
      communication: pool.peers[key].communication.readyState
    }))
  }, null, 2)
}, 500)
