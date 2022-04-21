import Embarkable from "../Embarkable";
import Player from "../GameManager/Player";
import AbstractUnit from "./AbstractUnit";
import { unitJson } from "./Unit";

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

  toJson(player: Player): unitJson {
    return {
      type: this.getType(),
      id: this.getId(),
      currentPosition: this.getCurrentPosition(),
      movementPoints: this.getMovementPoints(),
      remainingMovementPoints: this.getRemainingMovementPoints(),
      owned: player.hasEntity(this),
      embarked: this.isEmbarked(),
      disrupted: this.isDisrupted(),
    };
  }
}
