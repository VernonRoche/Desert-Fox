import Embarkable from "../../Embarkable";
import SupplyUnit from "../../Infrastructure/SupplyUnit";
import Hex from "../../Map/Hex";
import HexID from "../../Map/HexID";
import Unit from "../../Units/Unit";
import Player from "../Player";
import { StateMachine } from "./StateMachine";

export enum commandTypes {
  move = "move",
  attack = "attack",
  units = "units",
  hex = "hex",
  embark = "embark",
  disembark = "disembark",
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
  hexIdAttacker?: string;
  hexIdDefender?: string;
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
    const hexId = +args.hexId;
    if (isNaN(hexId) && args.hexId.length !== 4) {
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
    if (!stateMachine.checkIfCorrectPlayer(stateMachine.getPhase(), _player.getId())) {
      _player.getSocket().emit(_args.type, { error: "turnerror" });
    }
    if (!_args.hexIdAttacker || !_args.hexIdDefender) {
      _player.getSocket().emit(_args.type, { error: "invalidargs" });
      return;
    }
    const attackerId = +_args.hexIdAttacker;
    if (isNaN(attackerId) && _args.hexIdAttacker.length !== 4) {
      _player.getSocket().emit(_args.type, { error: "invalidattackingunitid" });
      return;
    }
    const defenderId = +_args.hexIdDefender;
    if (isNaN(defenderId) && _args.hexIdDefender.length !== 4) {
      _player.getSocket().emit(_args.type, { error: "invaliddefendingingunitid" });
      return;
    }
    const game = stateMachine.getSocketServer().getGame();
    if (!game) {
      _player.getSocket().emit(_args.type, { error: "nogame" });
      return;
    }
    let attackerHex: Hex;
    try {
      attackerHex = game
        .getMap()
        .findHex(
          new HexID(+_args.hexIdAttacker.substring(0, 2), +_args.hexIdAttacker.substring(2, 4)),
        );
      if (!attackerHex) {
        throw new Error("attackerHex not found");
      }
    } catch (e) {
      _player.getSocket().emit(_args.type, { error: "invalidattackinghex" });
      return;
    }
    const attackers: Unit[] = attackerHex.getUnits(); //because it might be modified( for example if a unit dies in combat )
    try {
      const result = game.attackHex(
        attackers,
        new HexID(+_args.hexIdDefender.substring(0, 2), +_args.hexIdDefender.substring(2, 4)),
      );
      _player.getSocket().emit(_args.type, { error: false, result: result.attacker });
      stateMachine.getSocketServer().sockets[Math.abs(_player.getId() - 1)].emit("attackResult", {
        result: result.defender,
        defendHexId: _args.hexIdDefender,
      });
    } catch (e) {
      console.log(e);
      _player.getSocket().emit(_args.type, { error: "invalidattack" });
      return;
    }
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
    if (isNaN(toEmbarkId) && args.toEmbarkId.length !== 4) {
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
    if (isNaN(unitId) && args.embarkingId.length !== 4) {
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
        player.getSocket().emit(args.type, { error: "invaliddisembark" });
        return;
      }
      player.getSocket().emit(args.type, { error: false });
    } catch (e) {
      player.getSocket().emit(args.type, { error: "invaliddisembark" });
    }
  },
};
