import { Socket } from "socket.io";
import { createMachine, interpret } from "xstate";
import { SocketServer } from "../../SocketServer";
import { AllArgs, commandTypes, _commands } from "./Commands";
import Player from "../Player";
import PlayerID from "../PlayerID";
import { statesWithUserInput, TurnPhases } from "./States";
export const MaxTurns = 38;

export class StateMachine {
  private phaseService;
  private _verbose;
  private socketServer: SocketServer;

  constructor(socketServer: SocketServer, verbose = true) {
    this._verbose = verbose;
    const TurnMachine = createMachine(TurnPhases);
    this.phaseService = interpret(TurnMachine);
    this.socketServer = socketServer;
  }
  startMachine(): void {
    this.phaseService.start();
    this.runPhaseActions(this.getPhase());
    this.phaseService.onTransition((state) => {
      if (!(state.value.toString() in statesWithUserInput)) {
        this.runPhaseActions(state.value.toString());
        if (this.isVerbose) console.log("phase : " + state.value.toString());
      }
      this.checkPhaseAndSupplies();
    });
    this.socketServer.sockets.forEach((socket) => {
      //starts at first_player_movement
      const check = this.checkIfCorrectPlayer(
        this.getPhase(),
        this.socketServer.getPlayerFromSocket(socket).getId(),
      );
      socket.emit("phase", {
        phase: this.getPhase(),
        play: check.correct,
        commands: check.commands,
        auto: false,
      });
    });
  }

  stopMachine() {
    this.phaseService.stop();
  }
  checkPhaseAndSupplies(): void {
    let changeMap = false; // variable that checks if the map has to be refreshed or not
    if (this.getPhase().includes("movement") && this.getPhase().includes("first")) {
      const game = this.socketServer.getGame();
      if (!game) return;
      changeMap = game.verifySupplies(1);
    } else if (this.getPhase().includes("movement") && this.getPhase().includes("second")) {
      const game = this.socketServer.getGame();
      if (!game) return;
      changeMap = game.verifySupplies(2);
    }
    if (changeMap) {
      this.socketServer.sockets.forEach((socket) => {
        socket.emit(
          "map",
          this.socketServer
            .getGame()
            ?.getMap()
            .toJSON(this.socketServer.getPlayerFromSocket(socket)),
        );
      });
    }
  }

  get isVerbose() {
    return this._verbose;
  }

  registerSocket(socket: Socket): void {
    socket.on("command", (data: { type: commandTypes } & AllArgs) => {
      if (!this.socketServer.getGame()) {
        socket.emit(data.type, { error: "nogame" });
        return;
      }
      const currentPlayer = this.socketServer.getPlayerFromSocket(socket);
      const request = data.type;
      if (!_commands[request]) {
        socket.emit(request, { error: "invalidcommand" });
        return;
      }
      if (request === "units" || request === "hex") {
        _commands[request](this, currentPlayer, data);
        return;
      }
      this.runPlayerCommand(currentPlayer, request, data);
      this.socketServer.sockets.forEach((socket) => {
        socket.emit(
          "map",
          this.socketServer
            .getGame()
            ?.getMap()
            .toJSON(this.socketServer.getPlayerFromSocket(socket)),
        );
      });
    });
    socket.on("done", () => {
      if (this.isVerbose) console.log("done");
      if (this.endTurn(this.socketServer.getPlayerFromSocket(socket)))
        this.informUsers(this.getPhase(), this.socketServer.getPlayers());
    });
  }

  runPhaseActions(actualPhase: string): void {
    switch (actualPhase) {
      case "victory_check": {
        //TODO : verify if the user has obtain the "port" of the other player
        if (this.phaseService.state.context.turn === 38) {
          // replace false with the test
          this.phaseService.stop();
          this.socketServer.sockets.forEach((socket) => {
            socket.emit("gameOver", {
              winner: this.socketServer.getPlayerFromSocket(socket).getId() === PlayerID.ONE,
            });
          });
          this.stopMachine();
        }
        const game = this.socketServer.getGame();
        if (!game) return;
        if (game.getPlayer1().getUnits().length === 0) {
          this.socketServer.sockets.forEach((socket) => {
            socket.emit("gameOver", {
              winner: this.socketServer.getPlayerFromSocket(socket).getId() === PlayerID.TWO, //player 2 has won
            });
          });
          this.stopMachine();
        } else if (game.getPlayer2().getUnits().length === 0) {
          this.socketServer.sockets.forEach((socket) => {
            socket.emit("gameOver", {
              winner: this.socketServer.getPlayerFromSocket(socket).getId() === PlayerID.ONE, //player 1 has won
            });
          });
          this.stopMachine();
        }
        this.phaseService.send("NEXT");
        break;
      }
      case "turn_marker": {
        this.phaseService.send("NEXT");
        this.phaseService.send("INC");
        this.socketServer.broadcast("turn", {
          current: this.phaseService.state.context.turn,
          total: MaxTurns,
        });
        break;
      }
      case "initial": {
        this.phaseService.send("NEXT");
      }
      default:
        break;
    }
  }

  runPlayerCommand(player: Player, command: string, args: any): void {
    if (!_commands[command]) {
      if (this.isVerbose) console.log("invalid command");
      return;
    }
    if (!this.checkIfCorrectPlayer(this.getPhase(), player.getId()).commands.includes(command)) {
      // checks if the player is allowed to do the command
      player.getSocket().emit(command, { error: "invalidturncommand" });
      return;
    }
    _commands[command](this, player, args);
  }

  endTurn(player: Player): boolean {
    if (this.checkIfCorrectPlayer(this.getPhase(), player.getId()).correct) {
      this.phaseService.send("NEXT");
      player.getSocket().emit("done", { error: false });
      return true;
    } else player.getSocket().emit("done", { error: "wrongplayer" });
    return false;
  }

  sendToPlayers(
    players: Player[],
    nextMovePlayerId: PlayerID,
    actualPhase: string,
    validCommands: string[],
  ): void {
    for (const player of players) {
      if (player.getId() == nextMovePlayerId)
        player
          .getSocket()
          .emit("phase", { phase: actualPhase, play: true, commands: validCommands, auto: false });
      else
        player
          .getSocket()
          .emit("phase", { phase: actualPhase, play: false, commands: [], auto: false });
    }
  }

  checkIfCorrectPlayer(
    currentPhase: string,
    playerId: PlayerID,
  ): { correct: boolean; commands: string[] } {
    switch (currentPhase) {
      case "first_player_movement":
      case "first_player_movement2": {
        if (playerId === PlayerID.ONE)
          return { correct: true, commands: ["move", "embark", "disembark"] };
        break;
      }
      case "first_player_combat":
      case "first_player_combat2": {
        if (playerId === PlayerID.ONE) return { correct: true, commands: ["attack"] };
        break;
      }
      case "second_player_movement":
      case "second_player_movement2": {
        if (playerId === PlayerID.TWO)
          return { correct: true, commands: ["move", "embark", "disembark"] };
        break;
      }
      case "second_player_combat":
      case "second_player_combat2": {
        if (playerId === PlayerID.TWO) return { correct: true, commands: ["attack"] };
        break;
      }
      default:
        return { correct: false, commands: [] };
    }
    return { correct: false, commands: [] };
  }

  informUsers(currentPhase: string, players: Player[]): void {
    const correctPlayerId = this.checkIfCorrectPlayer(currentPhase, players[0].getId()).correct
      ? players[0].getId()
      : players[1].getId();
    this.sendToPlayers(
      players,
      correctPlayerId,
      currentPhase,
      this.checkIfCorrectPlayer(currentPhase, correctPlayerId).commands,
    );
  }

  getPhaseService() {
    return this.phaseService;
  }

  getPhase() {
    return this.phaseService.state.value.toString();
  }

  getSocketServer() {
    return this.socketServer;
  }
}
