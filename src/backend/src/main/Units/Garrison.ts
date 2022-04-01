import AbstractUnit from "./AbstractUnit";
import HexID from "../Map/HexID";

export default class Garrison extends AbstractUnit {
  is_movement(): boolean {
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
}
