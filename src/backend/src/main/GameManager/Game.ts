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
  }

  /*
   * Check if a move is possible. It does not apply the move.
   * It returns the result of the pathfinder if it can move.
   * Return a string containing the reason if it cannot.
   * Do not try if(canMove) since it will always be true.
   * Check if(canMove === true) for security reasons.
   */
  public canMove(
    player: Player,
    unit: Moveable,
    destination: HexID,
  ): { movePossible: boolean; cost: number } | string {
    // Check if the destination hex exists.
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
    const { sumOfWeight } = this._pathfinder.findShortestWay(
      unit.getCurrentPosition(),
      destination,
      player,
      unit.getType(),
    );

    if (sumOfWeight > unit.getRemainingMovementPoints()) return "not enough movement points";

    return { movePossible: true, cost: sumOfWeight };
  }

  // Checks all units of a player and returns the list of units that can move
  public availableUnitsToMove(player: Player): Unit[] {
    const availableUnits: Unit[] = [];
    for (const unit of player.getUnits()) {
      for (const neighbourHex of this._map.findHex(unit.getCurrentPosition()).getNeighbours()) {
        const canMove = this.canMove(player, unit, neighbourHex.getId());
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
  }

  disembarkEntity(player: Player, supplyUnit: SupplyUnit): Embarkable | undefined {
    if (!player.hasEntity(supplyUnit)) {
      throw new Error("supply unit does not exist");
    }
    let toDisembark: Embarkable | undefined = undefined;
    try {
      toDisembark = supplyUnit.disembark();
    } catch (e) {
      throw new Error("no entity to disembark");
    }
    const hex = this._map.findHex(supplyUnit.getCurrentPosition());
    return toDisembark;
  }

  // Checks if a move is possible and applies it.
  public moveUnit(player: Player, unit: Moveable, destination: HexID): void {
    const canMove = this.canMove(player, unit, destination);
    if (typeof canMove === "string") {
      throw new Error(canMove);
    }
    //Check if the unit type is allowed to move
    if (
      unit.getType() !== "supply" &&
      !(
        unit.getType() !== "motorized" ||
        unit.getType() !== "foot" ||
        unit.getType() !== "mechanized"
      )
    ) {
      throw new Error("unit is not a supply unit or a unit, its a " + unit.getType());
    }
    const { movePossible, cost } = canMove;
    if (!movePossible) {
      throw new Error(`Cannot move unit: ${canMove}`);
    }

    // Apply the move
    const originHex = this._map.findHex(unit.getCurrentPosition());
    const destinationHex = this._map.findHex(destination);
    // Move the unit from one hex to another
    destinationHex.addEntity(unit);
    originHex.removeEntity(unit);
    if (unit.getType() === "supply") {
      const embarkedEntity = (unit as unknown as SupplyUnit).getEmbarked();
      if (embarkedEntity) {
        destinationHex.addEntity(embarkedEntity);
        originHex.removeEntity(embarkedEntity);
      }
    }
    // Update the unit's position for itself to know.
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
            player,
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

            player,
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
        unit.disrupt();
      }
    });
  }

  verifyCombatSuppliesForUnit(player: Player, unit: Unit): boolean {
    if (!player.hasEntity(unit)) throw new Error("player does not have the unit");
    const supplyUnitsToCheck = player
      .getSupplyUnits()
      .filter(
        (supplyUnit) =>
          this._pathfinder.findShortestWay(
            unit.getCurrentPosition(),
            supplyUnit.getCurrentPosition(),
            player,
          ).sumOfWeight <= SUPPLYUNIT_RANGE,
      );
    return this.verifyCombatSuppliesRec(player, [unit], supplyUnitsToCheck);
  }

  verifyCombatSuppliesRec(player: Player, units: Moveable[], supplies: Moveable[]): boolean {
    if (units.length === 0) return false; // if no units left, it hasn't found a dump
    const playerDumps = player.getDumps();
    let found = false;
    for (const unit of units) {
      for (const dump of playerDumps) {
        // check if unit is connected to dump
        if (dump.isEmbarked()) continue;
        if (
          this._pathfinder.findShortestWay(
            unit.getCurrentPosition(),
            dump.getCurrentPosition(),

            player,
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
    return this.verifyCombatSuppliesRec(player, supplies, []);
  }
  /*
   * Main combat function.
   * It does some verifications to see if the combat is possible.
   * Then it prepares some data and then gets the combat result from the
   * CombatSimulator class. It then applies the result to the map.
   * It returns the same type as the CombatSimulator class with all the
   * combat results.
   */
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
    // Find which player attacks.
    let attackerPlayer: Player;
    // Player 1 attacks
    if (this._map.hexBelongsToPlayer(originHex.getId(), this._player1)) {
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
    // The defender is the opposite player
    const defenderPlayer = attackerPlayer === this._player1 ? this._player2 : this._player1;

    // Check if attacker is embarked
    for (const attacker of attackers) {
      if (attacker.getType() === "foot" && (attacker as unknown as Embarkable).isEmbarked()) {
        throw new Error("Embarked units cannot attack");
      }
    }

    // Check if the unit is in range
    if (!destinationHex.getNeighbours().includes(originHex)) {
      throw new Error(`Unit ${attackers[0].getId()} is not in range of hex ${destination}.`);
    }

    // Check if there are only supply units in the destination hex
    if (destinationHex.getSupplyUnits().length > 0 && destinationHex.getUnits().length === 0) {
      for (const supplyUnit of destinationHex.getSupplyUnits()) {
        if (supplyUnit.capture()) {
          attackerPlayer.addSupplyUnit(supplyUnit);
        } else {
          destinationHex.removeSupplyUnit(supplyUnit);
        }
        defenderPlayer.removeSupplyUnit(supplyUnit);
      }
      return {
        attacker: { damage: DamageResult.NONE, morale: MoraleResult.NONE },
        defender: { damage: DamageResult.NONE, morale: MoraleResult.NONE },
      };
    }

    // Get initial combat results
    // This operation may seem redundant with the later call in the main loop
    // but it is needed to have the system working properly.
    let result = CombatSimulator.combatResult(
      destinationHex.getTerrain().terrainType,
      attackers.length,
      destinationHex.getUnits().length,
      1,
      false,
    );

    // Get total hp of defenders and attacker supplies
    // Hp of defenders are divided into morale groups, hence why we use
    // an array of 5 elements.
    // The variable lifePointsLost will be used in the attacker section.
    // It will be used if the combat result is X or XX. It counts the hp lost
    // by the defenders.
    let lifePointsLost = 0;
    const defenderLifePoints = [0, 0, 0, 0, 0];
    // For each morale group add the hp of the units in it
    for (const defender of destinationHex.getUnits()) {
      defenderLifePoints[defender.getMoraleRating() - 1] += defender.getLifePoints();
    }

    // Determine combat results for defenders
    for (let i = 0; i < 5; i++) {
      // If there is no unit in the morale group, skip it
      if (defenderLifePoints[i] === 0) {
        continue;
      }
      // Calculate combat results
      // We pass i+1 because the morale group is 1-5, but the array is 0-4.
      // Cf CombatSimulator.combatResult, where we subtract 1 from the morale.
      result = CombatSimulator.combatResult(
        destinationHex.getTerrain().terrainType,
        attackers.length,
        destinationHex.getUnits().length,
        i + 1,
        this.verifyCombatSuppliesForUnit(attackerPlayer, attackers[0]),
      );
      // Get the defender damage result. Depending on it, we may have to apply
      // half or a quarter of the total defender's hp in damage.
      switch (result["defender"]["damage"]) {
        case DamageResult.H:
          defenderLifePoints[i] = Math.round(defenderLifePoints[i] / 2);
          break;
        case DamageResult.Q:
          defenderLifePoints[i] = Math.round(defenderLifePoints[i] / 4);
          break;
        case DamageResult.E:
        case DamageResult.NONE:
          break;
        default:
          throw new Error(`Unknown damage result: ${result["defender"]["damage"]}`);
      }
      // Apply damage results to defender units
      // Create an array of destroyed defender units.
      // This will be used to eventually skip checking morale results.
      const destroyedDefenders: Unit[] = [];
      let defenders = destinationHex.getUnits();
      for (const defenderUnit of defenders) {
        // For all defenders, see if their morale is equal to the current
        // Iteration of the loop.
        // This is done because combat results are applied per morale group.
        if (defenderUnit.getMoraleRating() - 1 === i) {
          switch (result["defender"]["damage"]) {
            // Units are destroyed
            case DamageResult.E:
              defenderPlayer.removeUnit(defenderUnit);
              destinationHex.removeUnit(defenderUnit);
              destroyedDefenders.push(defenderUnit);
              break;
            // Units take half or quarter their hp in damage. The total damage
            // taken by the group is calculated in the previous switch.
            case DamageResult.H:
            case DamageResult.Q:
              if (defenderUnit.getLifePoints() === 2 && defenderLifePoints[i] >= 2) {
                // If the unit has 2 hp and the total damage is 2 or more,
                // it is destroyed.
                defenderPlayer.removeUnit(defenderUnit);
                destinationHex.removeUnit(defenderUnit);
                destroyedDefenders.push(defenderUnit);
                defenderLifePoints[i] -= 2;
                lifePointsLost += 2;
              } else if (defenderLifePoints[i] >= 1) {
                // We remove 1 hp from the unit. If it had 1 hp instead of 2
                // we verify that it has hp left and possibly destroy it.
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
      // Remove killed defenders
      defenders = defenders.filter((defender) => !destroyedDefenders.includes(defender));
      // Apply morale results to defender units
      for (const defenderUnit of defenders) {
        // Same idea as above, but for morale. We divide the defenders into
        // morale groups.
        if (defenderUnit.getMoraleRating() - 1 === i) {
          switch (result["defender"]["morale"]) {
            // The unit does a morale check, if it fails, it retreats.
            case MoraleResult.M:
              if (!defenderUnit.moraleCheck()) {
                for (const hexNeighbour of destinationHex.getNeighbours()) {
                  if (
                    this._map.hexBelongsToPlayer(hexNeighbour.getId(), defenderPlayer) &&
                    hexNeighbour.getUnits().length === 0
                  ) {
                    // If the hex is empty, we retreat the unit to it.
                    hexNeighbour.addUnit(defenderUnit);
                    destinationHex.removeUnit(defenderUnit);
                    defenderUnit.place(hexNeighbour.getId());
                    break;
                  }
                }
              }
              break;
            // Disrupt the unit
            case MoraleResult.D:
              defenderUnit.disrupt();
              break;
            // Disrupt the unit and retreat. For now the implementation is
            // the same because of retreat distance restrictions.
            case MoraleResult.R:
            case MoraleResult.W:
              for (const hexNeighbour of destinationHex.getNeighbours()) {
                if (
                  this._map.hexBelongsToPlayer(hexNeighbour.getId(), defenderPlayer) &&
                  hexNeighbour.getUnits().length === 0
                ) {
                  hexNeighbour.addUnit(defenderUnit);
                  destinationHex.removeUnit(defenderUnit);
                  defenderUnit.place(hexNeighbour.getId());
                  break;
                }
              }
              defenderUnit.disrupt();
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
    // If the result is X, then the attacker takes half the damage of defenders.
    if (result["attacker"]["damage"] === DamageResult.X) {
      lifePointsLost = lifePointsLost / 2;
    }

    // The process of damage and morale resolution is the same as the defenders.
    // With the only exception that the attackers are not divided into morale
    // groups.
    let attackerLifePoints = 0;
    for (const attacker of attackers) {
      attackerLifePoints += attacker.getLifePoints();
    }
    if (result["attacker"]["damage"] === DamageResult.H) {
      attackerLifePoints = Math.round(attackerLifePoints / 2);
    }
    if (result["attacker"]["damage"] === DamageResult.Q) {
      attackerLifePoints = Math.round(attackerLifePoints / 4);
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
    // Remove destroyed attackers from the list of attackers
    attackers = attackers.filter((attacker) => !destroyedAttackers.includes(attacker));
    // Apply morale results to attacker units
    for (const attacker of attackers) {
      switch (result["attacker"]["morale"]) {
        case MoraleResult.M:
          if (!attacker.moraleCheck()) {
            for (const hexNeighbour of originHex.getNeighbours()) {
              if (
                this._map.hexBelongsToPlayer(hexNeighbour.getId(), attackerPlayer) &&
                hexNeighbour.getUnits().length === 0
              ) {
                hexNeighbour.addUnit(attacker);
                originHex.removeUnit(attacker);
                attacker.place(hexNeighbour.getId());
                break;
              }
            }
          }
          break;
        case MoraleResult.D:
          attacker.disrupt();
          break;
        case MoraleResult.R:
        case MoraleResult.W:
          for (const hexNeighbour of originHex.getNeighbours()) {
            if (
              this._map.hexBelongsToPlayer(hexNeighbour.getId(), attackerPlayer) &&
              hexNeighbour.getUnits().length === 0
            ) {
              hexNeighbour.addUnit(attacker);
              originHex.removeUnit(attacker);
              attacker.place(hexNeighbour.getId());
              break;
            }
          }
          attacker.disrupt();
          break;
        case MoraleResult.NONE:
          break;
        default:
          throw new Error(`Unknown morale result: ${result["attacker"]["morale"]}`);
      }
    }
    // The combat is finished, now we return the results.
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
