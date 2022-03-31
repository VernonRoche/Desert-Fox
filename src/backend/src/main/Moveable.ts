import Entity from "./Entity";
import HexID from "./Map/HexID";

export default abstract class Moveable implements Entity {
  private _currentPosition: HexID;
  private _movementPoints: number;
  private _remainingMovementPoints: number;
  private _id: number;

  constructor(
    id: number,
    currentPosition: HexID,
    movementPoints: number,
    remainingMovementPoints: number,
  ) {
    this._currentPosition = currentPosition;
    this._movementPoints = movementPoints;
    this._remainingMovementPoints = remainingMovementPoints;
    this._id = id;
  }
  public getID(): number {
    return this._id;
  }

  public currentPosition() {
    return this._currentPosition;
  }

  public place(hexId: HexID): void {
    this._currentPosition = new HexID(hexId.getX(), hexId.getY());
  }

  public remove(): void {
    throw new Error("Method not implemented.");
  }

  public possibleMoves(): HexID[] {
    throw new Error("Method not implemented.");
  }

  // Checks if there are remaining movement points left and if yes
  // then remove one movement point and update current hex position
  public move(hexId: HexID): boolean {
    if (this._remainingMovementPoints - 1 <= 0) {
      return false;
    }
    this._currentPosition = hexId;
    this._remainingMovementPoints--;
    return true;
  }

  public nightMove(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }

  public resetMovementPoints(): void {
    this._remainingMovementPoints = this._movementPoints;
  }
}
