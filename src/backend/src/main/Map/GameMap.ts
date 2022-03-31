import Entity from "../Entity";
import Hex from "./Hex";
import HexID from "./HexID";
import fs from "fs";
import Maps from "./Maps";
import Terrain, { TerrainTypes } from "./Terrain";


const width = 66;
const height = 29;


type JsonMap = {
  hexId: string,
  terrain: string,
}[];
export default class GameMap {
  private _entities: Entity[];
  private _hexagons: Map<HexID, Hex> = new Map();

  constructor(entities: Entity[], mapName : Maps ) {
    this._entities = entities;
    const json = fs.readFileSync(`maps/${mapName}.json`, 'utf8');
    const map: JsonMap = JSON.parse(json);
    map.forEach(({hexId , terrain}) => {
      const x = +hexId.substring(2, 4);
      const y = +hexId.substring(0, 2);
      if(terrain != "empty" && terrain in TerrainTypes) {
        const hexID = new HexID(x, y);
        const _terrain = new Terrain(terrain as TerrainTypes); 
      const hex = new Hex(hexID, _terrain);
      this._hexagons.set(hexID, hex);
      }
    });
  }


  public findHex(hexId: HexID): Hex {
    const hex = this._hexagons.get(hexId);
    if (!hex) {
      throw new Error("Nonexisting hex");
    }
    return hex;
  }
  
  

}
