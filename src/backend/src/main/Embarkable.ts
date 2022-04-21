import Entity from "./Entity";

export default interface Embarkable extends Entity {
  isEmbarked(): boolean;

  embark(): void;

  disembark(): void;
}
