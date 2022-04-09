import { Console } from "console";
import Dice from "../main/GameManager/Dice";
import HexID from "../main/Map/HexID";
import AbstractUnit from "../main/Units/AbstractUnit";
import Garrison from "../main/Units/Garrison";

describe("unit is correct add", function () {
  let id = 0;
  const unit: AbstractUnit[] = [];
  const garrisonHexId = new HexID(2, 2);
  let garrison = new Garrison(id, garrisonHexId, 1, 1, 2);
  unit.push(garrison);

  it("AbstractUnit should be true", function () {
    if (unit[0].getId() != id) {
      throw new Error("id not true");
    }
    if (unit[0].getCurrentPosition() != garrisonHexId) {
      throw new Error("CurrentPosition not true");
    }
    if (unit[0].getMovementPoints() != 1) {
      throw new Error("MovementPoints not true");
    }
    if (unit[0].getRemainingMovementPoints() != 1) {
      throw new Error("RemainingMovementPoints not true");
    }
    if (unit[0].getMoraleRating() != 2) {
      throw new Error("MoraleRating not true");
    }
    if (unit[0].getMoraleRating() != 2) {
      throw new Error("MoraleRating not true");
    }
  });

  it("dice is correct", function () {
    const diceRoll = Dice.rollDice();
    if (diceRoll > 6 && diceRoll <= 0) {
      throw new Error("dice not true");
    }
  });

  it("toJson is correct ", function () {
    const unitJson = unit[0].toJson();
    if (unitJson.id != unit[0].getId()) {
      throw new Error("id not true");
    }
    if (unitJson.currentPosition != unit[0].getCurrentPosition()) {
      throw new Error("CurrentPosition not true");
    }
    if (unitJson.movementPoints != unit[0].getMovementPoints()) {
      throw new Error("MovementPoints not true");
    }
    if (unitJson.remainingMovementPoints != unit[0].getRemainingMovementPoints()) {
      throw new Error("RemainingMovementPoints not true");
    }
  });
});
