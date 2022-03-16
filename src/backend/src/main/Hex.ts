import HexID from "./HexID";
import Unit from "./Unit";

class Hex {
  private _hexId: HexID;
  private _units: Unit[];
  constructor(hexId: HexID) {
    this._hexId = hexId;
    this._units = [];
  }
  public get hexId(): HexID {
    return this._hexId;
  }

  public get units(): Unit[] {
    return this._units;
  }

  // returns true if unit was already added to this hex, meaning illegal move
  public addUnit(unit: Unit): boolean {
    // goes through the list of units and checks if the unit is already there
    // by checking if any unit (u) has the same id as the unit we are trying to add
    const alreadyHasUnit = !!this._units.find((u) => u.getId() === unit.getId());
    if (alreadyHasUnit) return true;

    unit.move(this._hexId);
    this._units.push(unit);
    return false;
  }
}
