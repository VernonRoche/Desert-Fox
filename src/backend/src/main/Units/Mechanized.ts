import HexID from "../Map/HexID";
import AbstractUnit from "./AbstractUnit";

export default class Mechanized extends AbstractUnit {
  getType(): string {
    return "mechanized";
  }

  reactionMove(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }

  overrun(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }
}
