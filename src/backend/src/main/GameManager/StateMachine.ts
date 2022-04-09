import express from "express";
import { createMachine, interpret } from "xstate";
import { check } from "yargs";
import SocketServer from "../SocketServer";
import Player from "./Player";
import PlayerID from "./PlayerID";
import { Turn } from "./Turn";

export const webSocketServer = new SocketServer(express(), 8000, 3001);

function throwError(error: string): () => void {
  return () => {
    throw new Error("invalid command for current phase : " + error);
  };
}

const commands = {
  move: throwError("move"),
  attack: throwError("attack"),
  select: throwError("select"),
  train: throwError("train"),
  activate: throwError("activate"),
};

function move(args: any): void {
  //TODO
}

function attack(args: any): void {
  //TODO
}

function importCommands(functions: ((args: any) => void)[]): any {
  const result: Record<string, (args: any) => void> = {};
  Object.assign(result, commands);
  for (const functioni of functions) {
    if (result[functioni.name]) result[functioni.name] = functioni;
  }
  return result;
}

const statesWithUserInput: Record<string, any> = {
  reinforcements: {
    on: {
      NEXT: "allocation",
    },
    commands: importCommands([
      function select(args: any): void {
        //to complete
      },
    ]),
  },
  initiative: {
    on: {
      NEXT: "first_player_movement",
    },
    commands: importCommands([]),
  },
  allocation: {
    on: {
      NEXT: "initiative",
    },
    commands: importCommands([
      function activate(args: any): void {
        //to complete
      },
      function train(args: any): void {
        //to complete
      },
    ]),
  },
  first_player_movement: {
    on: {
      NEXT: "second_player_reaction",
    },
    commands: importCommands([move]),
  },
  second_player_reaction: {
    on: {
      NEXT: "first_player_combat",
    },
    commands: importCommands([move]),
  },
  first_player_combat: {
    on: {
      NEXT: "second_player_movement",
    },
    commands: importCommands([attack]),
  },
  second_player_movement: {
    on: {
      NEXT: "first_player_reaction",
    },
    commands: importCommands([move]),
  },
  first_player_reaction: {
    on: {
      NEXT: "second_player_combat",
    },
    commands: importCommands([move]),
  },
  second_player_combat: {
    on: {
      NEXT: "first_player_movement2",
    },
    commands: importCommands([attack]),
  },
  first_player_movement2: {
    on: {
      NEXT: "second_player_reaction2",
    },
    commands: importCommands([move]),
  },
  second_player_reaction2: {
    on: {
      NEXT: "first_player_combat2",
      commands: importCommands([move]),
    },
  },
  first_player_combat2: {
    on: {
      NEXT: "second_player_movement2",
    },
    commands: importCommands([attack]),
  },
  second_player_movement2: {
    on: {
      NEXT: "first_player_reaction2",
    },
    commands: importCommands([move]),
  },
  first_player_reaction2: {
    on: {
      NEXT: "second_player_combat2",
    },
    commands: importCommands([move]),
  },
  second_player_combat2: {
    on: {
      NEXT: "supply_attrition",
    },
    commands: importCommands([attack]),
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

const TurnMachine = createMachine(TurnPhases);
const phaseService = interpret(TurnMachine).start();
runPhaseActions(phaseService.state.value.toString());
phaseService.onTransition((state) => {
  if (!(state.value.toString() in statesWithUserInput)) {
    runPhaseActions(state.value.toString());
    console.log("phase : " + state.value.toString());
    phaseService.send("NEXT");
  }
});

function runPhaseActions(actualPhase: string): void {
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
      phase: "first_player_movement",
      play: true,
      commands: ["move"],
      auto: false,
    });
  }
}

let done: boolean[] = [false, false];
export function reinitDoneTable(): void {
  done = [false, false];
}
export function endTurn(player: Player): void {
  if (
    ["reinforcements", "initiative", "allocation"].includes(phaseService.state.value.toString())
  ) {
    if (done[0] && done[1]) {
      done[0] = false;
      done[1] = false;
      phaseService.send("NEXT");
      return;
    }
    done[player.getId()] = true;
  } else {
    if (checkIfCorrectPlayer(phaseService.state.value.toString(), player.getId()))
      phaseService.send("NEXT");
    else throw new Error("wrongplayer");
  }
}

function sendToPlayers(
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

function checkIfCorrectPlayer(
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
      return { correct: true, commands: ["move"] };
    case "initiative":
      return { correct: true, commands: [] };
    case "allocation":
      return { correct: true, commands: ["train", "activate"] };
    default:
      return { correct: false, commands: [] };
  }
  return { correct: false, commands: [] };
}
export function informUsers(currentPhase: string, players: Player[]): void {
  const correctPlayerId = checkIfCorrectPlayer(currentPhase, players[0].getId()).correct
    ? players[0].getId()
    : players[1].getId();
  sendToPlayers(
    players,
    correctPlayerId,
    currentPhase,
    checkIfCorrectPlayer(currentPhase, correctPlayerId).commands,
  );
  if (
    currentPhase === "reinforcements" ||
    currentPhase === "allocation" ||
    currentPhase === "initiative"
  ) {
    webSocketServer.broadcast("phase", {
      phase: currentPhase,
      play: true,
      commands: checkIfCorrectPlayer(currentPhase, players[0].getId()).commands, //Doesn't matter which player id it is
      auto: false,
    });
  }
}

export default phaseService;
