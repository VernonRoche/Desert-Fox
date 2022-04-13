import Entity from "../Entity";
import Hex from "./Hex";
import HexID from "./HexID";
import fs from "fs";
import Maps from "./Maps";
import Terrain, { TerrainTypes } from "./Terrain";
import AbstractUnit, { unitJson } from "../Units/AbstractUnit";
import Player, { playerUnitJson } from "../GameManager/Player";
import Mechanized from "../Units/Mechanized";
import Foot from "../Units/Foot";
import Motorized from "../Units/Motorized";

const width = 66;
const height = 29;

type JsonMap = {
  hexId: string;
  terrain: string;
  units: unitJson[];
}[];
export default class GameMap {
  private _entities: Map<number, Entity>;
  private _hexagons: Map<string, Hex> = new Map();

  constructor(entities: Map<number, Entity>, mapName: Maps) {
    this._entities = entities;
    const json = fs.readFileSync(`maps/${mapName}.json`, "utf8");
    const map: JsonMap = JSON.parse(json);
    const validTerrains = Object.values(TerrainTypes) as string[];
    const units = this.loadUnits();
    map.forEach(({ hexId, terrain }) => {
      const x = +hexId.substring(2, 4);
      const y = +hexId.substring(0, 2);
      const validTerrain = validTerrains.includes(terrain);
      if (validTerrain) {
        const hexID = new HexID(y, x);
        const _terrain = new Terrain(terrain as TerrainTypes);
        const hex = new Hex(hexID, _terrain);
        units.forEach((unit: AbstractUnit) => {
          if (unit.getHexId().id() === hexID.id()) {
            hex.addUnit(unit);
          }
        });
        this._hexagons.set(hexID.id(), hex);
      }
    });
    for (const hex of this._hexagons.values()) {
      const x = hex.getID().getX();
      const y = hex.getID().getY();
      const getNeighbourCoordinates = function (x: number, y: number): HexID[] {
        const neighbourList: HexID[] = [];
        if (x % 2 == 0) {
          neighbourList.push(new HexID(y, x - 1));
          neighbourList.push(new HexID(y, x + 1));
          neighbourList.push(new HexID(y - 1, x));
          neighbourList.push(new HexID(y + 1, x + 1));
          neighbourList.push(new HexID(y + 1, x - 1));
          neighbourList.push(new HexID(y + 1, x));
        } else {
          neighbourList.push(new HexID(y - 1, x));
          neighbourList.push(new HexID(y, x - 1));
          neighbourList.push(new HexID(y, x + 1));
          neighbourList.push(new HexID(y + 1, x));
          neighbourList.push(new HexID(y - 1, x - 1));
          neighbourList.push(new HexID(y - 1, x + 1));
        }
        return neighbourList;
      };
      for (const neighbour of getNeighbourCoordinates(x, y)) {
        try {
          const neighbourNode = this.findHex(neighbour);
          hex.addNeighbour(neighbourNode);
        } catch (e) {
          continue;
        }
      }
    }
  }

  loadUnits(): AbstractUnit[] {
    const player1units = JSON.parse(fs.readFileSync("units/Player1Units.json", "utf8"));
    const player2units = JSON.parse(fs.readFileSync("units/Player2Units.json", "utf8"));
    const allUnitsJson: playerUnitJson[] = [...player1units, ...player2units];
    const allUnits: AbstractUnit[] = [];

    allUnitsJson.forEach((unit: playerUnitJson) => {
      const x = +unit.currentPosition.substring(2, 4);
      const y = +unit.currentPosition.substring(0, 2);
      if (isNaN(x) || isNaN(y)) {
        console.log("Error loading unit: " + unit.id + " " + unit.currentPosition);
        throw new Error("Error loading unit: " + unit.id + " " + unit.currentPosition);
      }
      if (unit.type === "mechanized")
        allUnits.push(
          new Mechanized(
            unit.id,
            new HexID(y, x),
            unit.moraleRating,
            unit.combatFactor,
            unit.movementPoints,
            unit.lifePoints,
          ),
        );
      else if (unit.type === "foot")
        allUnits.push(
          new Foot(
            unit.id,
            new HexID(y, x),
            unit.moraleRating,
            unit.combatFactor,
            unit.movementPoints,
            unit.lifePoints,
          ),
        );
      else if (unit.type === "motorized")
        allUnits.push(
          new Motorized(
            unit.id,
            new HexID(y, x),
            unit.moraleRating,
            unit.combatFactor,
            unit.movementPoints,
            unit.lifePoints,
          ),
        );
      else throw new Error("Unknown unit type: " + unit.type);
    });
    return allUnits;
  }

  public getHexes(): Map<string, Hex> {
    return this._hexagons;
  }

  public findHex(hexId: HexID): Hex {
    const hex = this._hexagons.get(hexId.id());

    if (!hex) {
      throw new Error("Nonexisting hex");
    }
    return hex;
  }

  public getEntities(): Map<number, Entity> {
    return this._entities;
  }

  public addEntity(unit: Entity): void {
    this._entities.set(unit.getId(), unit);
  }

  public addUnit(unit: AbstractUnit): void {
    const hex = this._hexagons.get(unit.getCurrentPosition().id());
    if (hex) hex.addUnit(unit);
    else throw new Error("incorrecthex");
  }

  public toJSON(player: Player): string {
    const json: JsonMap = [];
    this._hexagons.forEach((hex) => {
      const units: unitJson[] = [];
      hex.getUnits().forEach((unit) => units.push(unit.toJson(player)));
      json.push({
        hexId: hex.getID().id(),
        terrain: hex.getTerrain().terrainType,
        units: units,
      });
    });
    return JSON.stringify(json);
  }

  public getUnitById(id: number): Entity {
    const unit = this._entities.get(id);

    if (!unit) {
      throw new Error("Nonexisting entity");
    }
    return unit;
  }

  public hexBelongsToPlayer(hexID: HexID, player: Player): boolean {
    const hex = this.findHex(hexID);
    if (hex.getUnits().length === 0) {
      return true;
    }
    return hex.getUnits().some((unit) => player.hasUnit(unit));
  }

  public hexIsInEnemyZoneOfControl(hexID: HexID, enemyPlayer: Player): boolean {
    const hex = this.findHex(hexID);
    for (const neighbour of hex.getNeighbours()) {
      if (neighbour.getUnits().length > 0) {
        if (neighbour.getUnits().some((unit) => enemyPlayer.hasUnit(unit))) {
          return true;
        }
      }
    }
    return false;
  }
}
