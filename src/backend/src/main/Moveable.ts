import Entity from "./Entity";
import HexID from "./Map/HexID";

export default abstract class Moveable implements Entity {
  private _currentPosition: HexID;
  private _movementPoints: number;
  private _id: number;
  private _combatFactor: number;
  private _remainingMovementPoints: number;
  private _lifePoints: number;

  constructor(
    id: number,
    currentPosition: HexID,
    combatFactor: number,
    movementPoints: number,
    lifePoints: number,
  ) {
    this._currentPosition = currentPosition;
    this._movementPoints = movementPoints;
    this._remainingMovementPoints = movementPoints;
    this._combatFactor = combatFactor;
    this._lifePoints = lifePoints;
    this._id = id;
  }
  public getId(): number {
    return this._id;
  }

  public getCurrentPosition() {
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
  public move(hexId: HexID): void {
    if (this._remainingMovementPoints <= 0) {
      throw new Error("no movement points left");
    }
    this._currentPosition = hexId;
    this._remainingMovementPoints--;
  }

  public nightMove(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }

  public getMovementPoints(): number {
    return this._movementPoints;
  }

  public getRemainingMovementPoints(): number {
    return this._remainingMovementPoints;
  }

  public resetMovementPoints(): void {
    this._remainingMovementPoints = this._movementPoints;
  }
  public getHexId(): HexID {
    return this._currentPosition;
  }
  public getCombatFactor(): number {
    return this._combatFactor;
  }
  public getLifePoints(): number {
    return this._lifePoints;
  }
}
