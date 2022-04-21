import http from "http";
import { Server, Socket } from "socket.io";
import express from "express";
import Game from "./GameManager/Game";
import Player from "./GameManager/Player";
import { MaxTurns, StateMachine } from "./GameManager/StateMachine/StateMachine";
import { resetIds } from "./IdManager";

export class SocketServer {
  private _httpServer: http.Server;
  private _socketServer: Server;
  private _sockets: Socket[] = [];
  private _clientAddress: string;
  private _serverPort: number;
  private _game?: Game;
  private _players: Player[] = [];
  private _created = false;
  private _verbose;

  // get clientAddress from constructor (and command line) so that no code changes to deploy the server
  constructor(clientAddress: string, serverPort: number, verbose = true) {
    this._verbose = verbose;
    this._clientAddress = clientAddress;
    this._serverPort = serverPort;
    this._httpServer = http.createServer(express());
    // cors is needed to allow cross origin requests from client
    this._socketServer = new Server(this._httpServer, {
      cors: {
        origin: clientAddress,
      },
    });
    // start server on port `serverPort`
    this._httpServer.listen(serverPort);
  }

  get isVerbose() {
    return this._verbose;
  }

  public get sockets(): Socket[] {
    return this._sockets;
  }

  public get clientAddress(): string {
    return this._clientAddress;
  }

  public get serverPort(): number {
    return this._serverPort;
  }

  /**
   * Create a game with the current players
   * it sends map to the players
   * starts the stateMachine
   */
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
  /**
   * Destroy the game
   * broadcast to all players that the game is over
   * stop the stateMachine
   */
  private destroyGame(stateMachine: StateMachine): void {
    if (this.isVerbose) console.log("Game destroyed");
    this._created = false;
    this._game = undefined;
    this.broadcast("gameDestroyed", {});
    stateMachine.stopMachine();
    resetIds();
  }

  /**
   * Listens to players connection
   * stateMachine is used to manage the game as the commands are in the stateMachine
   */
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
      this.applyRoutes(socket, stateMachine);
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

  /**
   * Apply event listeners to given socket
   * @param socketClient socket to apply event listeners to
   * @param stateMachine used to destroy game if needed
   */
  private applyRoutes(socketClient: Socket, stateMachine: StateMachine): void {
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
        this.destroyGame(stateMachine);
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
