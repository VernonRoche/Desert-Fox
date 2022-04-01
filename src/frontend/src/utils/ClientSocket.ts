import { io, Socket } from "socket.io-client";

function initSocket(domain: string, port: number): Socket {
  return io(`http://${domain}:${port}`);
}

export default initSocket;
