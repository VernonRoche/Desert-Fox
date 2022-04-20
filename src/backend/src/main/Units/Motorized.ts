import HexID from "../Map/HexID";
import AbstractUnit from "./AbstractUnit";

export default class Motorized extends AbstractUnit {
  getType(): string {
    return "motorized";
  }
}
