import P5 from "p5";
import { colorsDump, colorsPlayer, colorsUnit } from "../constants/colors";
import handlerHexPoints from "../constants/hexPoints";
import dataMap from "../constants/map";
import drawText from "./text";

export function drawUnit(
  p5: P5,
  x: number,
  y: number,
  index: number,

  owned: boolean,
  type: string,
  id: number,
) {
  p5.push();

  const size = dataMap["raduisHexagon"] / 3.25;
  const points = handlerHexPoints(x, y, size, index, true);
  p5.strokeWeight(2);
  p5.stroke(colorsPlayer[String(owned)]);
  p5.fill(colorsUnit[type] ?? "white");
  p5.circle(points.x, points.y, size);
  p5.pop();
  drawText(p5, points.x, points.y + 3, id, "white");
}

export function drawDump(p5: P5, x: number, y: number, owned: boolean) {
  const _x = x - dataMap["textSize"] * 2;
  const _y = y - dataMap["textSize"] * 1.5;
  p5.push();
  p5.strokeWeight(2);
  p5.stroke(colorsPlayer[String(owned)]);
  p5.fill(colorsDump[0], colorsDump[1], colorsDump[2], 127);
  p5.rect(_x, _y, dataMap["textSize"] * 4, dataMap["textSize"] * 2);
}
