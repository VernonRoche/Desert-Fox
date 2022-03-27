import http from "http";
import { Server, Socket } from "socket.io";
import { Express } from "express";

export default class SocketServer {
  private _httpServer: http.Server;
  private _socketServer: Server;

  constructor(listener: Express, portOrigin: number, portWS: number) {
    this._httpServer = http.createServer(listener);
    this._socketServer = new Server(this._httpServer, {
      cors: {
        origin: "http://localhost:" + portOrigin,
      },
    });

    this._httpServer.listen(portWS);
  }

  public run(): void {
    this.eventConnection((socket) => {
      console.log(`User [${socket.id}] connected !`);
      this.routeDisconnect(socket);
      this.routePingPong(socket);
    });
  }

  public broadcast(nameEvent: string, data: string | JSON): void {
    this._socketServer.emit(nameEvent, data);
  }

  private eventConnection(callback: (socket: Socket) => void): void {
    this._socketServer.on("connection", callback);
  }

  /////////////////////////////////////////////////////////////
  //////////// Routes
  /////////////////////////////////////////////////////////////

  private routePingPong(socketClient: any): void {
    socketClient.on("ping message", () => {
      socketClient.emit("pong message", "pong");
    });
  }

  private routeDisconnect(socketClient: any): void {
    socketClient.on("disconnect", (reason: string) => {
      console.log(`User [${socketClient.id}] disconneced !`);
    });
  }
}
