import { Socket } from "socket.io";
import { createMachine, interpret } from "xstate";
import HexID from "../Map/HexID";
import webSocketServer from "../SocketServer";
import Player from "./Player";
import PlayerID from "./PlayerID";

enum commandTypes {
  move = "move",
  attack = "attack",
  select = "select",
  train = "train",
  activate = "activate",
  units = "units",
}

type BaseCommand = {
  type: string;
};

type AllArgs = BaseCommand & (MoveArgs | AttackArgs);

type MoveArgs = {
  hexId?: string;
  unitId?: string;
};

type AttackArgs = MoveArgs & {
  combatSupply?: boolean;
};

type Commands = Record<string, (player: Player, args: AllArgs) => void>;

const _commands: Commands = {
  move: (player: Player, args: MoveArgs & BaseCommand) => {
    if (
      (player.getId() === 0 &&
        stateMachine.getPhaseService().state.value !== "first_player_movement" &&
        stateMachine.getPhaseService().state.value !== "first_player_movement2") ||
      (player.getId() === 1 &&
        stateMachine.getPhaseService().state.value !== "second_player_movement" &&
        stateMachine.getPhaseService().state.value !== "second_player_movement2")
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
    if (args.hexId.length !== 4) {
      player.getSocket().emit(args.type, { error: "invalidhex" });
      return;
    }
    const x = +args.hexId.substring(2, 4);
    const y = +args.hexId.substring(0, 2);
    if (isNaN(x) || isNaN(y) || args.hexId.length !== 4) {
      player.getSocket().emit(args.type, { error: "invalidhex" });
      return;
    }
    try {
      webSocketServer.getGame()?.moveUnit(player, unit, new HexID(y, x));
      console.log("move was successful");
      player.getSocket().emit(args.type, { error: false });
    } catch (e) {
      player.getSocket().emit(args.type, { error: "invalidmove" });
    }
  },
  units: (player: Player) => {
    const playerUnits = player.getUnits();
    player.getSocket().emit("units", playerUnits);
  },
  attack: (_player: Player, _args: AttackArgs & BaseCommand) => {
    //TODO
  },
  select: (_player: Player, _args: MoveArgs & BaseCommand) => {
    //TODO
  },
  activate: (_player: Player, _args: MoveArgs & BaseCommand) => {
    //TODO
  },
};

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
  states: {
    ...statesWithUserInput,
    initial: {
      on: {
        NEXT: "air_superiority",
      },
    },
    air_superiority: {
      on: {
        NEXT: "reinforcements",
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
  },
};

createMachine({
  id: "turn",
  ...TurnPhases,
});

export class StateMachine {
  private phaseService;

  constructor() {
    const TurnMachine = createMachine(TurnPhases);
    this.phaseService = interpret(TurnMachine).start();
    this.runPhaseActions(this.phaseService.state.value.toString());
    this.phaseService.onTransition((state) => {
      if (!(state.value.toString() in statesWithUserInput)) {
        this.runPhaseActions(state.value.toString());
        console.log("phase : " + state.value.toString());
        this.phaseService.send("NEXT");
      }
    });
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
      console.log("done");
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
      case "victory_check": //TODO
        break;
      case "turn_marker": //TODO
        break;
      default:
        break;
    }
    if (actualPhase !== "initial")
      webSocketServer.broadcast("phase", {
        phase: actualPhase,
        play: false,
        commands: [],
        auto: true,
      });
    if (actualPhase === "air_superiority") {
      webSocketServer.broadcast("phase", {
        phase: "reinforcements",
        play: true,
        commands: ["move"],
        auto: false,
      });
    }
  }

  runPlayerCommand(player: Player, command: string, args: any): void {
    if (!_commands[command]) {
      console.log("invalid command");
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
  getPhaseService(): any {
    return this.phaseService;
  }
}

const stateMachine = new StateMachine();
export default stateMachine;
