import HexID from "./Map/HexID";

export default interface Entity {
  place(hexId: HexID): void;

  remove(): void;

  getID(): number;
}
