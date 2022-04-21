import Entity from "../Entity";
import Hex from "./Hex";
import HexID from "./HexID";
import fs from "fs";
import Maps from "./Maps";
import Terrain, { TerrainTypes } from "./Terrain";
import Unit, { unitJson } from "../Units/Unit";
import Player from "../GameManager/Player";
import Base, { baseJson } from "../Infrastructure/Base";
import Dump, { dumpJson } from "../Infrastructure/Dump";
import { supplyUnitJson } from "../Infrastructure/SupplyUnit";

const width = 66;
const height = 29;

type JsonMap = {
  hexId: string;
  terrain: string;
  units: unitJson[];
  base: baseJson | undefined;
  dumps: dumpJson[];
  supplyUnits: supplyUnitJson[];
}[];
export default class GameMap {
  private _entities: Map<string, Entity>;
  private _hexagons: Map<string, Hex> = new Map();

  constructor(mapName: Maps, entities: Map<string, Entity>) {
    this._entities = entities;
    // Load the map from a json file.
    const json = fs.readFileSync(`maps/${mapName}.json`, "utf8");
    const map: JsonMap = JSON.parse(json);
    const validTerrains = Object.values(TerrainTypes) as string[];
    // Convert the json data to Terrain types and hex identifiers.
    // Finally create the corresponding hexes.
    map.forEach(({ hexId, terrain }) => {
      const x = +hexId.substring(2, 4);
      const y = +hexId.substring(0, 2);
      const validTerrain = validTerrains.includes(terrain);
      if (validTerrain) {
        const hexID = new HexID(y, x);
        const _terrain = new Terrain(terrain as TerrainTypes);
        const hex = new Hex(hexID, _terrain);
        entities.forEach((entity: Entity) => {
          if (entity.getCurrentPosition().id() === hexID.id()) {
            hex.addEntity(entity);
          }
        });
        this._hexagons.set(hexID.id(), hex);
      }
    });
    // Initialize the neighbours of each hex.
    for (const hex of this._hexagons.values()) {
      const x = hex.getId().getX();
      const y = hex.getId().getY();
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

  public getEntities(): Map<string, Entity> {
    return this._entities;
  }

  public addEntity(unit: Entity): void {
    this._entities.set(unit.getId().toString(), unit);
  }

  public addUnit(unit: Unit): void {
    const hex = this._hexagons.get(unit.getCurrentPosition().id());
    if (hex) hex.addUnit(unit);
    else throw new Error("incorrecthex");
  }

  removeDump(dump: Dump) {
    this._entities.delete(dump.getId().toString());
    const hex = this._hexagons.get(dump.getCurrentPosition().id());
    if (hex) hex.removeDump(dump);
  }

  // Convert all data held by the map into JSON format.
  public toJSON(player: Player): string {
    const json: JsonMap = [];
    this._hexagons.forEach((hex) => {
      const units: unitJson[] = [];
      let base: baseJson | undefined = undefined;
      const dumps: dumpJson[] = [];
      const supplyUnits: supplyUnitJson[] = [];
      hex.getUnits().forEach((unit) => units.push(unit.toJson(player)));
      const baseX: Base | undefined = hex.getBase();
      if (baseX) base = baseX.toJson(player);
      hex.getDumps().forEach((dump) => dumps.push(dump.toJson(player)));
      hex.getSupplyUnits().forEach((supplyUnit) => supplyUnits.push(supplyUnit.toJson(player)));

      json.push({
        hexId: hex.getId().id(),
        terrain: hex.getTerrain().terrainType,
        units: units,
        base: base,
        dumps: dumps,
        supplyUnits: supplyUnits,
      });
    });
    return JSON.stringify(json);
  }

  public getUnitById(id: number): Entity {
    const unit = this._entities.get(id.toString());

    if (!unit) {
      throw new Error("Nonexisting entity");
    }
    return unit;
  }

  // Returns true if the given hex has a unit of the player, or is empty.
  // Returns false if there is an enemy unit on the hex.
  // For convenience purposes an empty hex belongs to both players.
  public hexBelongsToPlayer(hexID: HexID, player: Player): boolean {
    const hex = this.findHex(hexID);
    if (hex.getUnits().length === 0) {
      return true;
    }
    return hex.getUnits().some((unit) => player.hasEntity(unit));
  }
}
