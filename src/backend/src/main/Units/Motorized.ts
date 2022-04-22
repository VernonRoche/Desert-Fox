import AbstractUnit from "./AbstractUnit";

export default class Motorized extends AbstractUnit {
  getType(): string {
    return "motorized";
  }
}
