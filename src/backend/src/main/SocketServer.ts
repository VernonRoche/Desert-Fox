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
  private _created = false;

  private _commands: (player: Player) => Commands = (player: Player) => ({
    move: (args: MoveArgs) => {
      if (!args.unitId || !args.hexId) {
        player.getSocket().emit("commandMessage", { error: "invalidargs" });
        return;
      }
      const unitId = +args.unitId;
      if (isNaN(unitId)) {
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
      const successful = this._game?.moveUnit(player.getId(), unit, new HexID(x, y));
      console.log("move was successful: ", successful);
    },
    units: () => {
      console.log("player (", player.getId(), ") has", player.getUnits().length, "units");
      const playerUnits = player.getUnits();
      console.log("player units:", playerUnits);
      player.getSocket().emit("commandMessage", playerUnits);
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
      if (this._sockets.length === 2) {
        socket.emit("commandMessage", { error: "full" });
        return;
      }

      console.log(`User [${socket.id}] connected !`);
      const units: AbstractUnit[] = [];
      this._players.push(new Player(this._sockets.length, units, [], [], [], socket));
      this._sockets.push(socket);
      if (this._sockets.length >= 2 && !this._created) {
        //For Prototype Purposes
        const garrisonHexId = new HexID(2, 2);
        const garrison = new Garrison(id++, garrisonHexId, 1, 1);
        units.push(garrison);

        this._created = true;
        this._game = new Game(new GameMap([], "libya" as Maps), this._players[0], this._players[1]);
        this._game.getMap().addUnit(garrison);
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
      this._players[0].getSocket().id === socketClient.id ? this._players[0] : this._players[1]; // get player TODO: kristo t nul;

    socketClient.on("disconnect", () => {
      console.log(`User [${socketClient.id}] disconnected !`);
      // keep all sockets that have a different id than current
      // is pretty much just a remove
      this._sockets = this._sockets.filter((socket) => socket.id !== socketClient.id);
    });

    socketClient.on("message", (data: any) => {
      console.log(`User [${socketClient.id}] sent a message : ${data}`);
      this._socketServer.emit("message", data);
    });

    socketClient.on("command", (data: (BaseCommand & AttackArgs)[]) => {
      if (!this._game) {
        socketClient.emit("commandMessage", { error: "nogame" });
        return;
      }

      const request = data[0];

      console.log("I received", request);

      console.log(!this._commands(currentPlayer));

      if (!this._commands(currentPlayer)[request.type]) {
        socketClient.emit("commandMessage", { error: "invalidcommand" });
        return;
      }
      this._commands(currentPlayer)[request.type](request);
      console.log(`User [${socketClient.id}] sent a command : ${request.type}`);

      this._socketServer.emit("commandMessage", { error: false });
    });
  }
}

const webSocketServer = new SocketServer(express(), 8000, 3001);
export default webSocketServer;
