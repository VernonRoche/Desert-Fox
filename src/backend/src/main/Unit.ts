import HexID from "./HexID";

interface Unit {
  nightMove(hexId: HexID): void;
  move(hexId: HexID): void;
  attack(hexId: HexID): void;
  possibleMoves(): HexID[];
  refit(): void;
  train(): void;
  getId(): number;
}

export default Unit;
