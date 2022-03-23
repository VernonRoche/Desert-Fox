import Entity from "./Entity";
import HexID from "./HexID";

export default abstract class Moveable implements Entity {
  private _currentPosition: HexID;
  private _movementPoints: number;
  private _remainingMovementPoints: number;

  constructor(currentPosition: HexID, movementPoints: number, remainingMovementPoints: number) {
    this._currentPosition = currentPosition;
    this._movementPoints = movementPoints;
    this._remainingMovementPoints = remainingMovementPoints;
  }

  public place(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }

  public remove(): void {
    throw new Error("Method not implemented.");
  }

  public possibleMoves(): HexID[] {
    throw new Error("Method not implemented.");
  }

  public move(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }

  public nightMove(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }

  public resetMovementPoints(): void {
    throw new Error("Method not implemented.");
  }
}
