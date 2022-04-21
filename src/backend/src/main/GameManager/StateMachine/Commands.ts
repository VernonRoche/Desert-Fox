import Embarkable from "../../Embarkable";
import SupplyUnit from "../../Infrastructure/SupplyUnit";
import HexID from "../../Map/HexID";
import Player from "../Player";
import { StateMachine } from "./StateMachine";

export enum commandTypes {
  move = "move",
  attack = "attack",
  units = "units",
  hex = "hex",
}

type BaseCommand = {
  type: string;
};

export type AllArgs = BaseCommand & (MoveArgs | AttackArgs | EmbarkArgs);

type MoveArgs = {
  hexId?: string;
  unitId?: string;
};

type EmbarkArgs = {
  embarkingId?: string; // l'unit qui embark
  toEmbarkId?: string; // l'unit qui va être embarqué
};

type AttackArgs = MoveArgs & {
  combatSupply?: boolean;
};

type Commands = Record<string, (stateMachine: StateMachine, player: Player, args: AllArgs) => void>;

export const _commands: Commands = {
  move: (stateMachine: StateMachine, player: Player, args: MoveArgs & BaseCommand) => {
    if (!stateMachine.checkIfCorrectPlayer(stateMachine.getPhase(), player.getId())) {
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
      unit = player.getMoveableById(unitId);
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
      console.log("Moving unit right there");
      const game = stateMachine.getSocketServer().getGame();
      if (!game) {
        player.getSocket().emit(args.type, { error: "nogame" });
        return;
      }
      game.moveUnit(player, unit, new HexID(y, x));
      if (stateMachine.isVerbose) console.log("move was successful");
      player.getSocket().emit(args.type, { error: false });
    } catch (e) {
      player.getSocket().emit(args.type, { error: "invalidmove" });
    }
  },
  units: (stateMachine: StateMachine, player: Player) => {
    const playerUnits = player.getUnits();
    player.getSocket().emit("units", playerUnits);
  },
  hex(stateMachine: StateMachine, player: Player, args: MoveArgs & BaseCommand) {
    const game = stateMachine.getSocketServer().getGame();
    if (!game) {
      player.getSocket().emit(args.type, { error: "nogame" });
      return;
    }
    if (!args.hexId) {
      player.getSocket().emit(args.type, { error: "invalidhexid" });
      return;
    }
    const hex = game
      .getMap()
      .findHex(new HexID(+args.hexId.substring(0, 2), +args.hexId.substring(2, 4)));
    const units = hex.getUnits();
    const bases = hex.getBase();
    const dumps = hex.getDumps();
    const supplyUnits = hex.getSupplyUnits();
    player.getSocket().emit(args.type, { units, bases, dumps, supplyUnits });
  },
  attack: (stateMachine: StateMachine, _player: Player, _args: AttackArgs & BaseCommand) => {
    //TODO
  },
  embark: (stateMachine: StateMachine, player: Player, args: BaseCommand & EmbarkArgs) => {
    if (!args.embarkingId || !args.toEmbarkId) {
      player.getSocket().emit(args.type, { error: "invalidargs" });
      return;
    }
    const unitId = +args.embarkingId;
    if (isNaN(unitId)) {
      player.getSocket().emit(args.type, { error: "invalidsupplyunitid" });
      return;
    }
    let unit;
    try {
      unit = player.getEntityById(unitId);
    } catch (e) {
      player.getSocket().emit(args.type, { error: "invalidsupplyunitid" });
      return;
    }
    if (!unit) {
      player.getSocket().emit(args.type, { error: "invalidsupplyunit" });
      return;
    }

    const toEmbarkId = +args.toEmbarkId;
    if (isNaN(toEmbarkId)) {
      player.getSocket().emit(args.type, { error: "invalidembarkid" });
      return;
    }
    let toEmbark;
    try {
      toEmbark = player.getEntityById(toEmbarkId);
    } catch (e) {
      player.getSocket().emit(args.type, { error: "invalidembarkid" });
      return;
    }
    if (!toEmbark) {
      player.getSocket().emit(args.type, { error: "invalidembarkunit" });
      return;
    }
    try {
      const game = stateMachine.getSocketServer().getGame();
      if (!game) {
        player.getSocket().emit(args.type, { error: "nogame" });
        return;
      }
      game.embarkEntity(player, unit as SupplyUnit, toEmbark as Embarkable);
      player.getSocket().emit(args.type, { error: false });
    } catch (e) {
      player.getSocket().emit(args.type, { error: "invalidembark" });
    }
  },
  disembark: (stateMachine: StateMachine, player: Player, args: BaseCommand & EmbarkArgs) => {
    if (!args.embarkingId) {
      player.getSocket().emit(args.type, { error: "invalidargs" });
      return;
    }
    const unitId = +args.embarkingId;
    if (isNaN(unitId)) {
      player.getSocket().emit(args.type, { error: "invalidsupplyunitid" });
      return;
    }
    let unit;
    try {
      unit = player.getEntityById(unitId);
    } catch (e) {
      player.getSocket().emit(args.type, { error: "invalidsupplyunitid" });
      return;
    }
    if (!unit) {
      player.getSocket().emit(args.type, { error: "invalidsupplyunit" });
      return;
    }
    try {
      const game = stateMachine.getSocketServer().getGame();
      if (!game) {
        player.getSocket().emit(args.type, { error: "nogame" });
        return;
      }
      const toDisembark: Embarkable | undefined = game.disembarkEntity(player, unit as SupplyUnit);
      if (!toDisembark) {
        player.getSocket().emit(args.type, { error: "invalidisembark" });
        return;
      }
      player.getSocket().emit(args.type, { error: false });
    } catch (e) {
      player.getSocket().emit(args.type, { error: "invaliddisembark" });
    }
  },
};
