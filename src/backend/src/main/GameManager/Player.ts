import PlayerID from "./PlayerID";
import AbstractUnit from "../Units/AbstractUnit";
import Base from "../Infrastructure/Base";
import SupplyUnit from "../Infrastructure/SupplyUnit";
import RefitPoint from "../Infrastructure/RefitPoint";

export default class Player {
  private id: PlayerID;
  private units: AbstractUnit[];
  private bases: Base[];
  private supplyUnits: SupplyUnit[];
  private refitPoints: RefitPoint[];

  constructor(
    id: PlayerID,
    units: AbstractUnit[],
    bases: Base[],
    supplyUnits: SupplyUnit[],
    refitPoints: RefitPoint[],
  ) {
    this.id = id;
    this.units = units;
    this.bases = bases;
    this.supplyUnits = supplyUnits;
    this.refitPoints = refitPoints;
  }
}
