import http from "http";
import { Server, Socket } from "socket.io";
import express, { Express } from "express";
import Game from "./GameManager/Game";
import PlayerID from "./GameManager/PlayerID";

type BaseCommand = {
  type: string;
};

type AllArgs = moveArgs | AttackArgs;

type moveArgs = {
  hex?: string;
  unit?: string;
};

type AttackArgs = moveArgs & {
  combatSupply?: boolean;
};

export class SocketServer {
  private _httpServer: http.Server;
  private _socketServer: Server;
  private _sockets: Socket[] = [];
  private _clientPort: number;
  private _serverPort: number;
  private _game?: Game;
  private _commands: Record<string, (args: AllArgs) => void> = {
    move: (args: moveArgs) => {},
  };

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

    socketClient.on("message", (data: any) => {
      console.log(`User [${socketClient.id}] sent a message : ${data}`);
      this._socketServer.emit("message", data);
    });

    socketClient.on("command", (data: BaseCommand & AttackArgs) => {
      if (!this._game) {
        socketClient.emit("commandMessage", { error: "nogame" });
        return;
      }
      if (!this._commands[data.type]) {
        socketClient.emit("commandMessage", { error: "invalidcommand" });
        return;
      }
      this._commands[data.type];
      console.log(`User [${socketClient.id}] sent a command : ${data.type}`);

      this._socketServer.emit("commandMessage", { error: false });
    });
  }
}

const webSocketServer = new SocketServer(express(), 8000, 3001);
export default webSocketServer;
