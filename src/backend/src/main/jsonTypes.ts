export type UnitJson = {
  type: string;
  currentPosition: string;
  movementPoints: number;
  combatFactor: number;
  moraleRating: number;
  lifePoints: number;
};

export type BaseJson = {
  currentPosition: string;
  primary: boolean;
};
export type DumpJson = {
  currentPosition: string;
};
export type SupplyUnitJson = {
  currentPosition: string;
  movementPoints: number;
};
