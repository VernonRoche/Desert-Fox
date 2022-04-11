import HexID from "../Map/HexID";
import Moveable from "../Moveable";
import Dice from "../GameManager/Dice";
import Player from "../GameManager/Player";

export type unitJson = {
  type: string;
  id: number;
  currentPosition: HexID;
  movementPoints: number;
  remainingMovementPoints: number;
  owned: boolean;
};
export default abstract class AbstractUnit extends Moveable {
  private _moraleRating: number;

  constructor(
    id: number,
    currentPosition: HexID,
    moraleRating: number,
    combatFactor: number,
    movementPoints: number,
    lifePoints: number,
  ) {
    super(id, currentPosition, combatFactor, movementPoints, lifePoints);
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
  toJson(player: Player): unitJson {
    return {
      type: this.getType(),
      id: this.getId(),
      currentPosition: this.getCurrentPosition(),
      movementPoints: this.getMovementPoints(),
      remainingMovementPoints: this.getRemainingMovementPoints(),
      owned: player.hasUnit(this),
    };
  }
  abstract getType(): string;
}
