import P5 from "p5";
import { colorsPlayer, colorsUnit } from "../constants/colors";
import handlerHexPoints from "../constants/hexPoints";
import dataMap from "../constants/map";
import drawText from "./text";

export default function drawUnit(
  p5: P5,
  x: number,
  y: number,
  index: number,
  owned: boolean,
  type: string,
  id: number,
) {
  p5.push();

  const size = dataMap["raduisHexagon"] / 2.5;
  const points = handlerHexPoints(x, y, size, index, true);
  p5.stroke(colorsPlayer[String(owned)]);
  p5.fill(colorsUnit[type] ?? "white");
  p5.circle(points.x, points.y, size);
  p5.pop();
  drawText(p5, points.x, points.y + 3, id, "white");
}
