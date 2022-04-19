import HexID from "../Map/HexID";
import AbstractUnit from "./AbstractUnit";

export default class SpecialForces extends AbstractUnit {
  getType(): string {
    return "SpecialForces";
  }

  MovementAllowance(): number {
    throw new Error("Method not implemented.");
  }

  moraleCheck(): boolean {
    throw new Error("Method not implemented.");
  }

  refit(): void {
    throw new Error("Method not implemented.");
  }

  train(): void {
    throw new Error("Method not implemented.");
  }

  reactionMove(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }

  overrun(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }

  hasAttacked(): boolean {
    throw new Error("Method not implemented.");
  }

  removeLifePoints(lifePoints = 0): void {
    throw new Error("Method not implemented.");
  }
}
