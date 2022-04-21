import Entity from "../Entity";
import fs from "fs";
import { BaseJson, DumpJson, SupplyUnitJson, UnitJson } from "../jsonTypes";
import { getNewId } from "../IdManager";
import Mechanized from "../Units/Mechanized";
import HexID from "../Map/HexID";
import Foot from "../Units/Foot";
import Motorized from "../Units/Motorized";
import Game from "./Game";
import Player from "./Player";
import Base from "../Infrastructure/Base";
import Dump from "../Infrastructure/Dump";
import SupplyUnit from "../Infrastructure/SupplyUnit";

export function loadEntitiesAndMap(game: Game): Map<string, Entity> {
  const player1entities = JSON.parse(fs.readFileSync("entities/player1.json", "utf8"));
  const player2entities = JSON.parse(fs.readFileSync("entities/player2.json", "utf8"));
  const allEntities = new Map<string, Entity>();
  const player1Units = [...player1entities.units];
  addUnitsToPlayer(game.getPlayer1(), player1Units, allEntities);
  const player2Units = [...player2entities.units];
  addUnitsToPlayer(game.getPlayer2(), player2Units, allEntities);
  const player1SupplyUnits = [...player1entities.supplyUnits];
  addSupplyUnitsToPlayer(game.getPlayer1(), player1SupplyUnits, allEntities);
  const player2SupplyUnits = [...player2entities.supplyUnits];
  addSupplyUnitsToPlayer(game.getPlayer2(), player2SupplyUnits, allEntities);
  const player1Bases = [...player1entities.bases];
  addBasesToPlayer(game.getPlayer1(), player1Bases, allEntities);
  const player2Bases = [...player2entities.bases];
  addBasesToPlayer(game.getPlayer2(), player2Bases, allEntities);
  const player1Dumps = [...player1entities.dumps];
  addDumpsToPlayer(game.getPlayer1(), player1Dumps, allEntities);
  const player2Dumps = [...player2entities.dumps];
  addDumpsToPlayer(game.getPlayer2(), player2Dumps, allEntities);
  return allEntities;
}

function addUnitsToPlayer(
  player: Player,
  units: UnitJson[],
  allEntities: Map<string, Entity>,
): void {
  units.forEach((unit: UnitJson) => {
    const x = +unit.currentPosition.substring(2, 4);
    const y = +unit.currentPosition.substring(0, 2);
    const unitId = getNewId();
    if (isNaN(x) || isNaN(y)) {
      console.log("Error loading unit: " + unitId + " " + unit.currentPosition);
      throw new Error("Error loading unit: " + unitId + " " + unit.currentPosition);
    }
    let unitToAdd;
    if (unit.type === "mechanized") {
      unitToAdd = new Mechanized(
        unitId,
        new HexID(y, x),
        unit.moraleRating,
        unit.combatFactor,
        unit.movementPoints,
        unit.lifePoints,
      );
    } else if (unit.type === "foot")
      unitToAdd = new Foot(
        unitId,
        new HexID(y, x),
        unit.moraleRating,
        unit.combatFactor,
        unit.movementPoints,
        unit.lifePoints,
      );
    else if (unit.type === "motorized")
      unitToAdd = new Motorized(
        unitId,
        new HexID(y, x),
        unit.moraleRating,
        unit.combatFactor,
        unit.movementPoints,
        unit.lifePoints,
      );
    else throw new Error("Unknown unit type: " + unit.type);
    player.addUnit(unitToAdd);
    allEntities.set(unitId.toString(), unitToAdd);
  });
}

function addBasesToPlayer(player: Player, bases: BaseJson[], allEntities: Map<string, Entity>) {
  bases.forEach((base: BaseJson) => {
    const x = +base.currentPosition.substring(2, 4);
    const y = +base.currentPosition.substring(0, 2);
    const baseId = getNewId();
    if (isNaN(x) || isNaN(y)) {
      console.log("Error loading base: " + baseId + " " + base.currentPosition);
      throw new Error("Error loading base: " + baseId + " " + base.currentPosition);
    }
    const baseToAdd = new Base(new HexID(y, x), base.primary, baseId);
    player.addBase(baseToAdd);
    allEntities.set(baseId.toString(), baseToAdd);
  });
}

function addDumpsToPlayer(player: Player, dumps: DumpJson[], allEntities: Map<string, Entity>) {
  dumps.forEach((dump: DumpJson) => {
    const x = +dump.currentPosition.substring(2, 4);
    const y = +dump.currentPosition.substring(0, 2);
    const dumpId = getNewId();
    if (isNaN(x) || isNaN(y)) {
      console.log("Error loading dump: " + dumpId + " " + dump.currentPosition);
      throw new Error("Error loading dump: " + dumpId + " " + dump.currentPosition);
    }
    const dumpToAdd = new Dump(dumpId, new HexID(y, x));
    player.addDump(dumpToAdd);
    allEntities.set(dumpId.toString(), dumpToAdd);
  });
}

function addSupplyUnitsToPlayer(
  player: Player,
  supplyUnits: SupplyUnitJson[],
  allEntities: Map<string, Entity>,
) {
  supplyUnits.forEach((supplyUnit: SupplyUnitJson) => {
    const x = +supplyUnit.currentPosition.substring(2, 4);
    const y = +supplyUnit.currentPosition.substring(0, 2);
    const supplyUnitId = getNewId();
    if (isNaN(x) || isNaN(y)) {
      console.log("Error loading supply unit: " + supplyUnitId + " " + supplyUnit.currentPosition);
      throw new Error(
        "Error loading supply unit: " + supplyUnitId + " " + supplyUnit.currentPosition,
      );
    }
    const supplyUnitToAdd = new SupplyUnit(
      supplyUnitId,
      new HexID(y, x),
      supplyUnit.movementPoints,
    );
    player.addSupplyUnit(supplyUnitToAdd);
    allEntities.set(supplyUnitId.toString(), supplyUnitToAdd);
  });
}
