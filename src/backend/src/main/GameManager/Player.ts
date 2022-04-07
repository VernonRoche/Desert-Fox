import PlayerID from "./PlayerID";
import AbstractUnit from "../Units/AbstractUnit";
import Base from "../Infrastructure/Base";
import SupplyUnit from "../Infrastructure/SupplyUnit";
import RefitPoint from "../Infrastructure/RefitPoint";
import Entity from "../Entity";
import { Socket } from "socket.io";

export default class Player {
  private _id: PlayerID;
  private _units: AbstractUnit[];
  private _bases: Base[];
  private _supplyUnits: SupplyUnit[];
  private _refitPoints: RefitPoint[];
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
    this._units = units;
    this._bases = bases;
    this._supplyUnits = supplyUnits;
    this._refitPoints = refitPoints;
    this._socket = socket;
  }

  public hasUnit(entity: Entity): boolean {
    const both: Entity[] = [...this._units, ...this._supplyUnits];
    return Boolean(both.find((e) => entity.getID() === e.getID()));
  }

  getUnitById(id: number): AbstractUnit | null {
    return this._units.find((u) => u.getID() === id) ?? null;
  }

  getId(): PlayerID {
    return this._id;
  }

  getUnits(): AbstractUnit[] {
    return this._units;
  }

  getBases(): Base[] {
    return this._bases;
  }

  getSupplyUnits(): SupplyUnit[] {
    return this._supplyUnits;
  }

  getRefitPoints(): RefitPoint[] {
    return this._refitPoints;
  }

  getSocket(): Socket {
    return this._socket;
  }
}
