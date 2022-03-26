import Entity from "../Entity";
import Hex from "./Hex";

export default class Map {
  private _entities: Entity[];
  private _hexagons: Hex[];

  constructor(entities: Entity[], hexagons: Hex[]) {
    this._entities = entities;
    this._hexagons = hexagons;
  }
}
