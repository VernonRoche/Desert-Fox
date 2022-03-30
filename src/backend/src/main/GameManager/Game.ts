import Turn from "./Turn";
import Player from "./Player";
import GameMap from "../Map/GameMap";
import AbstractUnit from "../Units/AbstractUnit";
import HexID from "../Map/HexID";
import PlayerID from "./PlayerID";
import Hex from "../Map/Hex";

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

  // Checks if a move is possible and applies it.
  // Returns false if the move was not possible, true if move was succesful.
  public moveUnit(playerId: PlayerID, unit: AbstractUnit, destination: HexID): boolean {
    // Check if hexagon exists
    const destinationHex = this._map.findHex(destination);
    if (!destinationHex) return false;

    // Check if unit exists and that the player owns it
    const player: Player = playerId === PlayerID.ONE ? this._player1 : this._player2;
    if (!player.hasUnit(unit)) return false;

    // Check if move is possible
    const originHex = this._map.findHex(unit.currentPosition());
    // Get the owner of the destination hex to see if we can move there
    const currentOwner = (hex: Hex): PlayerID => {
      if (destinationHex.units().length > 0) {
        return this._player1.hasUnit(destinationHex.units()[0]) ? PlayerID.ONE : PlayerID.TWO;
      } else if (destinationHex.supplyUnits().length > 0) {
        return this._player1.hasUnit(destinationHex.supplyUnits()[0]) ? PlayerID.ONE : PlayerID.TWO;
      }
      return PlayerID.NONE;
    };

    if (playerId != currentOwner(destinationHex)) return false;

    if (!destinationHex.addUnit(unit)) return false;
    originHex.removeUnit(unit);
    return true;
  }


  public getInstance():Game{
    if(this == null) throw  new Error("Error not game found !!");
    return this;

  }


}
