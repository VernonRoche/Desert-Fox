import Embarkable from "../Embarkable";
import Entity from "../Entity";
import HexID from "../Map/HexID";


export type dumpJson = {
  currentPosition: string;
  owned: boolean;
};

export default class Dump implements Embarkable {
  private _currentPosition: HexID;
  private _id: number;

  constructor(id: number, hexId: HexID) {
    this._id = id;
    this._currentPosition = hexId;
  }
  remove(): void {
    throw new Error("Method not implemented.");
  }
  getType(): string {
    return "dump";
  }
  embark(): void {
    throw new Error("Method not implemented.");
  }

  disembark(): void {
    throw new Error("Method not implemented.");
  }

  
  getId(): number {
    return this._id;
  }

  getCurrentPosition(): HexID {
    return this._currentPosition;
  }
  place(hexId: HexID): void {
    this._currentPosition = new HexID(hexId.getY(), hexId.getX());
  }

}
