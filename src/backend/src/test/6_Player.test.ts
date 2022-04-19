import Player from "../main/GameManager/Player";
import PlayerID from "../main/GameManager/PlayerID";
import HexID from "../main/Map/HexID";
import Foot from "../main/Units/Foot";
import fs from "fs";
import { UnitJson } from "../main/jsonTypes";
import { getNewId, resetIds } from "../main/idManager";

describe("Player Test", function () {
  this.afterAll(() => {
    resetIds();
  });
  const id = PlayerID.ONE;
  const footHexId = new HexID(2, 2);
  const foot = new Foot(id, footHexId, 3, 3, 12, 12);

  //const socket = io('http://localhost:${5001}');
  const player = new Player(id, null as any);
  it("Player should be correct", function () {
    if (player.getId() != PlayerID.ONE) {
      throw new Error("id not correct");
    }
    if (player.getBases().length !== 0) {
      // a modifs
      throw new Error("Bases not correct, got: " + player.getBases().length + " expected: 0");
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
    player.addUnit(foot);
    if (!player.hasUnit(foot)) {
      throw new Error("hasUnit not correct");
    }
  });
});
