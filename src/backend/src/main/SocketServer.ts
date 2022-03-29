import http from "http";
import { Server, Socket } from "socket.io";
import express, { Express } from "express";

export class SocketServer {
  private _httpServer: http.Server;
  private _socketServer: Server;
  private _sockets: Socket[] = [];
  private _clientPort: number;
  private _serverPort: number;

  constructor(listener: Express, clientPort: number, serverPort: number) {
    this._clientPort = clientPort;
    this._serverPort = serverPort;
    this._httpServer = http.createServer(listener);
    this._socketServer = new Server(this._httpServer, {
      cors: {
        origin: "http://localhost:" + clientPort,
      },
    });

    this._httpServer.listen(serverPort);
  }

  public get sockets(): Socket[] {
    return this._sockets;
  }

  public get clientPort(): number {
    return this._clientPort;
  }

  public get serverPort(): number {
    return this._serverPort;
  }

  public run(): void {
    this.eventConnection((socket) => {
      console.log(`User [${socket.id}] connected !`);
      this._sockets.push(socket);
      this.applyRoutes(socket);
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

  private applyRoutes(socketClient: Socket) {
    socketClient.on("ping message", () => {
      socketClient.emit("pong message", "pong");
    });

    socketClient.on("disconnect", (reason: string) => {
      console.log(`User [${socketClient.id}] disconnected !`);
      // keep all sockets that have a different id than current
      // is pretty much just a remove
      this._sockets = this._sockets.filter((socket) => socket.id !== socketClient.id);
    });
  }
}

const webSocketServer = new SocketServer(express(), 8000, 3001);
export default webSocketServer;
