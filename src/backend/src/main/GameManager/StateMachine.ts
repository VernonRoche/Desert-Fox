import express from "express";
import { Socket } from "socket.io";
import { createMachine, interpret, State } from "xstate";
import SocketServer from "../SocketServer";
import Player from "./Player";
import PlayerID from "./PlayerID";
import { Turn } from "./Turn";

const webSocketServer = new SocketServer(express(), 8000, 3001);
export { webSocketServer };

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
const TurnPhases = {
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
    for (const player of webSocketServer.getPlayers()) {
      if (player.getId() === PlayerID.ONE) {
        player.getSocket().emit("phase", {
          phase: "first_player_movement",
          play: true,
          commands: ["move"],
          auto: false,
        });
      }
    }
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
export function informUsers(currentPhase: string, players: Player[]): void {
  switch (currentPhase) {
    case "first_player_movement" ||
      "first_player_reaction" ||
      "first_player_movement2" ||
      "first_player_reaction2" ||
      "first_player_combat2": {
      sendToPlayers(players, PlayerID.ONE, currentPhase, ["move"]);
      break;
    }
    case "first_player_combat" || "first_player_combat2": {
      sendToPlayers(players, PlayerID.ONE, currentPhase, ["attack"]);
    }

    case "second_player_movement" ||
      "second_player_reaction" ||
      "second_player_movement2" ||
      "second_player_reaction2": {
      sendToPlayers(players, PlayerID.TWO, currentPhase, ["move"]);
      break;
    }
    case "second_player_combat" || "second_player_combat2": {
      sendToPlayers(players, PlayerID.TWO, currentPhase, ["attack"]);
      break;
    }
    case "reinforcements" || "initiative" || "allocation": {
      const validCommands =
        currentPhase === "reinforcements"
          ? ["select"]
          : currentPhase === "allocation"
          ? ["activate", "train"]
          : [];
      webSocketServer.broadcast("phase", {
        phase: currentPhase,
        play: true,
        commands: validCommands,
        auto: false,
      });
      break;
    }
    default:
      break;
  }
}

export default phaseService;
