import Embarkable from "../Embarkable";
import HexID from "../Map/HexID";

export default class RefitPoint implements Embarkable {
  private id: number;

  constructor(id: number) {
    this.id = id;
  }
  place(hexId: HexID): void {
    throw new Error("Method not implemented.");
  }
  remove(): void {
    throw new Error("Method not implemented.");
  }
  getType(): string {
    throw new Error("Method not implemented.");
  }
  getCurrentPosition(): HexID {
    throw new Error("Method not implemented.");
  }

  embark(): void {
    throw new Error("Method not implemented.");
  }

  disembark(): void {
    throw new Error("Method not implemented.");
  }

  getId(): number {
    return this.id;
  }
}
