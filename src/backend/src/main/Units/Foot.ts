import Embarkable from "../Embarkable";
import HexID from "../Map/HexID";
import AbstractUnit from "./AbstractUnit";

export default class Foot extends AbstractUnit implements Embarkable {
  embark(): void {
    throw new Error("Method not implemented.");
  }
  disembark(): void {
    throw new Error("Method not implemented.");
  }

  getType(): string {
    return "foot";
  }

  reactionMove(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }

  overrun(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }
}
