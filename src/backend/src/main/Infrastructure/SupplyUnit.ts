import Embarkable from "../Embarkable";
import HexID from "../Map/HexID";
import Moveable from "../Moveable";

export type supplyUnitJson = {
  currentPosition: string;
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
    return "supplyunit";
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

  possibleMoves(): HexID[] {
    throw new Error("Method not implemented.");
  }

  move(movementPoints: number): void {
    this._remainingMovementPoints -= movementPoints;
  }

  nightMove(hexId: HexID): void {
    throw new Error("Method not implemented.");
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
    throw new Error("Method not implemented.");
  }

  public disemabrk(): void {
    throw new Error("Method not implemented.");
  }

  public createBase(): void {
    throw new Error("Method not implemented.");
  }

  public hasItem(): boolean {
    throw new Error("Method not implemented.");
  }

  public capture(): boolean {
    throw new Error("Method not implemented.");
  }
}
