import Hex from "./Hex";
import NeighbourTerrain from "./NeighbourTerrain";

export default class HexNeighbour {
  private _start: Hex;
  private _end: Hex;
  private _terrain: NeighbourTerrain;

  constructor(start: Hex, end: Hex, terrain: NeighbourTerrain) {
    this._start = start;
    this._end = end;
    this._terrain = terrain;
  }
}
