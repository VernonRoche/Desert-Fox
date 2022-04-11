import AbstractUnit from "./Units/AbstractUnit";
import HexID from "./Map/HexID";

export default class UnitProxy extends AbstractUnit {
  getType(): string {
    throw new Error("Method not implemented.");
  }
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

  public nightMove(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }

  public resetMovementPoints(): void {
    throw new Error("Method not implemented.");
  }
}
