import HexID from "../Map/HexID";
import AbstractUnit from "./AbstractUnit";

export default class Mechanized extends AbstractUnit {
  getType(): string {
    return "mechanized";
  }
}
