import AbstractUnit from "./AbstractUnit";
import HexID from "../Map/HexID";

export default class SpecialForces extends AbstractUnit {
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

  getId(): number {
    return this.getID();
  }
}
