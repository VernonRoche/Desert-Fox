import { createMachine , interpret } from 'xstate';
import webSocketServer, { SocketServer } from '../SocketServer';
import Phase, { Turn } from './Turn';

const statesWithUserInput = {
    reinforcements: {
        on: {
            NEXT : 'allocation'
        }
    },
    initiative: {
        on: {
            NEXT : 'first_player_movement'
        }
    },
    allocation: {
        on: {
            NEXT : 'initiative'
        }
    },
    first_player_movement: {
        on: {
            NEXT : 'second_player_reaction'
        }
    },
    second_player_reaction: {
        on: {
            NEXT : 'first_player_combat'
        }
    },
    first_player_combat: {
        on: {
            NEXT : 'second_player_movement'
        }
    },
    second_player_movement: {
        on: {
            NEXT : 'first_player_reaction'
        }
    },
    first_player_reaction: {
        on: {
            NEXT : 'second_player_combat'
        }
    },
    second_player_combat: {
        on: {
            NEXT : 'first_player_movement2'
        }
    },
    first_player_movement2: {
        on: {
            NEXT : 'second_player_reaction2'
        }
    },
    second_player_reaction2: {
        on: {
            NEXT : 'first_player_combat2'
        }
    },
    first_player_combat2: {
        on: {
            NEXT : 'second_player_movement2'
        }
    },
    second_player_movement2: {
        on: {
            NEXT : 'first_player_reaction2'
        }
    },
    first_player_reaction2: {
        on: {
            NEXT : 'second_player_combat2'
        }
    },
    second_player_combat2: {
        on: {
            NEXT : 'supply_attrition'
        }
    },


}
const TurnPhases = {
    initial: 'event',
    states: {
        ...statesWithUserInput,
        supply_attrition: {
            on: {
                NEXT : 'victory_check'
            }
        },
        victory_check: {
            on: {
                NEXT : 'turn_marker'
            }
        },
        turn_marker: {
            on: {
                NEXT : 'event'
            }
        },
        }
    };
createMachine({
    id: 'turn',
    ...TurnPhases
});

const TurnMachine = createMachine(TurnPhases);
const phaseService = interpret(TurnMachine).onTransition((state) => 
    console.log(state.value)).start();


console.log(phaseService.state.value);

export default phaseService;

webSocketServer.sockets.forEach((socket) => {
    socket.addListener("nextphase", () => {
        phaseService.send('NEXT');
        
        socket.emit("phase", phaseService.state.value);
        
        
        });
});
