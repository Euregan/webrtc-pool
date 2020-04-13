import 'webrtc-adapter'
import Pool from './Pool'

const pool = window.pool = new Pool('ws://localhost:8080')

setInterval(() => {
  const poolNode = document.getElementById('pool')
  poolNode.innerText = JSON.stringify({
    id: pool.uuid,
    server: pool.server.status(),
    peers: Object.keys(pool.peers).map(key => ({
      id: key,
      status: pool.peers[key].connection.connectionState,
      communication: pool.peers[key].communication.readyState
    }))
  }, null, 2)
}, 10)

pool.listen(message => {
  const historyNode = document.getElementById('history')
  const itemNode = document.createElement('li')
  itemNode.innerText = message
  historyNode.prepend(itemNode)
})

document.getElementById('message').onkeyup = event => {
  if (event.key === 'Enter') {
    pool.send(document.getElementById('message').value)
    document.getElementById('message').value = ''
  }
}
