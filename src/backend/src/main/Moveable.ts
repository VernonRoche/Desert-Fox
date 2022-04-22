import Entity from "./Entity";
import HexID from "./Map/HexID";

// Interface which represents entities that can move on the map
export default interface Moveable extends Entity {
  getId(): number;

  // Returns the current coordinates of the entity
  getCurrentPosition(): HexID;

  // Updates the current position of the entity
  place(hexId: HexID): void;

  remove(): void;

  // Remove movementPoints passed as parameter
  move(movementPoints: number): void;

  getMovementPoints(): number;

  getRemainingMovementPoints(): number;

  resetMovementPoints(): void;
}
