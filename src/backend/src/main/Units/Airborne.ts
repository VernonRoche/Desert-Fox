import HexID from "../Map/HexID";
import AbstractUnit from "./AbstractUnit";

export default class Airborne extends AbstractUnit {
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

  getType(): string {
    return "Airborne";
  }
}
