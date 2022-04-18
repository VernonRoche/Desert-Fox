import HexID from "../Map/HexID";
import webSocketServer from "../SocketServer";
import Player from "./Player";
import stateMachine from "./StateMachine";

export enum commandTypes {
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

export type AllArgs = BaseCommand & (MoveArgs | AttackArgs);

type MoveArgs = {
  hexId?: string;
  unitId?: string;
};

type AttackArgs = MoveArgs & {
  combatSupply?: boolean;
};

type Commands = Record<string, (player: Player, args: AllArgs) => void>;

export const _commands: Commands = {
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
    let unit;
    try {
      unit = player.getUnitById(unitId);
    } catch (e) {
      player.getSocket().emit(args.type, { error: "invalidunitid" });
      return;
    }
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
      if (stateMachine.isVerbose) console.log("move was successful");
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
