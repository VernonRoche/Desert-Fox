import HexID from "./HexID";
import Unit from "../Units/Unit";
import Terrain from "./Terrain";
import SupplyUnit from "../Infrastructure/SupplyUnit";
import Entity from "../Entity";

export default class Hex {
  private _hexId: HexID;
  private _units: Unit[];
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

  getUnits(): Unit[] {
    return this._units;
  }

  getSupplyUnits(): SupplyUnit[] {
    return this._supplyUnits;
  }

  hasUnit(unit: Entity): boolean {
    return !!this._units.find((u) => u.getId() === unit.getId());
  }

  assertHasNotUnit(unit: Entity) {
    if (this.hasUnit(unit)) throw new Error("unit already present");
  }

  // returns false if the move was illegal, true if the addition was succesful
  addUnit(unit: Unit): void {
    if (this.isFull()) throw new Error("hex is full");
    // goes through the list of units and checks if the unit is already there
    // by checking if any unit (u) has the same id as the unit we are trying to add
    this.assertHasNotUnit(unit);
    unit.place(this._hexId);
    this._units.push(unit);
  }

  addSupplyUnit(unit: SupplyUnit): void {
    // goes through the list of units and checks if the unit is already there
    // by checking if any unit (u) has the same id as the unit we are trying to add
    this.assertHasNotUnit(unit);
    this._supplyUnits.push(unit);
  }

  removeUnit(unit: Unit) {
    // remove unit from this._units
    this._units = this._units.filter((u) => u.getId() !== unit.getId());
  }

  removeSupplyUnit(unit: SupplyUnit) {
    this._supplyUnits.forEach((item, index) => {
      if (item === unit) this._supplyUnits.splice(index, 1);
    });
  }

  getNeighbours(): Hex[] {
    return this._connexions;
  }

  addNeighbour(hex: Hex) {
    this._connexions.push(hex);
  }

  isNeighbour(neighbour: Hex): boolean {
    return this._connexions.includes(neighbour);
  }

  isFull(): boolean {
    return this._units.length === this._HEX_CAPACITY;
  }

  getID(): HexID {
    return this._hexId;
  }

  getTerrain(): Terrain {
    return this._terrain;
  }
}
