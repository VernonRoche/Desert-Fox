import Entity from "../Entity";
import Hex from "./Hex";
import HexID from "./HexID";
import fs from "fs";
import Maps from "./Maps";
import Terrain, { TerrainTypes } from "./Terrain";
import { unitJson } from "../Units/AbstractUnit";

const width = 66;
const height = 29;

type JsonMap = {
  hexId: string;
  terrain: string;
  units: unitJson[];
}[];
export default class GameMap {
  private _entities: Entity[];
  private _hexagons: Map<string, Hex> = new Map();

  constructor(entities: Entity[], mapName: Maps) {
    this._entities = entities;
    const json = fs.readFileSync(`maps/${mapName}.json`, "utf8");
    const map: JsonMap = JSON.parse(json);
    const validTerrains = Object.values(TerrainTypes) as string[];
    map.forEach(({ hexId, terrain }) => {
      const x = +hexId.substring(2, 4);
      const y = +hexId.substring(0, 2);
      const validTerrain = validTerrains.includes(terrain);
      if (validTerrain) {
        const hexID = new HexID(x, y);
        const _terrain = new Terrain(terrain as TerrainTypes);
        const hex = new Hex(hexID, _terrain);
        this._hexagons.set(hexID.id(), hex);
      }
    });
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

  public getEntities(): Entity[] {
    return this._entities;
  }

  public addUnit(unit: Entity): void {
    this._entities.push(unit);
  }

  public toJSON(): string {
    const json: JsonMap = [];
    this._hexagons.forEach((hex) => {
      const units: {
        id: number;
        currentPosition: HexID;
        movementPoints: number;
        remainingMovementPoints: number;
      }[] = [];
      hex.getUnits().forEach((unit) => units.push(unit.toJson()));
      json.push({
        hexId: hex.getID().id(),
        terrain: hex.getTerrain().terrainType,
        units: units,
      });
    });
    return JSON.stringify(json);
  }

  public getUnitById(id: number): Entity | null {
    return this._entities.find((unit) => unit.getID() === id) ?? null;
  }
}
