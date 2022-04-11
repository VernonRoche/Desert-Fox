import Game from "../main/GameManager/Game";
import GameMap from "../main/Map/GameMap";
import Mechanized from "../main/Units/Mechanized";
import HexID from "../main/Map/HexID";
import Maps from "../main/Map/Maps";
import Player from "../main/GameManager/Player";
import PlayerID from "../main/GameManager/PlayerID";
import { Socket } from "socket.io";

describe("Check if Pathfinder works correctly", function () {
  let game: Game;
  beforeEach(function () {
    const hexIDAlly = new HexID(5, 7);
    const hexIDEnemy = new HexID(5, 8);

    const testUnitAlly = new Mechanized(0, hexIDAlly, 15, 15, 1);
    const testUnitEnemy = new Mechanized(1, hexIDEnemy, 15, 15, 1);

    const allyPlayer = new Player(PlayerID.ONE, [testUnitAlly], [], [], [], Socket.prototype);
    const enemyPlayer = new Player(PlayerID.TWO, [testUnitEnemy], [], [], [], Socket.prototype);
    const map = new GameMap(new Map(), "libya" as Maps);
    map.findHex(hexIDAlly).addUnit(testUnitAlly);
    map.findHex(hexIDEnemy).addUnit(testUnitEnemy);
    game = new Game(map, allyPlayer, enemyPlayer);
  });

  it("The weight returned should be the movement points cost and finds shortest path", function () {
    const pathfinder = game.getPathfinder();
    const { sumOfWeight } = pathfinder.findShortestWay(
      new HexID(5, 7),
      new HexID(5, 9),
      game.getPlayer1(),
      game.getPlayer1().getUnitById(0),
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
      new HexID(5, 7),
      new HexID(5, 9),
      game.getPlayer1(),
      game.getPlayer1().getUnitById(0),
    );
    console.log(
      "Enemy unit is at " + game.getPlayer2().getUnits()[0].getCurrentPosition().toString(),
    );
    for (const node of hexPath) {
      console.log("Hex: " + node.toString());
      if (node.toString() === new HexID(5, 8).toString()) {
        throw new Error("The pathfinder goes through enemy hex");
      }
    }
  });
});
