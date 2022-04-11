import PlayerID from "./PlayerID";
import AbstractUnit from "../Units/AbstractUnit";
import Base from "../Infrastructure/Base";
import SupplyUnit from "../Infrastructure/SupplyUnit";
import RefitPoint from "../Infrastructure/RefitPoint";
import Entity from "../Entity";
import { Socket } from "socket.io";
import fs from "fs";
import HexID from "../Map/HexID";
import Mechanized from "../Units/Mechanized";
import Motorized from "../Units/Motorized";
import Foot from "../Units/Foot";

type unitJson = {
  id: number;
  type: string;
  currentPosition: string;
  movementPoints: number;
  combatFactor: number;
  moraleRating: number;
  lifePoints: number;
};

export default class Player {
  private _id: PlayerID;
  private _units: Map<number, AbstractUnit>;
  private _bases: Map<number, Base>;
  private _supplyUnits: Map<number, SupplyUnit>;
  private _refitPoints: Map<number, RefitPoint>;
  private _socket: Socket;

  constructor(
    id: PlayerID,
    bases: Base[],
    supplyUnits: SupplyUnit[],
    refitPoints: RefitPoint[],
    socket: Socket,
  ) {
    this._id = id;
    this._units = new Map();
    id === PlayerID.ONE
      ? this.loadUnitsByFile("Player1Units")
      : this.loadUnitsByFile("Player2Units");
    this._bases = new Map(bases.map((b) => [b.getID(), b]));
    this._supplyUnits = new Map(supplyUnits.map((s) => [s.getId(), s]));
    this._refitPoints = new Map(refitPoints.map((r) => [r.getId(), r]));
    this._socket = socket;
  }

  public hasUnit(entity: Entity): boolean {
    return this._units.has(entity.getId()) || this._supplyUnits.has(entity.getId());
  }

  loadUnitsByFile(filename: string): void {
    const json = fs.readFileSync("units/" + filename + ".json", "utf8");
    const map = JSON.parse(json);
    map.forEach((unit: unitJson) => {
      const x = +unit.currentPosition.substring(2, 4);
      const y = +unit.currentPosition.substring(0, 2);
      if (isNaN(x) || isNaN(y)) {
        console.log("Error loading unit: " + unit.id + " " + unit.currentPosition);
        throw new Error("Error loading unit: " + unit.id + " " + unit.currentPosition);
      }
      if (unit.type === "mechanized")
        this._units.set(
          unit.id,
          new Mechanized(
            unit.id,
            new HexID(x, y),
            unit.moraleRating,
            unit.combatFactor,
            unit.movementPoints,
            unit.lifePoints,
          ),
        );
      else if (unit.type === "foot")
        this._units.set(
          unit.id,
          new Foot(
            unit.id,
            new HexID(x, y),
            unit.moraleRating,
            unit.combatFactor,
            unit.movementPoints,
            unit.lifePoints,
          ),
        );
      else if (unit.type === "motorized")
        this._units.set(
          unit.id,
          new Motorized(
            unit.id,
            new HexID(x, y),
            unit.moraleRating,
            unit.combatFactor,
            unit.movementPoints,
            unit.lifePoints,
          ),
        );
      else throw new Error("Unknown unit type: " + unit.type);
    });
  }
  getUnitById(id: number): AbstractUnit {
    const unit = this._units.get(id);

    if (!unit) {
      throw new Error("Nonexisting entity");
    }
    return unit;
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
