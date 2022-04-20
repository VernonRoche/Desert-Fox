import Player from "./Player";
import GameMap from "../Map/GameMap";
import Unit from "../Units/Unit";
import HexID from "../Map/HexID";
import Pathfinder from "./Pathfinder";
import Base from "../Infrastructure/Base";
import Moveable from "../Moveable";
import Dump from "../Infrastructure/Dump";
import { loadEntitiesAndMap } from "./EntityLoader";
import CombatSimulator, { DamageResult, MoraleResult } from "./CombatSimulator";
import Maps from "../Map/Maps";
import Embarkable from "../Embarkable";
import SupplyUnit from "../Infrastructure/SupplyUnit";

const BASE_RANGE = 14;
const SUPPLYUNIT_RANGE = 7;
const DUMP_RANGE = 7;
export default class Game {
  private _player1: Player;
  private _player2: Player;
  private _map: GameMap;
  private _pathfinder: Pathfinder;

  public constructor(player1: Player, player2: Player) {
    this._player1 = player1;
    this._player2 = player2;
    this._map = new GameMap(Maps.LIBYA, loadEntitiesAndMap(this));
    this._pathfinder = new Pathfinder(this._map);
    // Initialize Pathfinder
  }

  // check if a move is possible
  // it does not apply move
  // return true if can move
  // return a string containing the reason if it cannot
  // do not try if(canMove) since it will always be true
  // check if(canMove === true)
  public canMove(
    player: Player,
    unit: Moveable,
    destination: HexID,
  ): { movePossible: boolean; cost: number } | string {
    const destinationHex = this._map.findHex(destination);
    if (!destinationHex) return "hex does not exist";

    // Check if unit exists and that the player owns it
    if (!player.hasEntity(unit)) return "that unit does not exist";
    if (unit.getType() === "foot")
      if ((unit as unknown as Embarkable).isEmbarked()) return "unit is embarked";

    // Check if the player owns the unit
    if (!this._map.hexBelongsToPlayer(destination, player))
      return "enemies are present in this hex";

    // Check if the remaining movement points are enough by using Pathfinder
    // Has to be proven, because now we take the weight of the Pathfinder result.
    // Which may or may not represent the real cost in movement points.

    const { sumOfWeight } = this._pathfinder.findShortestWay(
      unit.getCurrentPosition(),
      destination,
      player,
      unit.getType(),
    );

    if (sumOfWeight > unit.getRemainingMovementPoints()) return "not enough movement points";

    // Check if move is possible
    return { movePossible: true, cost: sumOfWeight };
  }

  // Checks all units of a player and returns the list of units that can move
  public availableUnitsToMove(player: Player): Unit[] {
    const availableUnits: Unit[] = [];
    for (const unit of player.getUnits()) {
      for (const neighbourHex of this._map.findHex(unit.getCurrentPosition()).getNeighbours()) {
        const canMove = this.canMove(player, unit, neighbourHex.getID());
        if (typeof canMove === "string") {
          throw new Error(canMove);
        }
        const { movePossible } = canMove;
        if (movePossible) {
          availableUnits.push(unit);
          break;
        }
      }
    }
    return availableUnits;
  }

  embarkEntity(player: Player, supplyUnit: SupplyUnit, toEmbark: Embarkable): void {
    if (!player.hasEntity(supplyUnit)) {
      throw new Error("supply unit does not exist");
    }
    if (!player.hasEntity(toEmbark)) {
      throw new Error("embarkable entity does not exist");
    }
    if (toEmbark.getCurrentPosition().toString() !== supplyUnit.getCurrentPosition().toString()) {
      throw new Error("embarkable entity is not in the same hex as the supply unit");
    }
    const hex = this._map.findHex(supplyUnit.getCurrentPosition());
    try {
      supplyUnit.embark(toEmbark);
    } catch (e) {
      throw new Error("already embarked");
    }
    hex.removeEntity(toEmbark);
  }

  disembarkEntity(player: Player, supplyUnit: SupplyUnit): void {
    if (!player.hasEntity(supplyUnit)) {
      throw new Error("supply unit does not exist");
    }
    let toDisembark: Embarkable;
    try {
      toDisembark = supplyUnit.disembark();
    } catch (e) {
      throw new Error("no entity to disembark");
    }
    const hex = this._map.findHex(supplyUnit.getCurrentPosition());
    hex.addEntity(toDisembark);
  }

  // Checks if a move is possible and applies it.
  // Returns false if the move was not possible, true if move was succesful.
  public moveUnit(player: Player, unit: Moveable, destination: HexID): void {
    const canMove = this.canMove(player, unit, destination);
    if (typeof canMove === "string") {
      throw new Error(canMove);
    }
    if (
      unit.getType() !== "SupplyUnit" &&
      !(
        unit.getType() !== "motorized" ||
        unit.getType() !== "motorized" ||
        unit.getType() !== "mechanized"
      )
    ) {
      throw new Error("unit is not a supply unit or a unit, its a " + unit.getType());
    }
    const { movePossible, cost } = canMove;
    if (!movePossible) {
      throw new Error(`Cannot move unit: ${canMove}`);
    }

    // Check if move is possible
    const originHex = this._map.findHex(unit.getCurrentPosition());
    const destinationHex = this._map.findHex(destination);
    destinationHex.addEntity(unit);
    originHex.removeEntity(unit);
    unit.place(destination);
    unit.move(cost);
  }
  checkUnitSupplies(
    player: Player,
    units: Moveable[],
    bases: Base[],
    dumps: Dump[],
    supplyUnits: Moveable[],
  ): boolean {
    let found = false;
    for (const unit of units) {
      for (const base of bases) {
        // check if unit is connected to base
        if (
          this._pathfinder.findShortestWay(
            unit.getCurrentPosition(),
            base.getCurrentPosition(),
            this._player1,
          ).sumOfWeight <= BASE_RANGE
        ) {
          found = true;
          break;
        }
      }
    }
    if (found) return true;
    for (const unit of units) {
      for (const dump of dumps) {
        // check if unit is connected to dump
        if (dump.isEmbarked()) continue;
        if (
          this._pathfinder.findShortestWay(
            unit.getCurrentPosition(),
            dump.getCurrentPosition(),

            this._player1,
          ).sumOfWeight <= DUMP_RANGE
        ) {
          this._map.removeDump(dump);
          player.removeDump(dump);
          found = true;
          break;
        }
      }
    }
    if (found) return true;
    return this.checkUnitSupplies(player, supplyUnits, bases, dumps, []);
  }

  verifySupplies(playerId: number): void {
    if (playerId !== 1 && playerId !== 2) {
      return;
    }
    const player = playerId === 1 ? this._player1 : this._player2;

    const playerBases = player.getBases();
    const playerDumps = player.getDumps();
    const playerUnits = player.getUnits();
    const playerSupplies = player.getSupplyUnits();
    playerUnits.forEach((unit) => {
      if (
        !this.checkUnitSupplies(
          player,
          [unit],
          playerBases,
          playerDumps,
          playerSupplies.filter(
            (supplyUnit) =>
              this._pathfinder.findShortestWay(
                unit.getCurrentPosition(),
                supplyUnit.getCurrentPosition(),
                player,
              ).sumOfWeight <= SUPPLYUNIT_RANGE,
          ),
        )
      ) {
        // apply disrupted
      }
    });
  }

  public attackHex(
    attackers: Unit[],
    destination: HexID,
  ): {
    attacker: { damage: DamageResult; morale: MoraleResult };
    defender: { damage: DamageResult; morale: MoraleResult };
  } {
    // Check if the attackers are at least 1 unit
    if (attackers.length < 1) {
      throw new Error("No attackers");
    }

    const destinationHex = this._map.findHex(destination);
    const originHex = this._map.findHex(attackers[0].getCurrentPosition());
    if (!destinationHex) {
      throw new Error(`Hex ${destination} does not exist.`);
    }
    let attackerPlayer: Player;
    // Player 1 attacks
    if (this._map.hexBelongsToPlayer(originHex.getID(), this._player1)) {
      if (!this._map.hexBelongsToPlayer(destination, this._player1)) {
        attackerPlayer = this._player1;
      } else {
        throw new Error(`Hex ${destination} does not have enemies for Player 1.`);
      }
    }
    // Player 2 attacks
    else {
      if (!this._map.hexBelongsToPlayer(destination, this._player2)) {
        attackerPlayer = this._player2;
      } else {
        throw new Error(`Hex ${destination} does not have enemies for Player 2.`);
      }
    }
    const defenderPlayer = attackerPlayer === this._player1 ? this._player2 : this._player1;

    // Check if the unit is in range
    if (!destinationHex.getNeighbours().includes(originHex)) {
      throw new Error(`Unit ${attackers[0].getId()} is not in range of hex ${destination}.`);
    }

    // Get combat results
    let result = CombatSimulator.combatResult(
      destinationHex.getTerrain().terrainType,
      attackers.length,
      destinationHex.getUnits().length,
      1,
      false,
    );

    // Get total hp of defenders and attacker supplies
    let lifePointsLost = 0;
    const defenderLifePoints = [0, 0, 0, 0, 0];
    const attackerSupplies = new Map<number, boolean>();
    for (const defender of destinationHex.getUnits()) {
      defenderLifePoints[defender.getMoraleRating() - 1] += defender.getLifePoints();
    }
    for (const attacker of attackers) {
      // TO IMPLEMENT USING SUPPLY PATHFINDER
      attackerSupplies.set(attacker.getId(), true);
    }

    // Determine combat results for defenders
    for (let i = 0; i < 5; i++) {
      if (defenderLifePoints[i] === 0) {
        continue;
      }
      result = CombatSimulator.combatResult(
        destinationHex.getTerrain().terrainType,
        attackers.length,
        destinationHex.getUnits().length,
        i + 1,
        false,
      );
      switch (result["defender"]["damage"]) {
        case DamageResult.E:
          break;
        case DamageResult.H:
          defenderLifePoints[i] = Math.round(defenderLifePoints[i] / 2);
          break;
        case DamageResult.Q:
          defenderLifePoints[i] = Math.round(defenderLifePoints[i] / 4);
          break;
        case DamageResult.NONE:
          break;
        default:
          throw new Error(`Unknown damage result: ${result["defender"]["damage"]}`);
      }
      // Apply damage results to defender units
      const destroyedDefenders: Unit[] = [];
      let defenders = destinationHex.getUnits();
      for (const defenderUnit of defenders) {
        if (defenderUnit.getMoraleRating() - 1 === i) {
          switch (result["defender"]["damage"]) {
            case DamageResult.E:
              defenderPlayer.removeUnit(defenderUnit);
              destinationHex.removeUnit(defenderUnit);
              destroyedDefenders.push(defenderUnit);
              break;
            case DamageResult.H:
            case DamageResult.Q:
              if (defenderUnit.getLifePoints() === 2 && defenderLifePoints[i] >= 2) {
                defenderPlayer.removeUnit(defenderUnit);
                destinationHex.removeUnit(defenderUnit);
                destroyedDefenders.push(defenderUnit);
                defenderLifePoints[i] -= 2;
                lifePointsLost += 2;
              } else if (defenderLifePoints[i] >= 1) {
                defenderUnit.removeLifePoints(1);
                if (defenderUnit.getLifePoints() === 0) {
                  defenderPlayer.removeUnit(defenderUnit);
                  destinationHex.removeUnit(defenderUnit);
                  destroyedDefenders.push(defenderUnit);
                }
                defenderLifePoints[i] -= 1;
                lifePointsLost += 1;
              }
              break;
            case DamageResult.NONE:
              break;
            default:
              throw new Error(`Unknown damage result: ${result["defender"]["damage"]}`);
          }
        }
      }
      defenders = defenders.filter((defender) => !destroyedDefenders.includes(defender));
      // Apply morale results to defender units
      for (const defenderUnit of defenders) {
        if (defenderUnit.getMoraleRating() - 1 === i) {
          switch (result["defender"]["morale"]) {
            case MoraleResult.M:
              if (!defenderUnit.moraleCheck()) {
                for (const hexNeighbour of destinationHex.getNeighbours()) {
                  if (
                    this._map.hexBelongsToPlayer(hexNeighbour.getID(), defenderPlayer) &&
                    hexNeighbour.getUnits().length === 0
                  ) {
                    hexNeighbour.addUnit(defenderUnit);
                    destinationHex.removeUnit(defenderUnit);
                    defenderUnit.place(hexNeighbour.getID());
                    break;
                  }
                }
              }
              break;
            case MoraleResult.D:
              // DISRUPT UNIT
              break;
            case MoraleResult.R:
            case MoraleResult.W:
              for (const hexNeighbour of destinationHex.getNeighbours()) {
                if (
                  this._map.hexBelongsToPlayer(hexNeighbour.getID(), defenderPlayer) &&
                  hexNeighbour.getUnits().length === 0
                ) {
                  hexNeighbour.addUnit(defenderUnit);
                  destinationHex.removeUnit(defenderUnit);
                  defenderUnit.place(hexNeighbour.getID());
                  break;
                }
              }
              // DISRUPT UNIT
              break;
            case MoraleResult.NONE:
              break;
            default:
              throw new Error(`Unknown morale result: ${result["defender"]["morale"]}`);
          }
        }
      }
    }

    // Determine combat results for attackers
    if (result["attacker"]["damage"] === DamageResult.X) {
      lifePointsLost = lifePointsLost / 2;
    }
    let attackerLifePoints = 0;
    for (const attacker of attackers) {
      attackerLifePoints += attacker.getLifePoints();
    }
    if (result["attacker"]["damage"] === DamageResult.H) {
      attackerLifePoints = Math.round(attackerLifePoints * 0.5);
    }
    if (result["attacker"]["damage"] === DamageResult.Q) {
      attackerLifePoints = Math.round(attackerLifePoints * 0.25);
    }
    const destroyedAttackers: Unit[] = [];
    for (const attacker of attackers) {
      switch (result["attacker"]["damage"]) {
        case DamageResult.XX:
        case DamageResult.X:
          if (attacker.getLifePoints() === 2 && lifePointsLost >= 2) {
            attackerPlayer.removeUnit(attacker);
            originHex.removeUnit(attacker);
            destroyedAttackers.push(attacker);
            lifePointsLost -= 2;
          } else if (lifePointsLost >= 1) {
            attacker.removeLifePoints(1);
            if (attacker.getLifePoints() === 0) {
              attackerPlayer.removeUnit(attacker);
              originHex.removeUnit(attacker);
              destroyedAttackers.push(attacker);
            }
            lifePointsLost -= 1;
          }
          break;
        case DamageResult.H:
        case DamageResult.Q:
          if (attacker.getLifePoints() === 2 && attackerLifePoints >= 2) {
            attackerPlayer.removeUnit(attacker);
            originHex.removeUnit(attacker);
            destroyedAttackers.push(attacker);
            attackerLifePoints -= 2;
            lifePointsLost += 2;
          } else if (attackerLifePoints >= 1) {
            attacker.removeLifePoints(1);
            if (attacker.getLifePoints() === 0) {
              attackerPlayer.removeUnit(attacker);
              originHex.removeUnit(attacker);
              destroyedAttackers.push(attacker);
            }
            attackerLifePoints -= 1;
            lifePointsLost += 1;
          }
          break;
        case DamageResult.E:
          attackerPlayer.removeUnit(attacker);
          originHex.removeUnit(attacker);
          destroyedAttackers.push(attacker);
          break;
        case DamageResult.NONE:
          break;
        default:
          throw new Error(`Unknown damage result: ${result["attacker"]["damage"]}`);
      }
    }
    attackers = attackers.filter((attacker) => !destroyedAttackers.includes(attacker));
    // Apply morale results to attacker units
    for (const attacker of attackers) {
      switch (result["attacker"]["morale"]) {
        case MoraleResult.M:
          if (!attacker.moraleCheck()) {
            for (const hexNeighbour of originHex.getNeighbours()) {
              if (
                this._map.hexBelongsToPlayer(hexNeighbour.getID(), attackerPlayer) &&
                hexNeighbour.getUnits().length === 0
              ) {
                hexNeighbour.addUnit(attacker);
                originHex.removeUnit(attacker);
                attacker.place(hexNeighbour.getID());
                break;
              }
            }
          }
          break;
        case MoraleResult.D:
          // DISRUPT UNIT
          break;
        case MoraleResult.R:
        case MoraleResult.W:
          for (const hexNeighbour of originHex.getNeighbours()) {
            if (
              this._map.hexBelongsToPlayer(hexNeighbour.getID(), attackerPlayer) &&
              hexNeighbour.getUnits().length === 0
            ) {
              hexNeighbour.addUnit(attacker);
              originHex.removeUnit(attacker);
              attacker.place(hexNeighbour.getID());
              break;
            }
          }
          // DISRUPT UNIT
          break;
        case MoraleResult.NONE:
          break;
        default:
          throw new Error(`Unknown morale result: ${result["attacker"]["morale"]}`);
      }
    }
    return result;
  }

  getPlayer1(): Player {
    return this._player1;
  }

  getPlayer2(): Player {
    return this._player2;
  }

  getMap(): GameMap {
    return this._map;
  }

  getPathfinder(): Pathfinder {
    return this._pathfinder;
  }
}
