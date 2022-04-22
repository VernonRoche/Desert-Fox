import Game from "../main/GameManager/Game";
import Player from "../main/GameManager/Player";
import PlayerID from "../main/GameManager/PlayerID";
import Moveable from "../main/Moveable";

describe("Game tests", function () {
  const player1 = new Player(PlayerID.ONE, null as any);
  const player2 = new Player(PlayerID.TWO, null as any);
  let game: Game;
  it("initialize game", function () {
    game = new Game(player1, player2);
    if (!game) {
      throw new Error("Game is not initialized");
    }
  });
  it("game should show available units to move", function () {
    if (game.availableUnitsToMove(player1).length !== 6) {
      throw new Error("Game should show available units to move");
    }
  });
  it("game checks supplies properly", function () {
    if (
      !game.checkUnitSupplies(
        player1,
        player1.getUnits() as unknown as Moveable[],
        player1.getBases(),
        player1.getDumps(),
        player1.getSupplyUnits(),
      )
    ) {
      throw new Error("Game should check supplies properly");
    }
  });
  it("checks embark", function () {
    const aSupplyUnit = player1.getSupplyUnits()[0];
    const aDump = player1.getDumps()[0];
    try {
      game.moveUnit(player1, aSupplyUnit, aDump.getCurrentPosition());
    } catch (e) {
      throw new Error("The move of the supply unit to the dump wasn't possible");
    }
    game.embarkEntity(player1, aSupplyUnit, aDump);
    if (!aSupplyUnit.getEmbarked()) {
      throw new Error("Embark didn't work properly. The unit is not embarked !");
    }
  });
  it("checks disembark", function () {
    const aSupplyUnit = player1.getSupplyUnits()[0];
    game.disembarkEntity(player1, aSupplyUnit);
    if (game.getMap().findHex(aSupplyUnit.getCurrentPosition()).getDumps().length !== 1) {
      throw new Error("Disembark didn't work properly. The dump is not in the map !");
    }
    if (aSupplyUnit.getEmbarked()) {
      throw new Error("Disembark didn't work properly. The unit is still embarked !");
    }
  });
});
