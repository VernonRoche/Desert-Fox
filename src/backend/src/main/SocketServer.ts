import http from "http";
import { Server, Socket } from "socket.io";
import express, { Express } from "express";
import Game from "./GameManager/Game";
import PlayerID from "./GameManager/PlayerID";
import GameMap from "./Map/GameMap";
import Entity from "./Entity";
import Horse from "./Units/Horse";
import Player from "./GameManager/Player";
import HexID from "./Map/HexID";
import AbstractUnit from "./Units/AbstractUnit";
import Maps from "./Map/Maps";

type BaseCommand = {
  type: string;
};

type AllArgs = MoveArgs | AttackArgs;

type MoveArgs = {
  hexId?: string;
  unitId?: string;
};

type AttackArgs = MoveArgs & {
  combatSupply?: boolean;
};

type Commands = Record<string, (args: AllArgs) => void>;

let id = 0;

export class SocketServer {
  private _httpServer: http.Server;
  private _socketServer: Server;
  private _sockets: Socket[] = [];
  private _clientPort: number;
  private _serverPort: number;
  private _game?: Game;
  private _players: Player[] = [];
  private _created: boolean = false;

  private _commands: (player: Player) => Commands = (player: Player) => ({
    move: (args: MoveArgs) => {
      if(!args.unitId || !args.hexId) {
        player.getSocket().emit("commandMessage", { error: "invalidargs" });
        return;
      }
      const unitId = +args.unitId;
      if(isNaN(unitId)) {
        player.getSocket().emit("commandMessage", { error: "invalidunitid" });
        return;
      }
      const unit = player.getUnitById(unitId);
      if (!unit) {
        player.getSocket().emit("commandMessage", { error: "invalidunit" });
        return;
      }
      const x = +args.hexId.substring(2, 4);
      const y = +args.hexId.substring(0, 2);
      if (isNaN(x) || isNaN(y)) {
        player.getSocket().emit("commandMessage", { error: "invalidhex" });
        return;
      }
      this._game?.moveUnit(player.getId(), unit, new HexID(x, y));
    },
    units: () => {
      player.getSocket().emit("commandMessage", player.getUnits());
    },
  });

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
    //For Prototype Purposes

    this.eventConnection((socket) => {
      if (this._sockets.length == 2) {
        socket.emit("commandMessage", { error: "full" });
        return;
      }

      console.log(`User [${socket.id}] connected !`);
      this._players.push(new Player(PlayerID.ONE, [], [], [], [], socket));
      this._sockets.push(socket);
      if (this._sockets.length >= 2 && !this._created) {
        //For Prototype Purposes
        let horseHexId = new HexID(2, 2);
        let horse = new Horse(id++, horseHexId, 1, 1);
        let units = new Array();
        units.push(horse);
        this._created = true;
        this._game = new Game(
          new GameMap(new Array(), "libya" as Maps),
          this._players[0],
          this._players[1],
        );
        this._game.getMap().addUnit(horse);
        this.broadcast("gameCreated", this._game.getMap().toJSON());
      }
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

    const currentPlayer =
      this._players[0].getSocket() == socketClient ? this._players[0] : this._players[1]; // get player TODO: kristo t nul;

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
      if (!this._commands(currentPlayer)[data.type]) {
        socketClient.emit("commandMessage", { error: "invalidcommand" });
        return;
      }
      this._commands(currentPlayer)[data.type](data);
      console.log(`User [${socketClient.id}] sent a command : ${data.type}`);

      this._socketServer.emit("commandMessage", { error: false });
    });
  }
}

const webSocketServer = new SocketServer(express(), 8000, 3001);
export default webSocketServer;
