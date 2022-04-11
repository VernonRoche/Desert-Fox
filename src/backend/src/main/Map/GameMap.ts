import Entity from "../Entity";
import Hex from "./Hex";
import HexID from "./HexID";
import fs from "fs";
import Maps from "./Maps";
import Terrain, { TerrainTypes } from "./Terrain";
import AbstractUnit, { unitJson } from "../Units/AbstractUnit";
import Player from "../GameManager/Player";

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
    for (const hex of this._hexagons.values()) {
      const x = hex.getID().getX();
      const y = hex.getID().getY();
      const getNeighbourCoordinates = function (x: number, y: number): HexID[] {
        const neighbourList: HexID[] = [];
        if (x % 2 == 0) {
          neighbourList.push(new HexID(x - 1, y));
          neighbourList.push(new HexID(x + 1, y));
          neighbourList.push(new HexID(x, y - 1));
          neighbourList.push(new HexID(x + 1, y + 1));
          neighbourList.push(new HexID(x - 1, y + 1));
          neighbourList.push(new HexID(x, y + 1));
        } else {
          neighbourList.push(new HexID(x, y - 1));
          neighbourList.push(new HexID(x - 1, y));
          neighbourList.push(new HexID(x + 1, y));
          neighbourList.push(new HexID(x, y + 1));
          neighbourList.push(new HexID(x - 1, y - 1));
          neighbourList.push(new HexID(x + 1, y - 1));
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

  public addEntity(unit: Entity): void {
    this._entities.push(unit);
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

  public getUnitById(id: number): Entity | null {
    return this._entities.find((unit) => unit.getId() === id) ?? null;
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
