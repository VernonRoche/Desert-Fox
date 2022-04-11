import Dice from "../main/GameManager/Dice";
import Player from "../main/GameManager/Player";
import PlayerID from "../main/GameManager/PlayerID";
import HexID from "../main/Map/HexID";
import AbstractUnit from "../main/Units/AbstractUnit";
import Garrison from "../main/Units/Garrison";

describe("unit is correct add", function () {
  const id = 0;
  const unit: AbstractUnit[] = [];
  const garrisonHexId = new HexID(2, 2);
  const garrison = new Garrison(id, garrisonHexId, 3, 3, 12, 1);
  unit.push(garrison);

  it("AbstractUnit should be correct", function () {
    if (unit[0].getId() != id) {
      throw new Error("id not correct");
    }
    if (unit[0].getCurrentPosition() != garrisonHexId) {
      throw new Error("CurrentPosition not correct");
    }
    if (unit[0].getMovementPoints() != 12) {
      throw new Error("MovementPoints not correct");
    }
    if (unit[0].getRemainingMovementPoints() != 1) {
      throw new Error("RemainingMovementPoints not correct");
    }
    if (unit[0].getMoraleRating() != 2) {
      throw new Error("MoraleRating not correct");
    }
    if (unit[0].getMoraleRating() != 2) {
      throw new Error("MoraleRating not correct");
    }
  });

  it("dice is correct", function () {
    const diceRoll = Dice.rollDice();
    if (diceRoll > 6 && diceRoll <= 0) {
      throw new Error("dice not correct");
    }
  });

  it("toJson is correct ", function () {
    const unitJson = unit[0].toJson(new Player(PlayerID.ONE, [], [], [], null as any));
    if (unitJson.id !== unit[0].getId()) {
      throw new Error("id not correct");
    }
    if (unitJson.currentPosition !== unit[0].getCurrentPosition()) {
      throw new Error("CurrentPosition not correct");
    }
    if (unitJson.movementPoints !== unit[0].getMovementPoints()) {
      throw new Error("MovementPoints not correct");
    }
    if (unitJson.remainingMovementPoints !== unit[0].getRemainingMovementPoints()) {
      throw new Error("RemainingMovementPoints not correct");
    }
    if (unitJson.type !== "Garrison") {
      throw new Error("type not correct");
    }
    if (unitJson.owned !== false) {
      throw new Error("owned not correct");
    }
  });
});
