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
  private _weight: number;

  constructor(public terrainType: TerrainTypes) {
    this._terrainType = terrainType;
    // REPLACE ME TO HAVE ADDITIONAL WEIGHTS
    this._weight = 1;
  }

  public getWeight(): number {
    return this._weight;
  }
}
