import HexID from "./HexID";
import Unit from "../Units/Unit";
import Terrain from "./Terrain";
import SupplyUnit from "../Infrastructure/SupplyUnit";
import Entity from "../Entity";
import Base from "../Infrastructure/Base";
import Dump from "../Infrastructure/Dump";

export default class Hex {
  private _hexId: HexID;
  private _units: Unit[];
  private _supplyUnits: SupplyUnit[];
  private _base: Base | undefined;
  private _dumps: Dump[];
  private _connexions: Hex[]; // To be later replaced with HexNeighbour
  private _terrain: Terrain;
  private _HEX_CAPACITY = 6;

  constructor(hexId: HexID, terrain: Terrain) {
    this._hexId = hexId;
    this._units = [];
    this._dumps = [];
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

  getBase(): Base | undefined {
    return this._base;
  }

  getDumps(): Dump[] {
    return this._dumps;
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

  addEntity(entity: Entity): void {
    if (
      entity.getType() === "motorized" ||
      entity.getType() === "foot" ||
      entity.getType() === "mechanized"
    ) {
      this.addUnit(entity as Unit);
    } else if (entity.getType() === "supply") {
      this.addSupplyUnit(entity as SupplyUnit);
    } else if (entity.getType() === "base") {
      this.addBase(entity as Base);
    } else if (entity.getType() === "dump") {
      this.addDump(entity as Dump);
    }
  }

  removeEntity(entity: Entity) {
    if (
      entity.getType() === "motorized" ||
      entity.getType() === "foot" ||
      entity.getType() === "mechanized"
    ) {
      this.removeUnit(entity as Unit);
    } else if (entity.getType() === "supply") {
      this.removeSupplyUnit(entity as SupplyUnit);
    } else if (entity.getType() === "dump") {
      this.removeDump(entity as Dump);
    }
  }

  addBase(base: Base) {
    // only 1 base per hex
    if (!base) return;
    if (this._base) throw new Error("base already present");
    this._base = base;
  }

  addDump(dump: Dump) {
    if (!dump) return;
    this._dumps.push(dump);
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

  removeDump(dump: Dump) {
    this._dumps = this._dumps.filter((dmp) => dmp !== dump);
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

  getId(): HexID {
    return this._hexId;
  }

  getTerrain(): Terrain {
    return this._terrain;
  }
}
