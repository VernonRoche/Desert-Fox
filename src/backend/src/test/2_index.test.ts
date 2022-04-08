import GameMap from "../main/Map/GameMap";
import HexID from "../main/Map/HexID";
import Maps from "../main/Map/Maps";

describe("test if boolean is true", function () {
  it("should be true", function () {
    const bool = true;
    if (bool) {
      // everything is good, leave test
      return;
    } else {
      // bad, throw error
      throw new Error("not true");
    }
  });
  it("should be false", function () {
    const bool = false;
    if (!bool) {
      // everything is good, leave test
      return;
    } else {
      // bad, throw error
      throw new Error("not false");
    }
  });
});

describe("Game map test", function () {
  let map: GameMap;
  it("Instantiate map", function () {
    map = new GameMap([], "libya" as Maps);
  });
  it("Valid Hex should not throw", function () {
    const hexId = new HexID(1, 1);
    if (!map.findHex(hexId)) {
      throw new Error("not found while it was supposed to be there");
    }
  });
  it("Invalid Hex should throw", function () {
    let threw = false;
    try {
      map.findHex(new HexID(90, 90));
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      throw new Error("found hex that was not supposed to be there");
    }
  });
});
