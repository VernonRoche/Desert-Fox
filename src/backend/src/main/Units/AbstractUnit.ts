import HexID from "../Map/HexID";
import Moveable from "../Moveable";
import Dice from "../GameManager/Dice";

export type unitJson = {
  id: number;
  currentPosition: HexID;
  movementPoints: number;
  remainingMovementPoints: number;
};
export default abstract class AbstractUnit extends Moveable {
  private _moraleRating: number;

  constructor(
    id: number,
    currentPosition: HexID,
    movementPoints: number,
    remainingMovementPoints: number,
    moraleRating: number,
  ) {
    super(id, currentPosition, movementPoints, remainingMovementPoints);
    this._moraleRating = moraleRating;
  }

  abstract refit(): void;

  abstract train(): void;

  abstract reactionMove(hexId: HexID): void;

  abstract overrun(hexId: HexID): void;

  abstract hasGeneralSupply(): boolean;

  abstract attack(hexId: HexID, combatSupply: boolean): void;

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
  toJson(): unitJson {
    return {
      id: this.getId(),
      currentPosition: this.getCurrentPosition(),
      movementPoints: this.getMovementPoints(),
      remainingMovementPoints: this.getRemainingMovementPoints(),
    };
  }
}
