import Embarkable from "../Embarkable";
import HexID from "../Map/HexID";
import AbstractUnit from "./AbstractUnit";

export default class Foot extends AbstractUnit implements Embarkable{
  embark(): void {
    throw new Error("Method not implemented.");
  }
  disembark(): void {
    throw new Error("Method not implemented.");
  }
  
  getType(): string {
    return "foot";
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

  overrun(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }

  hasGeneralSupply(): boolean {
    throw new Error("Method not implemented.");
  }

  attack(hexId: HexID, combatSupply: boolean): void {
    throw new Error("Method not implemented.");
  }
}
