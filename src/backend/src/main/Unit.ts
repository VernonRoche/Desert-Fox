import Entity from "./Entity";
import HexID from "./HexID";
import Moveable from "./Moveable";

abstract class Unit extends Moveable {
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

export default Unit;
