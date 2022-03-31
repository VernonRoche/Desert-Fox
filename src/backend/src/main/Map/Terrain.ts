
export enum TerrainTypes {
        CLEAR = "clear",
        ROUGH = "rough",
        OASIS = "oasis",
        SAND_SEA = "sand sea",
        CITY = "city",
        MARSH = "marsh",
        EMPTY = "empty",
    }


export default class Terrain {
    private _terrainType: TerrainTypes;

    constructor(public terrainType: TerrainTypes) {
        this._terrainType = terrainType;
    }

}
