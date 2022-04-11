import GameMap from "../main/Map/GameMap";
import HexID from "../main/Map/HexID";
import Maps from "../main/Map/Maps";

describe("Game map test", function () {
  let map: GameMap;
  it("Instantiate map", function () {
    map = new GameMap(new Map(), "libya" as Maps);
  });
  it("Valid Hex should not throw", function () {
    const hexId = new HexID(1, 1);
    if (!map.findHex(hexId)) {
      throw new Error("not found while it was supposed to be there");
    }
  });
  it("Invalid Hex should throw", function () {
    return new Promise<void>((resolve, reject) => {
      try {
        map.findHex(new HexID(90, 90));
        reject(new Error("found hex that was not supposed to be there"));
      } catch (e) {
        resolve();
      }
    });
  });
});
