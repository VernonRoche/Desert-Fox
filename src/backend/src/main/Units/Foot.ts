import Embarkable from "../Embarkable";
import HexID from "../Map/HexID";
import AbstractUnit from "./AbstractUnit";

export default class Foot extends AbstractUnit implements Embarkable {
  private _embarked = false;

  isEmbarked(): boolean {
    return this._embarked;
  }
  embark(): void {
    this._embarked = true;
  }
  disembark(): void {
    this._embarked = false;
  }

  getType(): string {
    return "foot";
  }
}
