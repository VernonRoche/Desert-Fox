import http from "http";
import { Server, Socket } from "socket.io";
import express, { Express } from "express";
import Game from "./GameManager/Game";
import GameMap from "./Map/GameMap";
import Garrison from "./Units/Garrison";
import Player from "./GameManager/Player";
import HexID from "./Map/HexID";
import AbstractUnit from "./Units/AbstractUnit";
import Maps from "./Map/Maps";
import { StateMachine } from "./GameManager/StateMachine";

let id = 0;

export class SocketServer {
  private _httpServer: http.Server;
  private _socketServer: Server;
  private _sockets: Socket[] = [];
  private _clientPort: number;
  private _serverPort: number;
  private _game?: Game;
  private _players: Player[] = [];
  private _created = false;

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

  public run(stateMachine: StateMachine): void {
    //For Prototype Purposes

    this.eventConnection((socket) => {
      if (this._sockets.length === 2) {
        socket.emit("commandMessage", { error: "full" });
        console.log("socket disconnected because full :", socket.id);
        socket.disconnect(true);
        return;
      }

      console.log(`User [${socket.id}] connected !`);
      const units: AbstractUnit[] = [];
      this._players.push(new Player(this._sockets.length, units, [], [], [], socket));
      this._sockets.push(socket);
      if (this._sockets.length >= 2 && !this._created) {
        console.log("Game created");
        //For Prototype Purposes
        const garrisonHexId = new HexID(2, 2);
        const garrison = new Garrison(id++, garrisonHexId, 1, 1, 2);
        units.push(garrison);

        this._created = true;
        this._game = new Game(
          new GameMap(new Map(), "libya" as Maps),
          this._players[0],
          this._players[1],
        );
        const map = this._game.getMap();
        map.addUnit(garrison);
        this.sockets.forEach((socket) => {
          socket.emit("gameCreated", map.toJSON(this.getPlayerFromSocket(socket)));
        });
        stateMachine.getPhaseService().send("RESET");
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
      console.log(`User [${socketClient.id}] disconnected !`);
      // keep all sockets that have a different id than current
      // is pretty much just a remove
      this._sockets = this._sockets.filter((socket) => socket.id !== socketClient.id);
      if (this._created) {
        console.log("Game destroyed");
        this._created = false;
        this._players.filter((player) => player.getSocket().id !== socketClient.id);
        this._game = undefined;
        id = 0;
      }
    });

    socketClient.on("message", (data: any) => {
      console.log(`User [${socketClient.id}] sent a message : ${data}`);
      this._socketServer.emit("message", data);
    });

    socketClient.on("command", (data: any) => console.log("Received command", data));
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

const webSocketServer = new SocketServer(express(), 8000, 3001);
export default webSocketServer;
