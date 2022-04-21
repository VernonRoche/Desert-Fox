import Embarkable from "../Embarkable";
import Player from "../GameManager/Player";
import HexID from "../Map/HexID";
import Moveable from "../Moveable";
import Dice from "../GameManager/Dice";

export type supplyUnitJson = {
  id: number;
  currentPosition: HexID;
  movementPoints: number;
  owned: boolean;
};
export default class SupplyUnit implements Moveable {
  private _item: Embarkable[] = [];
  private _currentPosition: HexID;
  private _movementPoints: number;
  private _id: number;
  private _remainingMovementPoints: number;

  constructor(id: number, currentPosition: HexID, movementPoints: number) {
    this._id = id;
    this._currentPosition = currentPosition;
    this._movementPoints = movementPoints;
    this._remainingMovementPoints = movementPoints;
  }

  getType(): string {
    return "supply";
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

  remove(): void {
    throw new Error("Method not implemented.");
  }

  move(movementPoints: number): void {
    this._remainingMovementPoints -= movementPoints;
  }

  getMovementPoints(): number {
    return this._movementPoints;
  }

  getRemainingMovementPoints(): number {
    return this._remainingMovementPoints;
  }

  resetMovementPoints(): void {
    this._remainingMovementPoints = this._movementPoints;
  }

  public embark(item: Embarkable): void {
    if (this._item.length === 0) this._item.push(item);
    else throw new Error("Item already in supply");
  }

  public disembark(): Embarkable | undefined {
    if (this._item.length === 0) return undefined;
    return this._item.pop() as Embarkable;
  }

  getEmbarked(): Embarkable | undefined {
    if (this._item.length === 0) return undefined;
    return this._item[0];
  }

  public createBase(): void {
    throw new Error("Method not implemented.");
  }

  public hasItem(): boolean {
    throw new Error("Method not implemented.");
  }

  // Throws a dice. If the result is 1-3 then the unit is captured.
  // If it is 4-6 then the unit is destroyed.
  // Return true if captured, false if destroyed.
  public capture(): boolean {
    const roll = Dice.rollDice();
    return roll >= 1 && roll <= 3;
  }

  toJson(player: Player): supplyUnitJson {
    return {
      id: this.getId(),
      currentPosition: this.getCurrentPosition(),
      movementPoints: this.getMovementPoints(),
      owned: player.hasEntity(this),
    };
  }
}
