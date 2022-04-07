import AbstractUnit from "./AbstractUnit";
import HexID from "../Map/HexID";
import Dice from "../GameManager/Dice";

export default class Artillery extends AbstractUnit {
  private _result: Dice = new Dice();

  MoraleRating(): number {
    return 1;
  }
  MovementAllowance(): number {
    return 14;
  }
  refit(): void {
    throw new Error("Method not implemented.");
  }
  train(): void {
    throw new Error("Method not implemented.");
  }
  reactionMove(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }
  moraleCheck(): boolean {
    const result = this._result.getDice(1, 7) + this.MovementAllowance();
    if (result >= 6) {
      return false;
    }
    return true;
  }
  overrun(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }
  hasGeneralSupply(): boolean {
    throw new Error("Method not implemented.");
  }
  attack(hexId: HexID, combatSupply: boolean): void {
    throw new Error("Method not implemented.");
  }
}
