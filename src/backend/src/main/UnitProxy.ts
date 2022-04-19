import Unit, { unitJson } from "./Units/Unit";
import HexID from "./Map/HexID";
import Player from "./GameManager/Player";

export default class UnitProxy implements Unit {
  private unit: Unit;

  constructor(unit: Unit) {
    this.unit = unit;
  }

  getType(): string {
    return this.unit.getType();
  }

  refit(): void {
    return this.unit.refit();
  }

  train(): void {
    return this.unit.train();
  }

  reactionMove(hexId: HexID): void {
    return this.unit.reactionMove(hexId);
  }

  moraleCheck(): boolean {
    return this.unit.moraleCheck();
  }

  overrun(hexId: HexID): void {
    return this.unit.overrun(hexId);
  }

  hasAttacked(): boolean {
    return this.unit.hasAttacked();
  }

  removeLifePoints(lifePoints: number): void {
    return this.unit.removeLifePoints(lifePoints);
  }

  getId(): number {
    return this.unit.getId();
  }

  public place(hexId: HexID): void {
    return this.unit.place(hexId);
  }

  public remove(): void {
    return this.unit.remove();
  }

  public possibleMoves(): HexID[] {
    return this.unit.possibleMoves();
  }

  public nightMove(hexId: HexID): void {
    return this.unit.nightMove(hexId);
  }

  public resetMovementPoints(): void {
    return this.unit.resetMovementPoints();
  }

  getCombatFactor(): number {
    return this.unit.getCombatFactor();
  }

  getCurrentPosition(): HexID {
    return this.unit.getCurrentPosition();
  }

  getLifePoints(): number {
    return this.unit.getLifePoints();
  }

  getMoraleRating(): number {
    return this.unit.getMoraleRating();
  }

  getMovementPoints(): number {
    return this.unit.getMovementPoints();
  }

  getRemainingMovementPoints(): number {
    return this.unit.getRemainingMovementPoints();
  }

  move(movementPoints: number): void {
    this.unit.move(movementPoints);
  }

  toJson(player: Player): unitJson {
    return this.unit.toJson(player);
  }
}
