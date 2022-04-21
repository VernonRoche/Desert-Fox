import Game from "../main/GameManager/Game";
import GameMap from "../main/Map/GameMap";
import HexID from "../main/Map/HexID";
import Maps from "../main/Map/Maps";
import Player from "../main/GameManager/Player";
import PlayerID from "../main/GameManager/PlayerID";
import { Socket } from "socket.io";
import Mechanized from "../main/Units/Mechanized";
import { resetIds } from "../main/IdManager";

describe("Check if Pathfinder works correctly", function () {
  this.afterAll(() => {
    resetIds();
  });
  let game: Game;
  const start = new HexID(7, 5);
  const destination = new HexID(9, 5);
  beforeEach(function () {
    const allyPlayer = new Player(PlayerID.ONE, Socket.prototype);
    const enemyPlayer = new Player(PlayerID.TWO, Socket.prototype);
    game = new Game(allyPlayer, enemyPlayer);
    const enemyUnit = new Mechanized(1001, new HexID(8, 5), 3, 2, 15, 1);
    const friendlyUnit = new Mechanized(1000, new HexID(7, 5), 3, 2, 15, 1);
    allyPlayer.addUnit(friendlyUnit);
    enemyPlayer.addUnit(enemyUnit);
    game.getMap().findHex(start).addUnit(friendlyUnit);
    game.getMap().findHex(new HexID(8, 5)).addUnit(enemyUnit);
  });

  it("The weight returned should be the movement points cost and finds shortest path", function () {
    const pathfinder = game.getPathfinder();
    const { sumOfWeight } = pathfinder.findShortestWay(
      start,
      destination,
      game.getPlayer1(),
      game.getPlayer1().getUnitById(1000).getType(),
    );
    if (sumOfWeight !== 7) {
      throw new Error(
        "The weight returned is different from the movement cost. The returned weight is " +
          sumOfWeight,
      );
    }
  });

  it("Does not go through or enter enemy hex", function () {
    const pathfinder = game.getPathfinder();
    const { hexPath } = pathfinder.findShortestWay(
      start,
      destination,
      game.getPlayer1(),
      game.getPlayer1().getUnitById(1000).getType(),
    );
    for (const node of hexPath) {
      if (node.toString() === new HexID(5, 8).toString()) {
        throw new Error("The pathfinder goes through enemy hex");
      }
    }
  });
});
