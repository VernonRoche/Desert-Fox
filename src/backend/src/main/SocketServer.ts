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
import phaseService, { informUsers, webSocketServer } from "./GameManager/StateMachine";

let id = 0;

type BaseCommand = {
  type: string;
};

enum commandTypes {
  move = "move",
  attack = "attack",
  select = "select",
  train = "train",
  activate = "activate",
}
type AllArgs = BaseCommand & (MoveArgs | AttackArgs);

type MoveArgs = {
  hexId?: string;
  unitId?: string;
};

type AttackArgs = MoveArgs & {
  combatSupply?: boolean;
};

type Commands = Record<string, (args: AllArgs) => void>;

const _commands: (player: Player) => Commands = (player: Player) => ({
  move: (args: MoveArgs & BaseCommand) => {
    if (
      (player.getId() === 0 &&
        phaseService.state.value !== "first_player_movement" &&
        phaseService.state.value !== "first_player_movement2") ||
      (player.getId() === 1 &&
        phaseService.state.value !== "second_player_movement" &&
        phaseService.state.value !== "second_player_movement2")
    ) {
      player.getSocket().emit(args.type, { error: "turnerror" });
    }
    if (!args.unitId || !args.hexId) {
      player.getSocket().emit(args.type, { error: "invalidargs" });
      return;
    }
    const unitId = +args.unitId;
    if (isNaN(unitId)) {
      player.getSocket().emit(args.type, { error: "invalidunitid" });
      return;
    }
    const unit = player.getUnitById(unitId);
    if (!unit) {
      player.getSocket().emit(args.type, { error: "invalidunit" });
      return;
    }
    const x = +args.hexId.substring(2, 4);
    const y = +args.hexId.substring(0, 2);
    if (isNaN(x) || isNaN(y)) {
      player.getSocket().emit(args.type, { error: "invalidhex" });
      return;
    }
    try {
      webSocketServer.getGame()?.moveUnit(player.getId(), unit, new HexID(x, y));
      console.log("move was successful");
    } catch (e) {
      player.getSocket().emit(args.type, { error: "invalidmove" });
    }
  },
  units: () => {
    console.log("player (", player.getId(), ") has", player.getUnits().length, "units");
    const playerUnits = player.getUnits();
    console.log("player units:", playerUnits);
    player.getSocket().emit("units", playerUnits);
  },
});
class SocketServer {
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

  public run(): void {
    //For Prototype Purposes

    this.eventConnection((socket) => {
      if (this._sockets.length === 2) {
        socket.emit("commandMessage", { error: "full" });
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
        const garrison = new Garrison(id++, garrisonHexId, 1, 1);
        units.push(garrison);

        this._created = true;
        this._game = new Game(new GameMap([], "libya" as Maps), this._players[0], this._players[1]);
        const map = this._game.getMap();
        map.addUnit(garrison);
        this.broadcast("gameCreated", { map: map.toJSON() });
      }
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
      }
    });

    socketClient.on("message", (data: any) => {
      console.log(`User [${socketClient.id}] sent a message : ${data}`);
      this._socketServer.emit("message", data);
    });
    socketClient.on("command", (data: { type: commandTypes } & AllArgs) => {
      if (!this._game) {
        socketClient.emit(data.type, { error: "nogame" });
        return;
      }
      const currentPlayer = this.getPlayerFromSocket(socketClient);
      const request = data.type;
      if (!_commands(currentPlayer)[request]) {
        socketClient.emit(request, { error: "invalidcommand" });
        return;
      }
      _commands(currentPlayer)[request](data);
    });
    socketClient.on("done", () => {
      phaseService.send("NEXT");
      informUsers(phaseService.state.value.toString(), this.getPlayers());
    });

    socketClient.on("command", (data: (BaseCommand & AttackArgs)[]) => {
      if (!this._game) {
        socketClient.emit("commandMessage", { error: "nogame" });
        return;
      }

      const request = data[0];
      const currentPlayer = this.getPlayerFromSocket(socketClient);
      console.log("I received", request);

      if (!_commands(currentPlayer)[request.type]) {
        socketClient.emit("commandMessage", { error: "invalidcommand" });
        return;
      }
      _commands(currentPlayer)[request.type](request);
      console.log(`User [${socketClient.id}] sent a command : ${request.type}`);

      this._socketServer.emit("commandMessage", { error: false });
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

export default SocketServer;
