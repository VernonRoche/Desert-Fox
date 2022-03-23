import Entity from "./Entity";
import HexID from "./HexID";
import Moveable from "./Moveable";

interface Unit extends Moveable {
  refit(): void;
  train(): void;
  reactionMove(hexId: HexID): void;
  moraleCheck(): boolean;
  overrun(hexId: HexID): void;
  hasGeneralSupply(): boolean;
  attack(hexId: HexID, combatSupply: boolean): void;
  // TODO: ajouter un getId dans l'uml ?
  getId(): number;
}

export default Unit;
