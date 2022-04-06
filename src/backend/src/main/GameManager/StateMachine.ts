import { createMachine, interpret, State } from "xstate";
import HexID from "../Map/HexID";
import webSocketServer, { SocketServer } from "../SocketServer";
import Player from "./Player";

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
  const result = {};
  Object.assign(result, commands);
  for (const functioni of functions) {
    //@ts-expect-error playing with fire
    if (result[functioni.name]) result[functioni.name] = key;
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
  initial: "air_superiority",
  states: {
    ...statesWithUserInput,
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
const phaseService = interpret(TurnMachine)
  .onTransition((state) => {
    if (!(state.value.toString() in statesWithUserInput)) {
      runPhaseActions(state.value.toString());
    }
  })
  .start();

function runPhaseActions(actualPhase: string): void {
  while (!(actualPhase in statesWithUserInput)) {
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
    phaseService.send("NEXT");
    webSocketServer.broadcast("auto", actualPhase);
  }
}

export default phaseService;

webSocketServer.sockets.forEach((socket) => {
  socket.addListener("nextphase", (args) => {
    phaseService.send("NEXT");
    //to skip phases with no user input
    while (!(phaseService.state.value.toString() in statesWithUserInput)) {
      phaseService.send("NEXT");
    }
    socket.emit("phase", phaseService.state.value);
  });
});
