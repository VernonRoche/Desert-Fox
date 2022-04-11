import P5 from "p5";
import { colorsPlayer, colorsUnit } from "../constants/colors";
import handlerHexPoints from "../constants/hexPoints";
import dataMap from "../constants/map";

/* export default class Unit {
  private _type: string;
  private _isDisplay = false;

  constructor(type: string) {
    this._type = type;
  }

  public render(p5: P5, x: number, y: number) {
    if (this._isDisplay === false) {
      this.drawUnit(p5, x, y);
      this._isDisplay = true;
    }
  }

  public setDisplay(status = true) {
    this._isDisplay = status;
  }

  private drawUnit(p5: P5, x: number, y: number) {
    p5.push();
    p5.fill("red");

    const size = dataMap["raduisHexagon"];
    const diff = size / 2;

    p5.rect(x - diff, y - diff, size, size);
    p5.pop();
  }
} */

export default function drawUnit(
  p5: P5,
  x: number,
  y: number,
  index: number,
  owned: boolean,
  type: string,
) {
  p5.push();

  const size = dataMap["raduisHexagon"] / 3;
  const points = handlerHexPoints(x, y, size, index, true);
  p5.stroke(colorsPlayer[String(owned)]);
  p5.fill(colorsUnit[type]);
  p5.circle(points.x, points.y, size);

  p5.pop();
}
