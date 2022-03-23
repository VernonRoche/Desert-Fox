import HexID from "./HexID";

export default interface Entity {
  place(hexId: HexID): void;
  remove(): void;
}
