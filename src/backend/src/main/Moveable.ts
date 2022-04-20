import Entity from "./Entity";
import HexID from "./Map/HexID";

export default interface Moveable extends Entity {
  getId(): number;

  getCurrentPosition(): HexID;

  place(hexId: HexID): void;

  remove(): void;

  // Remove movementPoints passed as parameter
  move(movementPoints: number): void;

  nightMove(hexId: HexID): void;

  getMovementPoints(): number;

  getRemainingMovementPoints(): number;

  resetMovementPoints(): void;
}
