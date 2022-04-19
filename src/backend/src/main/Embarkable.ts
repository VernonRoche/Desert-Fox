import Entity from "./Entity";

export default interface Embarkable extends Entity {
  embark(): void;

  disembark(): void;
}
