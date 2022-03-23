import AbstractUnit from "./Units/AbstractUnit";
import Embarkable from "./Embarkable";

export default abstract class Foot extends AbstractUnit implements Embarkable {
  embark(): void {
    throw new Error("Method not implemented.");
  }
  disembark(): void {
    throw new Error("Method not implemented.");
  }
}
