import HexID from "../Map/HexID";
import Moveable from "../Moveable";

export default abstract class AbstractUnit extends Moveable {
  constructor(currentPosition: HexID, movementPoints: number, remainingMovementPoints: number) {
    super(currentPosition, movementPoints, remainingMovementPoints);
  }

  abstract refit(): void;
  abstract train(): void;
  abstract reactionMove(hexId: HexID): void;
  abstract moraleCheck(): boolean;
  abstract overrun(hexId: HexID): void;
  abstract hasGeneralSupply(): boolean;
  abstract attack(hexId: HexID, combatSupply: boolean): void;
  // TODO: ajouter un getId dans l'uml ?
  abstract getId(): number;
}
