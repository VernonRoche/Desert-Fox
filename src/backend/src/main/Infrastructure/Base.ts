import Embarkable from "../Embarkable";

export default class Base {
  private _sent: boolean;
  private _received: boolean;
  private _primary: boolean;

  constructor(sent: boolean, received: boolean, primary: boolean) {
    this._sent = sent;
    this._received = received;
    this._primary = primary;
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
}
