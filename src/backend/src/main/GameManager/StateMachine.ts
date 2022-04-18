import { Server, Socket } from "socket.io";
import { actions, assign, createMachine, interpret } from "xstate";
import webSocketServer from "../SocketServer";
import { AllArgs, commandTypes, _commands } from "./Commands";
import Player from "./Player";
import PlayerID from "./PlayerID";

const statesWithUserInput: Record<string, any> = {
  reinforcements: {
    on: {
      NEXT: "allocation",
    },
  },
  initiative: {
    on: {
      NEXT: "first_player_movement",
    },
  },
  allocation: {
    on: {
      NEXT: "initiative",
    },
  },
  first_player_movement: {
    on: {
      NEXT: "second_player_reaction",
    },
  },
  second_player_reaction: {
    on: {
      NEXT: "first_player_combat",
    },
  },
  first_player_combat: {
    on: {
      NEXT: "second_player_movement",
    },
  },
  second_player_movement: {
    on: {
      NEXT: "first_player_reaction",
    },
  },
  first_player_reaction: {
    on: {
      NEXT: "second_player_combat",
    },
  },
  second_player_combat: {
    on: {
      NEXT: "first_player_movement2",
    },
  },
  first_player_movement2: {
    on: {
      NEXT: "second_player_reaction2",
    },
  },
  second_player_reaction2: {
    on: {
      NEXT: "first_player_combat2",
    },
  },
  first_player_combat2: {
    on: {
      NEXT: "second_player_movement2",
    },
  },
  second_player_movement2: {
    on: {
      NEXT: "first_player_reaction2",
    },
  },
  first_player_reaction2: {
    on: {
      NEXT: "second_player_combat2",
    },
  },
  second_player_combat2: {
    on: {
      NEXT: "supply_attrition",
    },
  },
};
export const TurnPhases = {
  initial: "initial",
  context: {
    turn: 1,
  },
  states: {
    ...statesWithUserInput,
    initial: {
      on: {
        NEXT: "air_superiority",
      },
    },
    air_superiority: {
      on: {
        NEXT: "first_player_movement", // "reinforcements",
      },
    },
    supply_attrition: {
      on: {
        NEXT: "victory_check",
      },
    },
    victory_check: {
      on: {
        NEXT: "turn_marker",
      },
    },
    turn_marker: {
      on: {
        NEXT: "air_superiority",
      },
    },
  },
  on: {
    RESET: {
      target: ".initial",
    },
    INC: { actions: assign({ turn: (context: { turn: number }) => context.turn + 1 }) },
  },
  guards: {
    didPlayer1Win: (context: { turn: number }) => {
      // check if player1 won
      return context.turn > 38;
    },
    didPlayer2Win: () => {
      // check if player2 won
      return false; // TODO : add test to see if this player took the port to win the game
    },
  },
};

createMachine({
  id: "turn",
  ...TurnPhases,
});

export class StateMachine {
  private phaseService;
  private _verbose;

  constructor(verbose = true) {
    this._verbose = verbose;
    const TurnMachine = createMachine(TurnPhases);
    this.phaseService = interpret(TurnMachine);
    
  }
  startMachine(): void {
    this.phaseService.start();
    this.runPhaseActions(this.phaseService.state.value.toString());
    this.phaseService.onTransition((state) => {
      if (!(state.value.toString() in statesWithUserInput)) {
        this.runPhaseActions(state.value.toString());
        if (this.isVerbose) console.log("phase : " + state.value.toString());
        this.phaseService.send("NEXT");
      }
    });
  }

  stopMachine() {
    this.phaseService.stop();
  }
  get isVerbose() {
    return this._verbose;
  }

  registerSocket(socket: Socket): void {
    socket.on("command", (data: { type: commandTypes } & AllArgs) => {
      if (!webSocketServer.getGame()) {
        socket.emit(data.type, { error: "nogame" });
        return;
      }
      const currentPlayer = webSocketServer.getPlayerFromSocket(socket);
      const request = data.type;
      if (!_commands[request]) {
        socket.emit(request, { error: "invalidcommand" });
        return;
      }
      if (request === "units") {
        _commands[request](currentPlayer, data);
        return;
      }
      this.runPlayerCommand(currentPlayer, request, data);
      webSocketServer.sockets.forEach((socket) => {
        socket.emit(
          "map",
          webSocketServer.getGame()?.getMap().toJSON(webSocketServer.getPlayerFromSocket(socket)),
        );
      });
    });
    socket.on("done", () => {
      if (this.isVerbose) console.log("done");
      if (this.endTurn(webSocketServer.getPlayerFromSocket(socket)))
        this.informUsers(this.phaseService.state.value.toString(), webSocketServer.getPlayers());
    });
  }

  runPhaseActions(actualPhase: string): void {
    switch (actualPhase) {
      case "air_superiority": //TODO
        break;
      case "supply_attrition": //TODO
        break;
      case "victory_check": //TODO : verify if the user has obtain the "port" of the other player
        if (this.phaseService.state.context.turn === 38 || false) {
          // replace false with the test
          this.phaseService.stop();
          webSocketServer.broadcast("game_over", { winner: "player" });
        }
        break;
      case "turn_marker": //TODO
        this.phaseService.send("INC");
        break;
      default:
        break;
    }
    if (actualPhase !== "initial")
      webSocketServer.broadcast("phase", {
        phase: actualPhase,
        play: false,
        commands: ["select"],
        auto: true,
      });
    if (actualPhase === "air_superiority") {
      webSocketServer.sockets.forEach((socket) => {
        const checkIfCorrectPlayer = this.checkIfCorrectPlayer(
          "first_player_movement",
          webSocketServer.getPlayerFromSocket(socket).getId(),
        );
        socket.emit("phase", {
          phase: "first_player_movement",
          play: checkIfCorrectPlayer.correct,
          commands: checkIfCorrectPlayer.commands,
          auto: false,
        });
      });
      /* Ce qu'il faut mettre apres qu'on implemente reinforcements etc
    webSocketServer.broadcast("phase", {
        phase: "reinforcements",
        play: true,
        commands: ["select"],
        auto: false,
      });*/
    }
  }

  runPlayerCommand(player: Player, command: string, args: any): void {
    if (!_commands[command]) {
      if (this.isVerbose) console.log("invalid command");
      return;
    }
    if (
      !this.checkIfCorrectPlayer(
        this.phaseService.state.value.toString(),
        player.getId(),
      ).commands.includes(command)
    ) {
      // checks if the player is allowed to do the command
      player.getSocket().emit(command, { error: "invalidturncommand" });
      return;
    }
    _commands[command](player, args);
  }

  public done: boolean[] = [false, false];

  reinitDoneTable(): void {
    this.done = [false, false];
  }

  endTurn(player: Player): boolean {
    if (
      ["reinforcements", "initiative", "allocation"].includes(
        this.phaseService.state.value.toString(),
      )
    ) {
      this.done[player.getId()] = true;
      if (this.done[0] && this.done[1]) {
        this.reinitDoneTable();
        this.phaseService.send("NEXT");
        return true;
      }
    } else {
      if (this.checkIfCorrectPlayer(this.phaseService.state.value.toString(), player.getId())) {
        this.phaseService.send("NEXT");
        return true;
      } else throw new Error("wrongplayer");
    }
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
      case "first_player_reaction":
      case "first_player_movement2":
      case "first_player_reaction2":
      case "first_player_combat2": {
        if (playerId === PlayerID.ONE) return { correct: true, commands: ["move"] };
        break;
      }
      case "first_player_combat":
      case "first_player_combat2": {
        if (playerId === PlayerID.ONE) return { correct: true, commands: ["attack"] };
        break;
      }
      case "second_player_movement":
      case "second_player_reaction":
      case "second_player_movement2":
      case "second_player_reaction2": {
        if (playerId === PlayerID.TWO) return { correct: true, commands: ["move"] };
        break;
      }
      case "second_player_combat":
      case "second_player_combat2": {
        if (playerId === PlayerID.ONE) return { correct: true, commands: ["attack"] };
        break;
      }
      case "reinforcements":
        return { correct: true, commands: ["select"] };
      case "initiative":
        return { correct: true, commands: [] };
      case "allocation":
        return { correct: true, commands: ["train", "activate"] };
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
    if (
      currentPhase === "reinforcements" ||
      currentPhase === "allocation" ||
      currentPhase === "initiative"
    ) {
      webSocketServer.broadcast("phase", {
        phase: currentPhase,
        play: true,
        commands: this.checkIfCorrectPlayer(currentPhase, players[0].getId()).commands, //Doesn't matter which player id it is
        auto: false,
      });
    }
  }

  getPhaseService() {
    return this.phaseService;
  }
}

const stateMachine = new StateMachine();
export default stateMachine;
