import HexID from "../Map/HexID";
import Dice from "../GameManager/Dice";
import Player from "../GameManager/Player";
import Unit, { unitJson } from "./Unit";
import Embarkable from "../Embarkable";

export default abstract class AbstractUnit implements Unit {
  private _currentPosition: HexID;
  private _movementPoints: number;
  private _id: number;
  private _combatFactor: number;
  private _remainingMovementPoints: number;
  private _lifePoints: number;
  private _moraleRating: number;
  private _hasAttacked: boolean;

  constructor(
    id: number,
    currentPosition: HexID,
    moraleRating: number,
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
    this._moraleRating = moraleRating;
    this._hasAttacked = false;
  }

  hasAttacked(): boolean {
    return this._hasAttacked;
  }

  removeLifePoints(lifePoints: number): void {
    this._lifePoints -= lifePoints;
  }

  // This check is used in combat.
  // We roll a dice. If the dice equals 6 then we automatically fail.
  // If not, then we get the dice result and add the morale rating of the unit
  // to it. If the result is higher than 5, then we fail.
  moraleCheck(): boolean {
    const dice = Dice.rollDice();
    if (dice == 6) {
      return false;
    }
    return dice + this._moraleRating <= 6;
  }

  getMoraleRating(): number {
    return this._moraleRating;
  }

  // Convert all our unit's data in a JSON object.
  toJson(player: Player): unitJson {
    return {
      type: this.getType(),
      id: this.getId(),
      currentPosition: this.getCurrentPosition(),
      movementPoints: this.getMovementPoints(),
      remainingMovementPoints: this.getRemainingMovementPoints(),
      owned: player.hasEntity(this),
      embarked:
        this.getType() === "foot" ? (this as unknown as Embarkable).isEmbarked() : undefined,
    };
  }

  abstract getType(): string;

  public getId(): number {
    return this._id;
  }

  // The function returns a HexID object, representing the coordinates of the
  // unit.
  public getCurrentPosition() {
    return this._currentPosition;
  }

  public place(hexId: HexID): void {
    this._currentPosition = new HexID(hexId.getY(), hexId.getX());
  }

  public remove(): void {
    throw new Error("Method not implemented.");
  }

  // Remove movementPoints passed as parameter
  public move(movementPoints: number): void {
    this._remainingMovementPoints -= movementPoints;
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

  public getLifePoints(): number {
    return this._lifePoints;
  }
}
