import Entity from "../Entity";
import Hex from "./Hex";
import HexID from "./HexID";

export default class GameMap {
  private _entities: Entity[];
  private _hexagons: Map<HexID, Hex> = new Map();

  constructor(entities: Entity[], hexagons: Hex[]) {
    this._entities = entities;
    hexagons.forEach((val) => {
      this._hexagons.set(val.hexId(), val);
    });
  }

  public findHex(hexId: HexID): Hex {
    const hex = this._hexagons.get(hexId);
    if (!hex) {
      throw new Error("Nonexisting hex");
    }
    return hex;
  }
}
