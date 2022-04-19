import { assign } from "xstate";

type State = {
  on: {
    NEXT: string;
  };
};

export const statesWithUserInput: Record<string, State> = {
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
