import { number } from "yargs";
import HexID from "../Map/HexID";
import Moveable from "../Moveable";

export type unitJson = {
  id: number;
  currentPosition: HexID;
  movementPoints: number;
  remainingMovementPoints: number;
};
export default abstract class AbstractUnit extends Moveable {
  constructor(
    id: number,
    currentPosition: HexID,
    movementPoints: number,
    remainingMovementPoints: number,
  ) {
    super(id, currentPosition, movementPoints, remainingMovementPoints);
  }

  abstract refit(): void;
  abstract train(): void;
  abstract reactionMove(hexId: HexID): void;
  abstract moraleCheck(): boolean;
  abstract overrun(hexId: HexID): void;
  abstract hasGeneralSupply(): boolean;
  abstract attack(hexId: HexID, combatSupply: boolean): void;
  abstract is_movement(): boolean;
  toJson(): unitJson {
    return {
      id: this.getID(),
      currentPosition: this.currentPosition(),
      movementPoints: this.getMovementPoints(),
      remainingMovementPoints: this.getRemainingMovementPoints(),
    };
  }
}
