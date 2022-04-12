import Game from "../main/GameManager/Game";
import GameMap from "../main/Map/GameMap";
import HexID from "../main/Map/HexID";
import Maps from "../main/Map/Maps";
import Player from "../main/GameManager/Player";
import PlayerID from "../main/GameManager/PlayerID";
import { Socket } from "socket.io";

describe("Check if Pathfinder works correctly", function () {
  let game: Game;
  const start = new HexID(7, 5);
  const destination = new HexID(9, 5);
  beforeEach(function () {
    const allyPlayer = new Player(PlayerID.ONE, [], [], [], Socket.prototype);
    const enemyPlayer = new Player(PlayerID.TWO, [], [], [], Socket.prototype);
    const map = new GameMap(new Map(), "libya" as Maps);
    game = new Game(map, allyPlayer, enemyPlayer);
  });

  it("The weight returned should be the movement points cost and finds shortest path", function () {
    const pathfinder = game.getPathfinder();
    const { sumOfWeight } = pathfinder.findShortestWay(
      start,
      destination,
      game.getPlayer1(),
      game.getPlayer1().getUnitById(6),
    );
    if (sumOfWeight !== 6) {
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
      game.getPlayer1().getUnitById(6),
    );
    for (const node of hexPath) {
      if (node.toString() === new HexID(5, 8).toString()) {
        throw new Error("The pathfinder goes through enemy hex");
      }
    }
  });
});
