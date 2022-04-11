import Embarkable from "../Embarkable";
import Entity from "../Entity";
import HexID from "../Map/HexID";

export default class Base implements Entity {
  private _sent: boolean;
  private _received: boolean;
  private _primary: boolean;
  private _isActive: boolean;
  private _id: number;

  constructor(sent: boolean, received: boolean, primary: boolean, isActive: boolean, id: number) {
    this._sent = sent;
    this._received = received;
    this._primary = primary;
    this._isActive = isActive;
    this._id = id;
  }
  place(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }
  remove(): void {
    throw new Error("Method not implemented.");
  }
  getId(): number {
    throw new Error("Method not implemented.");
  }

  send(embarkable: Embarkable, base: Base): void {
    if (this._sent) {
      throw new Error("Already sent");
    }
    this._sent = true;
  }

  canSend(): boolean {
    return this._sent;
  }

  //TODO: ajouter une méthode receive ?

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

  isActive(): boolean {
    return this._isActive;
  }

  getID(): number {
    return this._id;
  }
}
