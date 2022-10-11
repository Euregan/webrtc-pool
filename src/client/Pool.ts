import Server from "./Server";
import Peer from "./Peer";

class Pool {
  server: Server;
  peers: Record<string, Peer>;
  listeners: Array<(message: any) => void>;

  constructor(websocketSignalingUrl: string) {
    this.server = new Server(websocketSignalingUrl);
    this.peers = {};
    this.listeners = [];

    this.server.listen(({ type, sender: id }: any) => {
      switch (type) {
        case "hello":
          if (!this.peers[id]) {
            this.peers[id] = new Peer(
              this.server.filter(id),
              () => this.deleteConnection(id),
              false
            );
            this.listeners.forEach((listener) =>
              this.peers[id].listen(listener)
            );
            this.server.send({ type: "welcome" });
          }
          break;
        case "welcome":
          if (!this.peers[id]) {
            this.peers[id] = new Peer(
              this.server.filter(id),
              () => this.deleteConnection(id),
              true
            );
            this.listeners.forEach((listener) =>
              this.peers[id].listen(listener)
            );
          }
          break;
      }
    });

    this.server.send({ type: "hello" });
  }

  deleteConnection(id: string) {
    delete this.peers[id];
  }

  send(message: any) {
    Object.keys(this.peers)
      .filter((id) => this.peers[id].communication.readyState === "open")
      .forEach((id) => this.peers[id].communication.send(message));
  }

  listen(listener: (message: any) => void) {
    this.listeners.push(listener);
    Object.keys(this.peers).forEach((id) => this.peers[id].listen(listener));
  }

  close() {
    this.server.close();
    Object.values(this.peers).forEach((peer) => peer.connection.close());
  }
}

export default Pool;
