import Embarkable from "../Embarkable";

export default class RefitPoint implements Embarkable {
  private id: number;

  constructor(id: number) {
    this.id = id;
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
