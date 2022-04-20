export type Unit = {
  _combatFactor: string;
  _currentPosition: {
    _x: number;
    _y: number;
  };
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
      currentPosition: { _x: number; _y: number };
      movementPoints: number;
      remainingMovementPoints: number;
      owned: boolean;
    },
  ];
  base:
    | {
        id: number;
        curentPosition: { _x: number; _y: number };
        primary: boolean;
        owned: boolean;
      }
    | undefined;
  dumps: [
    {
      id: number;
      currentPosition: { _x: number; _y: number };
      owned: boolean;
    },
  ];
  suppplyUnits: [
    {
      id: number;
      currentPosition: { _x: number; _y: number };
      movementPoints: number;
      owned: boolean;
    },
  ];
}[];