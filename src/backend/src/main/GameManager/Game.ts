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
    this._map = new GameMap(Maps.LIBYA ,loadEntitiesAndMap(this));
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
    unit: Unit,
    destination: HexID,
  ): { movePossible: boolean; cost: number } | string {
    const destinationHex = this._map.findHex(destination);
    if (!destinationHex) return "hex does not exist";

    // Check if unit exists and that the player owns it
    if (!player.hasUnit(unit)) return "that unit does not exist";

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
  

  // Checks if a move is possible and applies it.
  // Returns false if the move was not possible, true if move was succesful.
  public moveUnit(player: Player, unit: Unit, destination: HexID): void {
    const canMove = this.canMove(player, unit, destination);
    if (typeof canMove === "string") {
      throw new Error(canMove);
    }
    const { movePossible, cost } = canMove;
    if (!movePossible) {
      throw new Error(`Cannot move unit: ${canMove}`);
    }

    // Check if move is possible
    const originHex = this._map.findHex(unit.getCurrentPosition());
    const destinationHex = this._map.findHex(destination);
    destinationHex.addUnit(unit);
    originHex.removeUnit(unit);
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
        if (
          this._pathfinder.findShortestWay(
            unit.getCurrentPosition(),
            dump.getCurrentPosition(),
            
            this._player1,
          ).sumOfWeight <= DUMP_RANGE
        ) {

          found = true;
          break;
        }
      }
    }
    if (found) return true;
    return this.checkUnitSupplies(player, supplyUnits, bases, dumps, []);
  }

  checkSupplies() {
    const player1Bases = this._player1.getBases();
    const player1Dumps = this._player1.getDumps();
    const player1Units = this._player1.getUnits();
    const player1Supplies = this._player1.getSupplyUnits();
    player1Units.forEach((unit) =>
      this.checkUnitSupplies(
        this._player1,
        [unit],
        player1Bases,
        player1Dumps,
        player1Supplies.filter(
          (supplyUnit) =>
            this._pathfinder.findShortestWay(
              unit.getCurrentPosition(),
              supplyUnit.getCurrentPosition(),
              this._player1,
            ).sumOfWeight <= SUPPLYUNIT_RANGE,
        ),
      ),
    );
    const player2Bases = this._player2.getBases();
    const player2Dumps = this._player2.getDumps();
    const player2Units = this._player2.getUnits();
    const player2Supplies = this._player2.getSupplyUnits();
    player2Units.forEach((unit) =>
      this.checkUnitSupplies(
        this._player2,
        [unit],
        player2Bases,
        player2Dumps,
        player2Supplies.filter(
          (supplyUnit) =>
            this._pathfinder.findShortestWay(
              unit.getCurrentPosition(),
              supplyUnit.getCurrentPosition(),
              this._player1,
            ).sumOfWeight <= SUPPLYUNIT_RANGE,
        ),
      ),
    );
  }

  public attackHex(attackers: Unit[], destination: HexID): void {
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
    if (this._map.hexBelongsToPlayer(attackers[0].getCurrentPosition(), this._player1)) {
      if (this._map.hexBelongsToPlayer(destination, this._player2)) {
        attackerPlayer = this._player1;
      } else {
        throw new Error(`Hex ${destination} does not have enemies for Player 1.`);
      }
    }
    // Player 2 attacks
    else {
      if (this._map.hexBelongsToPlayer(destination, this._player1)) {
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
      defenderLifePoints[defender.getMoraleRating()] += defender.getLifePoints();
    }
    for (const attacker of attackers) {
      // TO IMPLEMENT USING SUPPLY PATHFINDER
      attackerSupplies.set(attacker.getId(), true);
    }

    // Determine combat results for defenders
    for (let i = 2; i <= 5; i++) {
      switch (result["defender"]["damage"]) {
        case DamageResult.E:
          break;
        case DamageResult.H:
          defenderLifePoints[i] = Math.round(defenderLifePoints[i] * 0.5);
          break;
        case DamageResult.Q:
          defenderLifePoints[i] = Math.round(defenderLifePoints[i] * 0.25);
          break;
        case DamageResult.NONE:
          break;
        default:
          throw new Error(`Unknown damage result: ${result["defender"]["damage"]}`);
      }
      // Apply damage results to defender units
      for (const defenderUnit of destinationHex.getUnits()) {
        if (defenderUnit.getMoraleRating() === i) {
          switch (result["defender"]["damage"]) {
            case DamageResult.E:
              defenderPlayer.removeUnit(defenderUnit);
              destinationHex.removeUnit(defenderUnit);
              break;
            case DamageResult.H || DamageResult.Q:
              if (defenderUnit.getLifePoints() === 2 && defenderLifePoints[i] >= 2) {
                defenderPlayer.removeUnit(defenderUnit);
                destinationHex.removeUnit(defenderUnit);
                defenderLifePoints[i] -= 2;
                lifePointsLost += 2;
              } else if (defenderLifePoints[i] >= 1) {
                defenderUnit.removeLifePoints(1);
                if (defenderUnit.getLifePoints() === 0) {
                  defenderPlayer.removeUnit(defenderUnit);
                  destinationHex.removeUnit(defenderUnit);
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
      // Apply morale results to defender units
      for (const defenderUnit of destinationHex.getUnits()) {
        if (defenderUnit.getMoraleRating() === i) {
          switch (result["defender"]["morale"]) {
            case MoraleResult.M:
              if (!defenderUnit.moraleCheck()) {
                for (const hexNeighbour of destinationHex.getNeighbours()) {
                  if (
                    this._map.hexBelongsToPlayer(hexNeighbour.getID(), defenderPlayer) &&
                    hexNeighbour.getUnits().length === 0
                  ) {
                    this.moveUnit(defenderPlayer, defenderUnit, hexNeighbour.getID());
                    break;
                  }
                }
              }
              break;
            case MoraleResult.D:
              // DISRUPT UNIT
              break;
            case MoraleResult.W || MoraleResult.R:
              for (const hexNeighbour of destinationHex.getNeighbours()) {
                if (
                  this._map.hexBelongsToPlayer(hexNeighbour.getID(), defenderPlayer) &&
                  hexNeighbour.getUnits().length === 0
                ) {
                  this.moveUnit(defenderPlayer, defenderUnit, hexNeighbour.getID());
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
      result = CombatSimulator.combatResult(
        destinationHex.getTerrain().terrainType,
        attackers.length,
        destinationHex.getUnits().length,
        i,
        false,
      );
    }

    // Determine combat results for attackers
    if (result["attacker"]["damage"] === DamageResult.X) {
      lifePointsLost = lifePointsLost / 2;
    }
    for (const attacker of attackers) {
      switch (result["attacker"]["damage"]) {
        case DamageResult.XX || DamageResult.X:
          if (attacker.getLifePoints() === 2 && lifePointsLost >= 2) {
            attackerPlayer.removeUnit(attacker);
            originHex.removeUnit(attacker);
            lifePointsLost -= 2;
          } else if (lifePointsLost >= 1) {
            attacker.removeLifePoints(1);
            if (attacker.getLifePoints() === 0) {
              attackerPlayer.removeUnit(attacker);
              originHex.removeUnit(attacker);
            }
            lifePointsLost -= 1;
          }
          break;
        case DamageResult.NONE:
          break;
        default:
          throw new Error(`Unknown damage result: ${result["attacker"]["damage"]}`);
      }
    }
    // Apply morale results to attacker units
    for (const attacker of attackers) {
      switch (result["defender"]["morale"]) {
        case MoraleResult.M:
          if (!attacker.moraleCheck()) {
            for (const hexNeighbour of originHex.getNeighbours()) {
              if (
                this._map.hexBelongsToPlayer(hexNeighbour.getID(), attackerPlayer) &&
                hexNeighbour.getUnits().length === 0
              ) {
                this.moveUnit(attackerPlayer, attacker, hexNeighbour.getID());
                break;
              }
            }
          }
          break;
        case MoraleResult.D:
          // DISRUPT UNIT
          break;
        case MoraleResult.W || MoraleResult.R:
          for (const hexNeighbour of originHex.getNeighbours()) {
            if (
              this._map.hexBelongsToPlayer(hexNeighbour.getID(), attackerPlayer) &&
              hexNeighbour.getUnits().length === 0
            ) {
              this.moveUnit(attackerPlayer, attacker, hexNeighbour.getID());
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
