import HexID from "./HexID";
import AbstractUnit from "../Units/AbstractUnit";
import HexNeighbour from "./HexNeighbour";
import Terrain from "./Terrain";

export default class Hex {
  private _hexId: HexID;
  private _units: AbstractUnit[];
  private _connexions: HexNeighbour[];
  private _terrain: Terrain;

  constructor(hexId: HexID, terrain: Terrain) {
    this._hexId = hexId;
    this._units = [];
    this._connexions = [];
    this._terrain = terrain;
  }
  public hexId(): HexID {
    return this._hexId;
  }

  public units(): AbstractUnit[] {
    return this._units;
  }

  // returns true if unit was already added to this hex, meaning illegal move
  public addUnit(unit: AbstractUnit): boolean {
    // goes through the list of units and checks if the unit is already there
    // by checking if any unit (u) has the same id as the unit we are trying to add
    const alreadyHasUnit = !!this._units.find((u) => u.getId() === unit.getId());
    if (alreadyHasUnit) return true;

    unit.move(this._hexId);
    this._units.push(unit);
    return false;
  }
}
