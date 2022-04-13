import Embarkable from "../Embarkable";
import HexID from "../Map/HexID";
import Moveable from "../Moveable";

export default class SupplyUnit extends Moveable {
  private _item: Embarkable;

  constructor(
    id: number,
    item: Embarkable,
    currentPosition: HexID,
    moraleRating: number,
    combatFactor: number,
    movementPoints: number,
    lifePoints: number,
  ) {
    super(id, currentPosition, combatFactor, movementPoints, lifePoints);
    this._item = item;
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
