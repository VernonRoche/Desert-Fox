type Position = {
  _x: number;
  _y: number;
};

export type Unit = {
  _combatFactor: string;
  _currentPosition: Position;
  _id: string;
  _lifePoints: string;
  _moraleRating: string;
  _movementPoints: string;
  _remainingMovementPoints: string;
};

export type GameMap = {
  hexId: string;
  terrain: string;
  units: [
    {
      type: string;
      id: number;
      currentPosition: Position;
      movementPoints: number;
      remainingMovementPoints: number;
      owned: boolean;
      embarked: boolean | undefined;
    },
  ];
  base:
    | {
        id: number;
        curentPosition: Position;
        primary: boolean;
        owned: boolean;
      }
    | undefined;
  dumps: [
    {
      id: number;
      currentPosition: Position;
      owned: boolean;
    },
  ];
  supplyUnits: [
    {
      id: number;
      currentPosition: Position;
      movementPoints: number;
      owned: boolean;
    },
  ];
}[];

export type Base = {
  _currentPosition: Position;
  _primary: boolean;
};

export type Dump = {
  _id: number;
  _currentPosition: Position;
};
export type SupplyUnit = {
  _currentPosition: Position;
  _movementPoints: number;
  _id: number;
};
