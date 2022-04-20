import Dice from "../main/GameManager/Dice";
import Player from "../main/GameManager/Player";
import PlayerID from "../main/GameManager/PlayerID";
import HexID from "../main/Map/HexID";
import Unit from "../main/Units/Unit";
import Foot from "../main/Units/Foot";

describe("unit is correct add", function () {
  const id = 1000;
  const unit: Unit[] = [];
  const footHexId = new HexID(2, 2);
  const foot = new Foot(id, footHexId, 3, 3, 12, 1);
  unit.push(foot);

  it("Unit should be correct", function () {
    if (unit[0].getId() != id) {
      throw new Error("id not correct");
    }
    if (unit[0].getCurrentPosition() != footHexId) {
      throw new Error("CurrentPosition not correct");
    }
    if (unit[0].getMoraleRating() != 3) {
      throw new Error("MoraleRating not correct");
    }
    if (unit[0].getMovementPoints() != 12) {
      throw new Error("MovementPoints not correct");
    }
    if (unit[0].getLifePoints() != 1) {
      throw new Error("LifePoints not correct");
    }
  });

  it("dice is correct", function () {
    const diceRoll = Dice.rollDice();
    if (diceRoll > 6 && diceRoll <= 0) {
      throw new Error("dice not correct");
    }
  });

  it("toJson is correct ", function () {
    const player = new Player(PlayerID.ONE, null as any);
    player.addUnit(unit[0]);
    const unitJson = unit[0].toJson(player);
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
    if (unitJson.type !== "foot") {
      throw new Error("type not correct");
    }
    if (!unitJson.owned) {
      throw new Error("owned not correct");
    }
  });

  it("add units and remove units", function () {
    const player = new Player(PlayerID.ONE, null as any);
    player.addUnit(unit[0]);
    if (player.getUnits().length != 1) {
      throw new Error("getUnits not correct");
    }
    player.removeUnit(unit[0]);
    if (player.getUnits().length != 0) {
      throw new Error("getUnits not correct");
    }
  });

  it("remove lifePoints", function () {
    unit[0].removeLifePoints(1);
    if (unit[0].getLifePoints() != 0) {
      throw new Error("LifePoints not correct");
    }
  });
});
