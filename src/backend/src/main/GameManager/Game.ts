import { Turn } from "./Turn";
import Player from "./Player";
import GameMap from "../Map/GameMap";
import AbstractUnit from "../Units/AbstractUnit";
import HexID from "../Map/HexID";
import PlayerID from "./PlayerID";

export default class Game {
  private _turn: Turn;
  private _player1: Player;
  private _player2: Player;
  private _map: GameMap;

  public constructor(map: GameMap, player1: Player, player2: Player) {
    this._turn = new Turn();
    this._player1 = player1;
    this._player2 = player2;
    this._map = map;
  }

  public canMove(playerId: PlayerID, unit: AbstractUnit, destination: HexID): true | string {
    const destinationHex = this._map.findHex(destination);
    if (!destinationHex) return "no destination";

    // Check if unit exists and that the player owns it
    const player: Player = playerId === PlayerID.ONE ? this._player1 : this._player2;
    if (!player.hasUnit(unit)) return "no unit";

    // Check if move is possible
    return true;
  }

  // Checks if a move is possible and applies it.
  // Returns false if the move was not possible, true if move was succesful.
  public moveUnit(playerId: PlayerID, unit: AbstractUnit, destination: HexID): void {
    // Get the owner of the destination hex to see if we can move there

    const canMove = this.canMove(playerId, unit, destination);
    if (canMove !== true) {
      throw new Error(`Cannot move unit: ${canMove}`);
    }

    // Check if move is possible
    const originHex = this._map.findHex(unit.currentPosition());
    const destinationHex = this._map.findHex(destination);
    destinationHex.addUnit(unit);
    originHex.removeUnit(unit);
    unit.place(destination);
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
}
