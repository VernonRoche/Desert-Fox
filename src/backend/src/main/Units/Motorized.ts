import HexID from "../Map/HexID";
import AbstractUnit from "./AbstractUnit";

export default class Motorized extends AbstractUnit {
  getType(): string {
    return "motorized";
  }

  reactionMove(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }

  overrun(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }
}
