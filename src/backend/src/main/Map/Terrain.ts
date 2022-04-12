export enum TerrainTypes {
  CLEAR = "clear",
  ROUGH = "rough",
  OASIS = "oasis",
  SAND_SEA = "sand sea",
  CITY = "city",
  MARSH = "marsh",
  MOUNTAIN = "mountain",
  EMPTY = "empty",
}

const terrainWeights: Record<TerrainTypes, number> = {
  [TerrainTypes.CLEAR]: 1,
  [TerrainTypes.ROUGH]: 2,
  [TerrainTypes.OASIS]: 2,
  [TerrainTypes.SAND_SEA]: 4,
  [TerrainTypes.CITY]: 1,
  [TerrainTypes.MARSH]: 3,
  [TerrainTypes.MOUNTAIN]: 4,
  [TerrainTypes.EMPTY]: 999,
};

export default class Terrain {
  private _terrainType: TerrainTypes;
  private _weight: number;

  constructor(public terrainType: TerrainTypes) {
    this._terrainType = terrainType;
    // REPLACE ME TO HAVE ADDITIONAL WEIGHTS
    this._weight = terrainWeights[terrainType];
  }

  public getWeight(): number {
    return this._weight;
  }
}
