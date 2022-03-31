import HexID from "./HexID";
import AbstractUnit from "../Units/AbstractUnit";
import Terrain from "./Terrain";
import SupplyUnit from "../Infrastructure/SupplyUnit";

export default class Hex {
  private _hexId: HexID;
  private _units: AbstractUnit[];
  private _supplyUnits: SupplyUnit[];
  private _connexions: Hex[]; // To be later replaced with HexNeighbour
  private _terrain: Terrain;
  private _HEX_CAPACITY = 6;

  constructor(hexId: HexID, terrain: Terrain) {
    this._hexId = hexId;
    this._units = [];
    this._supplyUnits = [];
    this._connexions = [];
    this._terrain = terrain;
  }
  public hexId(): HexID {
    return this._hexId;
  }

  public units(): AbstractUnit[] {
    return this._units;
  }

  public supplyUnits(): SupplyUnit[] {
    return this._supplyUnits;
  }

  // returns false if the move was illegal, true if the addition was succesful
  public addUnit(unit: AbstractUnit): boolean {
    if (this.isFull()) return false;
    if (!unit.move(this._hexId)) return false;
    // goes through the list of units and checks if the unit is already there
    // by checking if any unit (u) has the same id as the unit we are trying to add
    const alreadyHasUnit = !!this._units.find((u) => u.getID() === unit.getID());
    if (alreadyHasUnit) return false;

    unit.move(this._hexId);
    this._units.push(unit);
    return true;
  }

  public addSupplyUnit(unit: SupplyUnit): boolean {
    if (!unit.move(this._hexId)) return false;
    // goes through the list of units and checks if the unit is already there
    // by checking if any unit (u) has the same id as the unit we are trying to add
    const alreadyHasUnit = !!this._supplyUnits.find((u) => u.getID() === unit.getID());
    if (alreadyHasUnit) return false;

    this._supplyUnits.push(unit);
    return true;
  }

  public removeUnit(unit: AbstractUnit) {
    this._units.forEach((item, index) => {
      if (item === unit) this._units.splice(index, 1);
    });
  }

  public removeSupplyUnit(unit: SupplyUnit) {
    this._supplyUnits.forEach((item, index) => {
      if (item === unit) this._supplyUnits.splice(index, 1);
    });
  }

  public isNeighbour(neighbour: Hex): boolean {
    return this._connexions.includes(neighbour);
  }

  private isFull(): boolean {
    return this._units.length === this._HEX_CAPACITY;
  }
}
