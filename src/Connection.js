class Connection {
  constructor(signaling, selfId, peerId, onShutdown, offerer) {
    this.connection = new RTCPeerConnection()

    // send any ice candidates to the other peer
    this.connection.onicecandidate = async ({candidate}) => {
      console.log('sending a candidate', candidate)
      try {
        await signaling.send({id: selfId, candidate})
      } catch (error) {
        console.error(error)
      }
    }

    this.connection.onconnectionstatechange = data => {
      if (this.connection.connectionState === 'connected') {
        console.log('online')
      } else if (this.connection.connectionState === 'disconnected' || this.connection.connectionState === 'failed') {
        console.log('shutting down')
        onShutdown()
      }
    }

    // let the "negotiationneeded" event trigger offer generation
    this.connection.onnegotiationneeded = async () => {
      console.log('negotiation needed')
      try {
        console.log(this.connection.signalingState)
        if (offerer) {
          await this.connection.setLocalDescription(await this.connection.createOffer())
          // send the offer to the other peer
          console.log('sending an offer', this.connection.localDescription)
          await signaling.send({id: selfId, description: this.connection.localDescription})
        }
      } catch (err) {
        console.error(err)
      }
    }

    this.connection.ondatachannel = async ({channel}) => {
      console.log('data channel is created', channel)
      channel.onopen = () => console.log('data channel is open and ready to listen.')
      channel.onmessage = ({data}) => console.log('message', data)
      channel.onerror = console.error
    }

    signaling.listen(async ({id, description, candidate}) => {
      try {
        if (id === peerId) {
          if (description) {
            switch(description.type) {
              case 'offer':
                console.log('received an offer', description, this.connection.signalingState)
                await this.connection.setRemoteDescription(description)
                await this.connection.setLocalDescription(await this.connection.createAnswer())
                console.log('sending an answer:', this.connection.localDescription)
                await signaling.send({id: selfId, description: this.connection.localDescription})
                break
              case 'answer':
                console.log('received an answer', description, this.connection.signalingState)
                if (this.connection.signalingState !== 'stable') {
                  await this.connection.setRemoteDescription(description)
                }
                break
              default:
                console.error('Unsupported SDP type.')
                break
            }
          } else if (candidate) {
            console.log('received a candidate', candidate)
            await this.connection.addIceCandidate(candidate)
          }
        }
      } catch (err) {
        console.error(err)
      }
    })

    this.communication = this.connection.createDataChannel('messaging')
    this.communication.onopen = () => console.log('channel is open and ready to send')
    this.communication.onerror = console.error
  }
}

export default Connection
