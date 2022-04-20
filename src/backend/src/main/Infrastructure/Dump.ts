import Embarkable from "../Embarkable";
import Entity from "../Entity";
import Player from "../GameManager/Player";
import HexID from "../Map/HexID";

export type dumpJson = {
  id: number;
  currentPosition: HexID;
  owned: boolean;
  embarked: boolean;
};

export default class Dump implements Embarkable {
  private _currentPosition: HexID;
  private _id: number;
  private _embarked = false;

  constructor(id: number, hexId: HexID) {
    this._id = id;
    this._currentPosition = hexId;
  }
  isEmbarked(): boolean {
    return this._embarked;
  }
  remove(): void {
    throw new Error("Method not implemented.");
  }
  getType(): string {
    return "dump";
  }
  embark(): void {
    this._embarked = true;
  }

  disembark(): void {
    this._embarked = false;
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

  toJson(player: Player): dumpJson {
    return {
      id: this.getId(),
      currentPosition: this.getCurrentPosition(),
      owned: player.hasEntity(this),
      embarked: this.isEmbarked(),
    };
  }
}
