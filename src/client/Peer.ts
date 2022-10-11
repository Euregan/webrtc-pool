import type { Signaling } from "./Server";

class Peer {
  connection: RTCPeerConnection;
  listeners: Array<(message: any) => void>;
  communication: RTCDataChannel;

  constructor(signaling: Signaling, onShutdown: () => void, offerer: boolean) {
    this.connection = new RTCPeerConnection();
    this.listeners = [];

    // send any ice candidates to the other peer
    this.connection.onicecandidate = async ({ candidate }) => {
      try {
        signaling.send({ candidate });
      } catch (error) {
        console.error(error);
      }
    };

    this.connection.onconnectionstatechange = () => {
      if (this.connection.connectionState === "connected") {
      } else if (
        this.connection.connectionState === "disconnected" ||
        this.connection.connectionState === "failed"
      ) {
        onShutdown();
      }
    };

    // let the "negotiationneeded" event trigger offer generation
    this.connection.onnegotiationneeded = async () => {
      try {
        if (offerer) {
          await this.connection.setLocalDescription(
            await this.connection.createOffer()
          );
          // send the offer to the other peer
          signaling.send({
            description: this.connection.localDescription,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    this.connection.ondatachannel = async ({ channel }) => {
      channel.onmessage = ({ data }) =>
        this.listeners.forEach((listener) => listener(data));
      channel.onerror = console.error;
    };

    signaling.listen(async ({ description, candidate }: any) => {
      try {
        if (description) {
          switch (description.type) {
            case "offer":
              await this.connection.setRemoteDescription(description);
              await this.connection.setLocalDescription(
                await this.connection.createAnswer()
              );
              signaling.send({
                description: this.connection.localDescription,
              });
              break;
            case "answer":
              if (this.connection.signalingState !== "stable") {
                await this.connection.setRemoteDescription(description);
              }
              break;
            default:
              console.error("Unsupported SDP type.");
              break;
          }
        } else if (candidate) {
          await this.connection.addIceCandidate(candidate);
        }
      } catch (err) {
        console.error(err);
      }
    });

    this.communication = this.connection.createDataChannel("messaging");
    this.communication.onerror = console.error;
  }

  listen(listener: (message: any) => void) {
    this.listeners.push(listener);
  }
}

export default Peer;
