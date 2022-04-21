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
  embarked: boolean | undefined;
};

// Interface which represents entities that can fight.
// Extending Moveable means of course they can also move.
export default interface Unit extends Moveable {
  // Verifies if it has attacked during the current phase
  hasAttacked(): boolean;

  removeLifePoints(lifePoints: number): void;

  // Rolls a dice and gets the morale rating of the unit. Adds them up to get the result
  // More details in it's implementation found in AbstractUnit class
  moraleCheck(): boolean;

  getMoraleRating(): number;

  toJson(player: Player): unitJson;

  getLifePoints(): number;

  // Adds one to morale rating of unit, does not apply ZOC to neighbour hexes and if the unit is motorized
  // then reduce movement by half.
  disrupt(): void;

  // Undoes the effect applied from disrupt function
  undisrupt(): void;

  isDisrupted(): boolean;
}
