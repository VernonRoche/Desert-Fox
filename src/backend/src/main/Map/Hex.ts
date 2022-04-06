import HexID from "./HexID";
import AbstractUnit from "../Units/AbstractUnit";
import Terrain from "./Terrain";
import SupplyUnit from "../Infrastructure/SupplyUnit";
import Entity from "../Entity";

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

  hasUnit(unit: Entity): boolean {
    return !!this._units.find((u) => u.getID() === unit.getID());
  }

  assertHasNotUnit(unit: Entity) {
    if (this.hasUnit(unit)) throw new Error("unit already present");
  }

  // returns false if the move was illegal, true if the addition was succesful
  public addUnit(unit: AbstractUnit): void {
    if (this.isFull()) throw new Error("hex is full");
    // goes through the list of units and checks if the unit is already there
    // by checking if any unit (u) has the same id as the unit we are trying to add
    this.assertHasNotUnit(unit);
    unit.move(this._hexId);
    this._units.push(unit);
  }

  public addSupplyUnit(unit: SupplyUnit): void {
    // goes through the list of units and checks if the unit is already there
    // by checking if any unit (u) has the same id as the unit we are trying to add
    this.assertHasNotUnit(unit);
    this._supplyUnits.push(unit);
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

  public getNeighbours(): Hex[] {
    return this._connexions;
  }

  public isNeighbour(neighbour: Hex): boolean {
    return this._connexions.includes(neighbour);
  }

  private isFull(): boolean {
    return this._units.length === this._HEX_CAPACITY;
  }

  public getID(): HexID {
    return this.hexId();
  }

  public getTerrain(): Terrain {
    return this._terrain;
  }
}
