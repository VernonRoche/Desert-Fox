import Player, { playerUnitJson } from "../main/GameManager/Player";
import PlayerID from "../main/GameManager/PlayerID";
import HexID from "../main/Map/HexID";
import Foot from "../main/Units/Foot";
import fs from "fs";

describe("Player Test", function () {
  const id = PlayerID.ONE;
  const footHexId = new HexID(2, 2);
  const foot = new Foot(id, footHexId, 3, 3, 12, 12);

  //const socket = io('http://localhost:${5001}');
  const player = new Player(id, [], [], [], null as any);
  it("Player should be correct", function () {
    if (player.getId() != PlayerID.ONE) {
      throw new Error("id not correct");
    }
    if (player.getBases().length !== 0) {
      // a modifs
      throw new Error("Bases not correct");
    }
    if (player.getSupplyUnits().length !== 0) {
      // a modifs
      throw new Error("SupplyUnits not correct");
    }
    if (player.getRefitPoints().length !== 0) {
      // a modifs
      throw new Error("RefitPoints not correct");
    }
    /*if (player.getSocket() != socket) {
        throw new Error("Socket not correct");
        }*/
  });

  it("hasUnit test", function () {
    if (!player.hasUnit(foot)) {
      throw new Error("hasUnit not correct");
    }
  });

  it("loadUnitsByFile for player1", function () {
    const json = fs.readFileSync("units/" + "player1" + ".json", "utf8");
    const map = JSON.parse(json);
    map.forEach((unit: playerUnitJson) => {
      const x = +unit.currentPosition.substring(2, 4);
      const y = +unit.currentPosition.substring(0, 2);
      if (isNaN(x) || isNaN(y)) {
        console.log("Error loading unit: " + unit.id + " " + unit.currentPosition);
        throw new Error("Error loading unit: " + unit.id + " " + unit.currentPosition);
      }
      if (!(unit.type === "mechanized" || unit.type === "foot" || unit.type === "motorized"))
        throw new Error("Unknown unit type: " + unit.type);
    });
  });

  it("loadUnitsByFile for player2", function () {
    const json = fs.readFileSync("units/" + "player2" + ".json", "utf8");
    const map = JSON.parse(json);
    map.forEach((unit: playerUnitJson) => {
      const x = +unit.currentPosition.substring(1, 4);
      const y = +unit.currentPosition.substring(2, 2);
      if (isNaN(x) || isNaN(y)) {
        console.log("Error loading unit: " + unit.id + " " + unit.currentPosition);
        throw new Error("Error loading unit: " + unit.id + " " + unit.currentPosition);
      }
      if (!(unit.type === "mechanized" || unit.type === "foot" || unit.type === "motorized"))
        throw new Error("Unknown unit type: " + unit.type);
    });
  });

  it("loadBasesByFile for echec", function () {
    return new Promise<void>((resolve, reject) => {
      const json = fs.readFileSync("src/" + "test/" + "units/" + "test_player1" + ".json", "utf8");
      const map = JSON.parse(json);
      map.forEach((unit: playerUnitJson) => {
        const x = +unit.currentPosition.substring(2, 4);
        const y = +unit.currentPosition.substring(0, 2);
        if (isNaN(x) || isNaN(y)) {
          console.log("Error loading unit: " + unit.id + " " + unit.currentPosition);
          reject(new Error("Error loading unit: " + unit.id + " " + unit.currentPosition));
        }
        if (!(unit.type === "mechanized" || unit.type === "foot" || unit.type === "motorized")) {
          console.log("Unknown unit type: " + unit.type);
          reject(new Error("Unknown unit type: " + unit.type));
        }

        resolve();
      });
    });
  });
});
