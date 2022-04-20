import P5 from "p5";
import { colorsDump, colorsPlayer, colorsSupplyUnit, colorsUnit } from "../constants/colors";
import handlerHexPoints from "../constants/hexPoints";
import dataMap from "../constants/map";
import drawText from "./text";

const strokeWeight = 2;

export function drawUnit(
  p5: P5,
  x: number,
  y: number,
  index: number,
  owned: boolean,
  type: string,
  id: number,
) {
  const size = dataMap["raduisHexagon"] / 3.25;
  const points = handlerHexPoints(x, y, size, index, true);

  p5.push();
  p5.strokeWeight(strokeWeight);
  p5.stroke(colorsPlayer[String(owned)]);
  p5.fill(colorsUnit[type] ?? "white");
  p5.circle(points.x, points.y, size);
  p5.pop();
  drawText(p5, points.x, points.y + 3, id, "white");
}

export function drawDump(p5: P5, x: number, y: number, owned: boolean) {
  const textSize = dataMap["textSize"];
  const _x = x - textSize - strokeWeight - 2;
  const _y = y - textSize * 1.5;

  p5.push();
  p5.strokeWeight(strokeWeight);
  p5.stroke(colorsPlayer[String(owned)]);
  p5.fill(colorsDump[0], colorsDump[1], colorsDump[2], colorsDump[3]);
  p5.rect(_x, _y, textSize * 3, textSize * 2);
}

export function drawSupplyUnit(p5: P5, x: number, y: number, owned: boolean) {
  const size = dataMap["raduisHexagon"] / 3.25;
  const margin = 5;
  const _x = x - size / 2;
  const _y = y + margin;

  p5.push();
  p5.strokeWeight(strokeWeight);
  p5.stroke(colorsPlayer[String(owned)]);
  p5.fill(colorsSupplyUnit);
  p5.square(_x, _y, size);
  p5.pop();
}
