import { assign } from "xstate";

type State = {
  on: {
    NEXT: string;
  };
};

export const statesWithUserInput: Record<string, State> = {
  first_player_movement: {
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
      NEXT: "second_player_combat2",
    },
  },
  second_player_combat2: {
    on: {
      NEXT: "victory_check",
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
        NEXT: "first_player_movement",
      },
    },
    victory_check: {
      on: {
        NEXT: "turn_marker",
      },
    },
    turn_marker: {
      on: {
        NEXT: "first_player_movement",
      },
    },
  },
  on: {
    RESET: {
      target: ".initial",
    },
    INC: { actions: assign({ turn: (context: { turn: number }) => context.turn + 1 }) },
  },
};
