import WebSocket from "ws";
import { v4 as uuid } from "uuid";
import type { Server } from "http";

type Rooms = Record<string, Record<string, WebSocket>>;

let rooms: Rooms = {};

export const start = (server: Server) =>
  new WebSocket.Server({ server }).on("connection", (ws, request) => {
    if (!request.url) {
      return ws.close();
    }

    const id = uuid();

    const room = request.url;

    // Adding the client to the room
    if (!rooms[room]) {
      rooms[room] = {};
    }
    rooms[room][id] = ws;

    // Transmitting the messages
    ws.on("message", (raw) => {
      // Parsing the message and adding the sender
      const message = {
        ...JSON.parse(raw.toString()),
        sender: id,
      };

      // For each client in the room
      Object.keys(rooms[room]).forEach((peerId) => {
        if (
          // If the current peer is not the current client
          peerId !== id &&
          // If there is no particular recipient, or if the recipient is the current peer
          (!message.recipient || message.recipient === peerId)
        ) {
          // Forward the message
          rooms[room][peerId].send(JSON.stringify(message));
        }
      });
    });

    // Cleaning up after a client has left
    ws.on("close", () => {
      delete rooms[room][id];
      if (Object.keys(rooms[room]).length === 0) {
        delete rooms[room];
      }
    });
  });
