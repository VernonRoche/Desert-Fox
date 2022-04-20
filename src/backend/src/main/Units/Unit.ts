import HexID from "../Map/HexID";
import Moveable from "../Moveable";
import Player from "../GameManager/Player";

export type unitJson = {
  type: string;
  id: number;
  currentPosition: HexID;
  movementPoints: number;
  remainingMovementPoints: number;
  owned: boolean;
};
export default interface Unit extends Moveable {
  reactionMove(hexId: HexID): void;

  overrun(hexId: HexID): void;

  hasAttacked(): boolean;

  removeLifePoints(lifePoints: number): void;

  moraleCheck(): boolean;

  getMoraleRating(): number;

  toJson(player: Player): unitJson;

  getType(): string;

  getLifePoints(): number;
}
