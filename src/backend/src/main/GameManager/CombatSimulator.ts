// Abbreviations used for combat results determining certain actions.
import { TerrainTypes } from "../Map/Terrain";
import Dice from "./Dice";

/*
 * This is used for the different morale outcomes after a combat.
 * M = all units make a morale check and if they fail they retreat.
 * D = all units are disrupted.
 * W = all units retreat and are disrupted
 * R = similar to W but retreats a longer distance.
 */
export enum MoraleResult {
  NONE = "NONE",
  M = "M",
  D = "D",
  W = "W",
  R = "R",
}

/*
 * This is used for the different damage outcomes after a combat.
 * Q = The units take a quarter of their max health as damage.
 * H = The units take half of their max health as damage.
 * E = All units are destroyed.
 * X = The attackers take half the defender's damage taken as damage.
 * XX = The attackers take the same amount of damage as the defender, minimum 1.
 */
export enum DamageResult {
  NONE = "NONE",
  Q = "Q",
  H = "H",
  E = "E",
  X = "X",
  XX = "XX",
}

// First table in combat results table.
// The corresponding column in the second table is ratioTable[index+1].
const ratioTable = [
  [1 / 3, 1 / 2, 1, 2, 2, 3, 4, 5, 6, 7, 8],
  [1 / 2, 1, 2, 2, 3, 4, 5, 6, 7, 8, 8],
  [1, 2, 2, 3, 4, 5, 6, 7, 8, 8, 8],
  [2, 3, 4, 5, 6, 7, 8, 8, 8, 8, 8],
  [3, 4, 5, 6, 7, 8, 8, 8, 8, 8, 8],
];

/*
 * This is the upper half of the combat results table, which corresponds to the
 * results of defenders.
 */
// The rule's index is the real index+1.
const defenderResultsTable = [
  [
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.Q, morale: MoraleResult.M },
    { damage: DamageResult.Q, morale: MoraleResult.M },
    { damage: DamageResult.Q, morale: MoraleResult.W },
    { damage: DamageResult.Q, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.W },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
  ],
  [
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.Q, morale: MoraleResult.M },
    { damage: DamageResult.Q, morale: MoraleResult.M },
    { damage: DamageResult.Q, morale: MoraleResult.W },
    { damage: DamageResult.Q, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.R },
    { damage: DamageResult.H, morale: MoraleResult.R },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
  ],
  [
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.Q, morale: MoraleResult.M },
    { damage: DamageResult.Q, morale: MoraleResult.W },
    { damage: DamageResult.Q, morale: MoraleResult.W },
    { damage: DamageResult.Q, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.R },
    { damage: DamageResult.H, morale: MoraleResult.R },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
  ],
  [
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.Q, morale: MoraleResult.M },
    { damage: DamageResult.Q, morale: MoraleResult.W },
    { damage: DamageResult.Q, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.R },
    { damage: DamageResult.H, morale: MoraleResult.R },
    { damage: DamageResult.H, morale: MoraleResult.R },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
  ],
  [
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.Q, morale: MoraleResult.M },
    { damage: DamageResult.Q, morale: MoraleResult.W },
    { damage: DamageResult.Q, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.W },
    { damage: DamageResult.H, morale: MoraleResult.R },
    { damage: DamageResult.H, morale: MoraleResult.R },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.E, morale: MoraleResult.NONE },
  ],
];

/*
 * This is the lower half of the combat results table, which corresponds to the
 * results of attackers.
 */
// The rule's index is the real index+1.
const attackerResultsTable = [
  [
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.H, morale: MoraleResult.W },
    { damage: DamageResult.Q, morale: MoraleResult.D },
    { damage: DamageResult.Q, morale: MoraleResult.D },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.X, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.X, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.X, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
  ],
  [
    { damage: DamageResult.E, morale: MoraleResult.NONE },
    { damage: DamageResult.H, morale: MoraleResult.R },
    { damage: DamageResult.H, morale: MoraleResult.R },
    { damage: DamageResult.Q, morale: MoraleResult.W },
    { damage: DamageResult.Q, morale: MoraleResult.D },
    { damage: DamageResult.XX, morale: MoraleResult.D },
    { damage: DamageResult.XX, morale: MoraleResult.M },
    { damage: DamageResult.X, morale: MoraleResult.M },
    { damage: DamageResult.X, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.M },
    { damage: DamageResult.NONE, morale: MoraleResult.NONE },
  ],
];

export default class CombatSimulator {
  // Main combat simulation command to get the results of a combat.
  // First it fetches the ratio and converts it to a column index.
  // Rolls a dice to shift that column right and returns the defender and
  // attacker results.
  public static combatResult(
    terrain: TerrainTypes,
    numberOfAttackers: number,
    numberOfDefenders: number,
    morale: number,
    supplied: boolean,
    rolldice = true,
  ): {
    attacker: { damage: DamageResult; morale: MoraleResult };
    defender: { damage: DamageResult; morale: MoraleResult };
  } {
    let diceRoll = 0;
    if (rolldice) {
      diceRoll = Dice.rollDice();
    }

    // Remove 1 from morale to get the accurate index in the table
    morale--;

    // Gets the attacker-defender ratio, gets the line depending on terrain and
    // returns the corresponding column in the defender table.
    let ratioIndex = 0;
    if (terrain === TerrainTypes.ROUGH) {
      ratioIndex = 1;
    } else if (terrain === TerrainTypes.MOUNTAIN) {
      ratioIndex = 2;
    } else if (terrain === TerrainTypes.CITY) {
      ratioIndex = 3;
    }
    const ratio = numberOfAttackers / numberOfDefenders;
    const columnIndex =
      ratioTable[ratioIndex].findIndex((ratioInTable) => ratioInTable === ratio) + diceRoll;

    // Checks if the attacker is supplied, in order to get the upper or lower
    // line of results.
    const attackerSupplied = supplied ? 0 : 1;
    return {
      attacker: attackerResultsTable[attackerSupplied][columnIndex],
      defender: defenderResultsTable[morale][columnIndex],
    };
  }
}
