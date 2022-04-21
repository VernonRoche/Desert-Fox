import { TerrainTypes } from "../main/Map/Terrain";
import CombatSimulator, { DamageResult, MoraleResult } from "../main/GameManager/CombatSimulator";
import { resetIds } from "../main/IdManager";

describe("Check if combat simulator works correctly", function () {
  this.afterAll(() => {
    resetIds();
  });
  it("Morale results should be correct", function () {
    let morale = 4;
    let terrain = TerrainTypes.ROUGH;
    let numberOfAttackers = 3;
    let numberOfDefenders = 1;
    let result = CombatSimulator.combatResult(
      terrain,
      numberOfAttackers,
      numberOfDefenders,
      morale,
      true,
      false,
    );
    if (result["defender"]["morale"] !== MoraleResult.M) {
      throw new Error(
        "First test did not return a defender morale result of M. Instead it's " +
          result["defender"]["morale"],
      );
    }

    morale = 3;
    terrain = TerrainTypes.CLEAR;
    numberOfAttackers = 1;
    numberOfDefenders = 3;
    result = CombatSimulator.combatResult(
      terrain,
      numberOfAttackers,
      numberOfDefenders,
      morale,
      true,
      false,
    );
    if (result["defender"]["morale"] !== MoraleResult.NONE) {
      throw new Error(
        "Second test did not return a defender morale result of NONE. Instead it's " +
          result["defender"]["morale"],
      );
    }

    numberOfAttackers = 3;
    numberOfDefenders = 1;
    result = CombatSimulator.combatResult(
      terrain,
      numberOfAttackers,
      numberOfDefenders,
      morale,
      true,
      false,
    );
    if (result["attacker"]["morale"] !== MoraleResult.M) {
      throw new Error(
        "Third test did not return an attacker morale result of M.  Instead it's " +
          result["attacker"]["morale"],
      );
    }

    terrain = TerrainTypes.ROUGH;
    numberOfAttackers = 4;
    numberOfDefenders = 1;
    result = CombatSimulator.combatResult(
      terrain,
      numberOfAttackers,
      numberOfDefenders,
      morale,
      true,
      false,
    );
    if (result["attacker"]["morale"] !== MoraleResult.M) {
      throw new Error(
        "Fourth test did not return an attacker morale result of M. Instead it's " +
          result["attacker"]["morale"],
      );
    }
  });

  it("Damage results should be correct", function () {
    let morale = 4;
    let terrain = TerrainTypes.ROUGH;
    let numberOfAttackers = 3;
    let numberOfDefenders = 1;
    let result = CombatSimulator.combatResult(
      terrain,
      numberOfAttackers,
      numberOfDefenders,
      morale,
      true,
      false,
    );
    if (result["defender"]["damage"] !== DamageResult.Q) {
      throw new Error(
        "First test did not return a defender damage result of Q. Instead it's " +
          result["defender"]["damage"],
      );
    }

    morale = 3;
    terrain = TerrainTypes.CLEAR;
    numberOfAttackers = 1;
    numberOfDefenders = 3;
    result = CombatSimulator.combatResult(
      terrain,
      numberOfAttackers,
      numberOfDefenders,
      morale,
      true,
      false,
    );
    if (result["defender"]["damage"] !== DamageResult.NONE) {
      throw new Error(
        "Second test did not return a defender damage result of NONE. Instead it's " +
          result["defender"]["damage"],
      );
    }

    numberOfAttackers = 3;
    numberOfDefenders = 1;
    result = CombatSimulator.combatResult(
      terrain,
      numberOfAttackers,
      numberOfDefenders,
      morale,
      true,
      false,
    );
    if (result["attacker"]["damage"] !== DamageResult.X) {
      throw new Error(
        "Third test did not return an attacker damage result of X.  Instead it's " +
          result["attacker"]["damage"],
      );
    }

    terrain = TerrainTypes.ROUGH;
    numberOfAttackers = 4;
    numberOfDefenders = 1;
    result = CombatSimulator.combatResult(
      terrain,
      numberOfAttackers,
      numberOfDefenders,
      morale,
      false,
      false,
    );
    if (result["attacker"]["damage"] !== DamageResult.XX) {
      throw new Error(
        "Fourth test did not return an attacker damage result of XX. Instead it's " +
          result["attacker"]["damage"],
      );
    }
  });
});
