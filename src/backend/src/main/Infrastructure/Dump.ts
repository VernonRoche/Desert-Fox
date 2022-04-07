import Embarkable from "../Embarkable";

export default class Dump implements Embarkable {
  embark(): void {
    throw new Error("Method not implemented.");
  }

  disembark(): void {
    throw new Error("Method not implemented.");
  }
}
