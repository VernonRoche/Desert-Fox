import Entity from "../Entity";
import Player from "../GameManager/Player";
import HexID from "../Map/HexID";
import Dump from "./Dump";

export type baseJson = {
  id: number;
  currentPosition: HexID;
  primary: boolean;
  owned: boolean;
};

export default class Base implements Entity {
  private _currentPosition: HexID;
  private _sent = false;
  private _received = false;
  private _primary: boolean;
  private _id: number;
  private dumps: Dump[] = [];

  constructor(hexId: HexID, primary: boolean, id: number) {
    this._primary = primary;
    this._id = id;
    this._currentPosition = hexId;
  }

  getType(): string {
    return "base";
  }

  remove(): void {
    throw new Error("Method not implemented.");
  }

  getId(): number {
    return this._id;
  }

  sent(): void {
    this._sent = true;
  }

  received(): void {
    this._received = true;
  }

  removeDump(dump: Dump): void {
    this.dumps = this.dumps.filter((d) => d.getId() !== dump.getId());
  }

  canSend(): boolean {
    return this._sent;
  }

  canReceive(): boolean {
    return this._received;
  }

  isPrimary(): boolean {
    return this._primary;
  }

  reset(): void {
    this._sent = false;
    this._received = false;
  }

  getCurrentPosition() {
    return this._currentPosition;
  }

  place(hexId: HexID): void {
    this._currentPosition = new HexID(hexId.getY(), hexId.getX());
  }

  toJson(player: Player): baseJson {
    return {
      id: this.getId(),
      currentPosition: this.getCurrentPosition(),
      primary: this._primary,
      owned: player.hasEntity(this),
    };
  }
}
