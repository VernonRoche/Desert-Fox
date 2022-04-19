import PlayerID from "./PlayerID";
import Unit from "../Units/Unit";
import Base from "../Infrastructure/Base";
import SupplyUnit from "../Infrastructure/SupplyUnit";
import RefitPoint from "../Infrastructure/RefitPoint";
import Entity from "../Entity";
import { Socket } from "socket.io";
import Dump from "../Infrastructure/Dump";

export default class Player {
  private _id: PlayerID;
  private _units: Map<string, Unit>;
  private _bases: Map<string, Base>;
  private _dumps: Map<string, Dump>;
  private _supplyUnits: Map<string, SupplyUnit>;
  private _refitPoints: Map<string, RefitPoint>;
  private _socket: Socket;

  constructor(id: PlayerID, socket: Socket) {
    this._id = id;
    this._units = new Map();
    this._bases = new Map();
    this._dumps = new Map();
    this._supplyUnits = new Map();
    this._refitPoints = new Map();
    this._socket = socket;
  }

  hasEntity(entity: Entity): boolean {
    let check = false;
    if (
      entity.getType() === "motorized" ||
      entity.getType() === "foot" ||
      entity.getType() === "mechanized"
    ) {
      check = this._units.has(entity.getId().toString());
    } else if (entity.getType() === "supply") {
      check = this._supplyUnits.has(entity.getId().toString());
    } else if (entity.getType() === "base") {
      check = this._bases.has(entity.getId().toString());
    } else if (entity.getType() === "dump") {
      check = this._dumps.has(entity.getId().toString());
    }
    return check;
  }

  getUnitById(id: number): Unit {
    const unit = this._units.get(id.toString());

    if (!unit) {
      throw new Error("Nonexisting entity");
    }
    return unit;
  }

  getId(): PlayerID {
    return this._id;
  }

  getUnits(): Unit[] {
    return Array.from(this._units.values());
  }

  getBases(): Base[] {
    return Array.from(this._bases.values());
  }
  getDumps(): Dump[] {
    return Array.from(this._dumps.values());
  }

  getSupplyUnits(): SupplyUnit[] {
    return Array.from(this._supplyUnits.values());
  }

  getRefitPoints(): RefitPoint[] {
    return Array.from(this._refitPoints.values());
  }

  getSocket(): Socket {
    return this._socket;
  }

  addUnit(unit: Unit): void {
    this._units.set(unit.getId().toString(), unit);
  }
  addBase(base: Base): void {
    this._bases.set(base.getId().toString(), base);
  }
  addDump(dump: Dump): void {
    this._dumps.set(dump.getId().toString(), dump);
  }
  addSupplyUnit(supplyUnit: SupplyUnit): void {
    this._supplyUnits.set(supplyUnit.getId().toString(), supplyUnit);
  }
  addRefitPoint(refitPoint: RefitPoint): void {
    this._refitPoints.set(refitPoint.getId().toString(), refitPoint);
  }
  removeUnit(defenderUnit: Unit) {
    this._units.delete(defenderUnit.getId().toString());
  }
}
