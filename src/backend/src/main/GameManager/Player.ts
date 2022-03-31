import PlayerID from "./PlayerID";
import AbstractUnit from "../Units/AbstractUnit";
import Base from "../Infrastructure/Base";
import SupplyUnit from "../Infrastructure/SupplyUnit";
import RefitPoint from "../Infrastructure/RefitPoint";
import Moveable from "../Moveable";
import Entity from "../Entity";

export default class Player {
  private _id: PlayerID;
  private _units: AbstractUnit[];
  private _bases: Base[];
  private _supplyUnits: SupplyUnit[];
  private _refitPoints: RefitPoint[];


  constructor(
    id: PlayerID,
    units: AbstractUnit[],
    bases: Base[],
    supplyUnits: SupplyUnit[],
    refitPoints: RefitPoint[],
  ) {
    this._id = id;
    this._units = units;
    this._bases = bases;
    this._supplyUnits = supplyUnits;
    this._refitPoints = refitPoints;
  }

  public hasUnit(entity: Entity): boolean {
    const both: Entity[] = [...this._units, ...this._supplyUnits];
    return Boolean(both.find((e) => entity.getID() === e.getID()));
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



}
