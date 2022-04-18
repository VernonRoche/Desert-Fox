import HexID from "../Map/HexID";
import AbstractUnit from "./AbstractUnit";

export default class Artillery extends AbstractUnit {
  getType(): string {
    return "Artillery";
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

  hasGeneralSupply(): boolean {
    throw new Error("Method not implemented.");
  }

  attack(hexId: HexID, combatSupply: boolean): void {
    throw new Error("Method not implemented.");
  }
}
