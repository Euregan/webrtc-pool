type Listener = (message: any) => void;

export interface Signaling {
  send: (message: any) => void;
  listen: (listener: Listener) => void;
}

class Server {
  websocket: WebSocket;
  pendingMessages: Array<string>;
  listeners: Array<Listener>;

  constructor(websocketUrl: string) {
    this.websocket = new WebSocket(websocketUrl);
    this.pendingMessages = [];
    this.listeners = [];

    this.websocket.onopen = () => {
      this.pendingMessages.forEach((message) => this.send(message));
      this.pendingMessages = [];
    };
    this.websocket.onmessage = ({ data }) =>
      this.listeners.forEach((listener) => listener(JSON.parse(data)));
  }

  send(message: any) {
    if (this.websocket.readyState === 1) {
      this.websocket.send(JSON.stringify(message));
    } else {
      this.pendingMessages.push(message);
    }
  }

  listen(listener: Listener) {
    this.listeners.push(listener);
  }

  filter(peerId: string): Signaling {
    return {
      send: (message: any) => this.send({ ...message, recipient: peerId }),
      listen: (listener: Listener) =>
        this.listen((message) => {
          if (message.sender === peerId) {
            listener(message);
          }
        }),
    };
  }

  status() {
    switch (this.websocket.readyState) {
      case 0:
        return "connecting";
      case 1:
        return "open";
      case 2:
        return "closing";
      case 3:
        return "closed";
    }
  }

  close() {
    this.websocket.close();
  }
}

export default Server;
