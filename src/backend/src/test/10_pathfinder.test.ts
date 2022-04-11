import Game from "../main/GameManager/Game";
import GameMap from "../main/Map/GameMap";
import HexID from "../main/Map/HexID";
import Maps from "../main/Map/Maps";
import Player from "../main/GameManager/Player";
import PlayerID from "../main/GameManager/PlayerID";
import { Socket } from "socket.io";
import Garrison from "../main/Units/Garrison";

describe("Check if Pathfinder works correctly", function () {
  let game: Game;
  beforeEach(function () {
    const hexIDAlly = new HexID(5, 7);
    const hexIDEnemy = new HexID(5, 8);

    const testUnitAlly = new Garrison(0, hexIDAlly, 15, 15, 1);
    const testUnitEnemy = new Garrison(1, hexIDEnemy, 15, 15, 1);

    const allyPlayer = new Player(PlayerID.ONE, [testUnitAlly], [], [], [], Socket.prototype);
    const enemyPlayer = new Player(PlayerID.TWO, [testUnitEnemy], [], [], [], Socket.prototype);
    const map = new GameMap([], "libya" as Maps);
    game = new Game(map, allyPlayer, enemyPlayer);
  });

  it("The weight returned should be the movement points cost", function () {
    const pathfinder = game.getPathfinder();
    const { weight } = pathfinder.findShortestWay(
      new HexID(5, 7),
      new HexID(5, 9),
      game.getPlayer1(),
    );
    if (weight !== 3) {
      throw new Error(
        "The weight returned is different from the movement cost. The returned weight is " + weight,
      );
    }
  });

  it("It finds the shortest path", function () {
    const pathfinder = game.getPathfinder();
    const { weight } = pathfinder.findShortestWay(
      new HexID(5, 7),
      new HexID(5, 9),
      game.getPlayer1(),
    );
    if (weight > 3) {
      throw new Error(
        "The pathfinder did not find the optimal path with a cost of 3, instead it's " + weight,
      );
    }
  });

  it("Does not go through or enter enemy hex", function () {
    const pathfinder = game.getPathfinder();
    const { pathNodes } = pathfinder.findShortestWay(
      new HexID(5, 7),
      new HexID(5, 9),
      game.getPlayer1(),
    );
    for (const node of pathNodes) {
      if (node.toString() === new HexID(5, 8).toString()) {
        throw new Error("The pathfinder goes through enemy hex");
      }
    }
  });
});
