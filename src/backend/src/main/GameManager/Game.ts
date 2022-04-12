import { Turn } from "./Turn";
import Player from "./Player";
import GameMap from "../Map/GameMap";
import AbstractUnit from "../Units/AbstractUnit";
import HexID from "../Map/HexID";
import Pathfinder from "./Pathfinder";

export default class Game {
  private _turn: Turn;
  private _player1: Player;
  private _player2: Player;
  private _map: GameMap;
  private _pathfinder: Pathfinder;

  public constructor(map: GameMap, player1: Player, player2: Player) {
    this._turn = new Turn();
    this._player1 = player1;
    this._player2 = player2;
    this._map = map;
    // Initialize Pathfinder
    this._pathfinder = new Pathfinder(map);
  }

  // check if a move is possible
  // it does not apply move
  // return true if can move
  // return a string containing the reason if it cannot
  // do not try if(canMove) since it will always be true
  // check if(canMove === true)
  public canMove(
    player: Player,
    unit: AbstractUnit,
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
      unit,
    );

    if (sumOfWeight > unit.getRemainingMovementPoints()) return "not enough movement points";

    // Check if move is possible
    return { movePossible: true, cost: sumOfWeight };
  }

  // Checks all units of a player and returns the list of units that can move
  public availableUnitsToMove(player: Player): AbstractUnit[] {
    const availableUnits: AbstractUnit[] = [];
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
  public moveUnit(player: Player, unit: AbstractUnit, destination: HexID): void {
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

  getTurn(): Turn {
    return this._turn;
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
