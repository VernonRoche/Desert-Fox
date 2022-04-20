import Game from "../main/GameManager/Game";
import HexID from "../main/Map/HexID";
import Player from "../main/GameManager/Player";
import PlayerID from "../main/GameManager/PlayerID";
import { Socket } from "socket.io";
import Mechanized from "../main/Units/Mechanized";
import { resetIds } from "../main/idManager";
import { DamageResult, MoraleResult } from "../main/GameManager/CombatSimulator";

describe("Check if attack works correctly", function () {
  this.afterAll(() => {
    resetIds();
  });
  let game: Game;
  const start = new HexID(7, 5);
  const destination = new HexID(8, 5);
  beforeEach(function () {
    const allyPlayer = new Player(PlayerID.ONE, Socket.prototype);
    const enemyPlayer = new Player(PlayerID.TWO, Socket.prototype);
    game = new Game(allyPlayer, enemyPlayer);
    const friendlyUnit = new Mechanized(1000, new HexID(7, 5), 3, 2, 15, 1);
    const enemyUnit = new Mechanized(1001, new HexID(8, 5), 3, 2, 15, 1);
    allyPlayer.addUnit(friendlyUnit);
    enemyPlayer.addUnit(enemyUnit);
    game.getMap().findHex(start).addUnit(friendlyUnit);
    game.getMap().findHex(new HexID(8, 5)).addUnit(enemyUnit);
  });

  it("Damage results should be correct", function () {
    //console.log(game.getPlayer2().getUnits());
    const defenderUnit = game.getPlayer2().getUnitById(1001);
    const attackerUnit = game.getPlayer1().getUnitById(1000);
    const result = game.attackHex([game.getPlayer1().getUnitById(1000)], destination);
    switch (result["defender"]["damage"]) {
      case DamageResult.H:
      case DamageResult.E:
        if (game.getPlayer2().hasEntity(defenderUnit)) {
          throw new Error("The defender unit should be destroyed for E or H result.");
        }
        break;
      case DamageResult.NONE:
      case DamageResult.Q:
        if (!game.getPlayer2().hasEntity(defenderUnit)) {
          throw new Error("The defender unit should not be destroyed for Q result.");
        }
        break;
      default:
        throw new Error("Unknown damage result.");
    }
    switch (result["attacker"]["damage"]) {
      case DamageResult.H:
      case DamageResult.E:
        if (game.getPlayer1().hasEntity(attackerUnit)) {
          throw new Error("The attacker unit should be destroyed for E or H result.");
        }
        break;
      case DamageResult.NONE:
      case DamageResult.Q:
        if (!game.getPlayer1().hasEntity(attackerUnit)) {
          throw new Error("The attacker unit should not be destroyed for Q result.");
        }
        break;
      case DamageResult.XX:
      case DamageResult.X:
        if (
          result["defender"]["damage"] === DamageResult.E ||
          result["defender"]["damage"] === DamageResult.H
        ) {
          if (game.getPlayer1().hasEntity(game.getPlayer1().getUnitById(1000))) {
            throw new Error("The attacker unit should be destroyed for defender E or H result.");
          }
        } else {
          if (!game.getPlayer1().hasEntity(game.getPlayer1().getUnitById(1000))) {
            throw new Error(
              "The attacker unit should not be destroyed for defender Q or NONE result.",
            );
          }
        }
        break;

      default:
        throw new Error("Unknown damage result.");
    }
  });

  it("Morale results should be correct", function () {
    const defenderUnit = game.getPlayer2().getUnitById(1001);
    const attackerUnit = game.getPlayer1().getUnitById(1000);
    const result = game.attackHex([game.getPlayer1().getUnitById(1000)], destination);
    if (game.getPlayer2().hasEntity(defenderUnit)) {
      if (
        result["defender"]["morale"] === MoraleResult.W ||
        result["defender"]["morale"] === MoraleResult.R
      ) {
        if (game.getMap().findHex(destination).getUnits().length !== 0) {
          throw new Error("The defender should retreat for a W or R result.");
        }
      }
    }
    if (game.getPlayer1().hasEntity(attackerUnit)) {
      if (
        result["attacker"]["morale"] === MoraleResult.W ||
        result["attacker"]["morale"] === MoraleResult.R
      ) {
        if (game.getMap().findHex(start).getUnits().length !== 0) {
          throw new Error("The attacker should retreat for a W or R result.");
        }
      }
    }
  });
});
