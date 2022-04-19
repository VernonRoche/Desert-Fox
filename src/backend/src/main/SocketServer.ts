import http from "http";
import { Server, Socket } from "socket.io";
import express from "express";
import Game from "./GameManager/Game";
import Player from "./GameManager/Player";
import stateMachine, { MaxTurns, StateMachine } from "./GameManager/StateMachine/StateMachine";
import { resetIds } from "./idManager";

export class SocketServer {
  private _httpServer: http.Server;
  private _socketServer: Server;
  private _sockets: Socket[] = [];
  private _clientPort: number;
  private _serverPort: number;
  private _game?: Game;
  private _players: Player[] = [];
  private _created = false;
  private _verbose;

  constructor(clientPort: number, serverPort: number, verbose = true) {
    this._verbose = verbose;
    this._clientPort = clientPort;
    this._serverPort = serverPort;
    this._httpServer = http.createServer(express());
    this._socketServer = new Server(this._httpServer, {
      cors: {
        origin: "http://localhost:" + clientPort,
      },
    });

    this._httpServer.listen(serverPort);
  }

  get isVerbose() {
    return this._verbose;
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

  private createGame(stateMachine: StateMachine): void {
    if (this.isVerbose) console.log("Game created");
    this._created = true;
    this._game = new Game(this._players[0], this._players[1]);

    const map = this._game.getMap();
    this.sockets.forEach((socket) => {
      socket.emit("map", map.toJSON(this.getPlayerFromSocket(socket)));
    });
    this.broadcast("turn", { current: 1, total: MaxTurns });
    stateMachine.startMachine();
  }

  private destroyGame() {
    if (this.isVerbose) console.log("Game destroyed");
    this._created = false;
    this._game = undefined;
    this.broadcast("gameDestroyed", {});
    stateMachine.stopMachine();
  }

  public run(stateMachine: StateMachine): void {
    //For Prototype Purposes
    this.eventConnection((socket) => {
      if (this._sockets.length >= 2) {
        socket.emit("commandMessage", { error: "full" });
        if (this.isVerbose) console.log("socket disconnected because full :", socket.id);
        socket.disconnect(true);
        return;
      }

      if (this.isVerbose) console.log(`User [${socket.id}] connected !`);
      let playerId: number;
      if (this._players.length >= 1) {
        playerId = Math.abs(this._players[0].getId() - 1);
      } else {
        playerId = this._sockets.length;
      }
      this._players.push(new Player(playerId, socket));

      this._sockets.push(socket);
      if (this._sockets.length >= 2 && !this._created) {
        this.createGame(stateMachine);
      }
      stateMachine.registerSocket(socket);
      this.applyRoutes(socket);
    });
  }

  public broadcast(nameEvent: string, data: any): void {
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
    socketClient.on("disconnect", () => {
      if (this.isVerbose) console.log(`User [${socketClient.id}] disconnected !`);
      // keep all sockets that have a different id than current
      // is pretty much just a remove
      this._sockets = this._sockets.filter((socket) => socket.id !== socketClient.id);
      this._players = this._players.filter((player) => player.getSocket().id !== socketClient.id);
      if (this._created) {
        this.destroyGame();
        resetIds();
      }
    });

    socketClient.on("message", (data: string) => {
      const otherPlayerSocket = this._sockets.find((socket) => socket.id !== socketClient.id);
      if (!otherPlayerSocket) {
        return;
      }
      if (this.isVerbose)
        console.log(
          `User [${socketClient.id}, Player ${
            this.getPlayerFromSocket(socketClient).getId() + 1
          }] sent a message : ${data}`,
        );
      otherPlayerSocket.emit("message", data);
    });

    socketClient.on("command", (data: { type: string }) => {
      if (this.isVerbose) console.log("Received command", data);
    });
  }

  getGame(): Game | undefined {
    return this._game;
  }

  getPlayers(): Player[] {
    return this._players;
  }

  getPlayerFromSocket(socket: Socket): Player {
    return this._players.find((player) => player.getSocket().id === socket.id) as Player;
  }
}

const webSocketServer = new SocketServer(8000, 3001);
export default webSocketServer;
