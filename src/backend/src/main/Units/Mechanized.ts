import HexID from "../Map/HexID";
import AbstractUnit from "./AbstractUnit";

export default class Mechanized extends AbstractUnit {
  getType(): string {
    return "mechanized";
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
}
