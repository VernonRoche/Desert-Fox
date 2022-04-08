import PlayerID from "./PlayerID";
import AbstractUnit from "../Units/AbstractUnit";
import Base from "../Infrastructure/Base";
import SupplyUnit from "../Infrastructure/SupplyUnit";
import RefitPoint from "../Infrastructure/RefitPoint";
import Entity from "../Entity";
import { Socket } from "socket.io";

export default class Player {
  private _id: PlayerID;
  private _units: Map<number, AbstractUnit>;
  private _bases: Map<number, Base>;
  private _supplyUnits: Map<number, SupplyUnit>;
  private _refitPoints: Map<number, RefitPoint>;
  private _socket: Socket;

  constructor(
    id: PlayerID,
    units: AbstractUnit[],
    bases: Base[],
    supplyUnits: SupplyUnit[],
    refitPoints: RefitPoint[],
    socket: Socket,
  ) {
    this._id = id;
    this._units = new Map(units.map((u) => [u.getId(), u]));
    this._bases = new Map(bases.map((b) => [b.getID(), b]));
    this._supplyUnits = new Map(supplyUnits.map((s) => [s.getId(), s]));
    this._refitPoints = new Map(refitPoints.map((r) => [r.getId(), r]));
    this._socket = socket;
  }

  public hasUnit(entity: Entity): boolean {
    return this._units.has(entity.getId()) || this._supplyUnits.has(entity.getId());
  }

  getUnitById(id: number): AbstractUnit | null {
    return this._units.get(id) ?? null;
  }

  getId(): PlayerID {
    return this._id;
  }

  getUnits(): AbstractUnit[] {
    return Array.from(this._units.values());
  }

  getBases(): Base[] {
    return Array.from(this._bases.values());
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
}
