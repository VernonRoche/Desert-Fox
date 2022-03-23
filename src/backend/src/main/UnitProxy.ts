import HexID from "./HexID";
import Unit from "./Unit";

export default class UnitProxy implements Unit {
  refit(): void {
    throw new Error("Method not implemented.");
  }
  train(): void {
    throw new Error("Method not implemented.");
  }
  reactionMove(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }
  moraleCheck(): boolean {
    throw new Error("Method not implemented.");
  }
  overrun(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }
  hasGeneralSupply(): boolean {
    throw new Error("Method not implemented.");
  }
  attack(hexId: HexID, combatSupply: boolean): void {
    throw new Error("Method not implemented.");
  }
  getId(): number {
    throw new Error("Method not implemented.");
  }
  public place(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }
  public remove(): void {
    throw new Error("Method not implemented.");
  }
  public possibleMoves(): HexID[] {
    throw new Error("Method not implemented.");
  }
  public move(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }
  public nightMove(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }
  public resetMovementPoints(): void {
    throw new Error("Method not implemented.");
  }
}
