import P5 from "p5";
import {
  colorsDump,
  colorsPlayer,
  colorsSupplyUnit,
  colorsUnit,
  colorsUnitEmbarked,
} from "../constants/colors";
import handlerHexPoints, {
  pointCosNeg,
  pointCosPos,
  pointSinNeg,
  pointSinPos,
} from "../constants/hexPoints";
import dataMap from "../constants/map";
import drawText from "./text";

const strokeWeight = 2;
const size = dataMap["raduisHexagon"] / 3.25;

export function drawUnit(
  p5: P5,
  x: number,
  y: number,
  index: number,
  owned: boolean,
  type: string,
  id: number,
  disrupted: boolean,
) {
  const points = handlerHexPoints(x, y, size, index, true);

  p5.push();
  p5.strokeWeight(strokeWeight);
  p5.stroke(colorsPlayer[String(owned)]);
  p5.fill(colorsUnit[type] ?? "white");
  p5.circle(points.x, points.y, size);
  p5.pop();

  //If the unit is disrupted, draw a red line on the unit
  if (disrupted) {
    console.log("ici");
    const s = size / 2;
    const x1 = pointCosPos(points.x, s);
    const y1 = pointSinNeg(points.y, s);
    const x2 = pointCosNeg(points.x, s);
    const y2 = pointSinPos(points.y, s);

    p5.push();
    p5.stroke("red");
    p5.line(x1, y1, x2, y2);
    p5.pop();
  }

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

const margin = 5;

export function drawSupplyUnit(p5: P5, x: number, y: number, owned: boolean) {
  const _x = x - size / 2;
  const _y = y + margin;

  p5.push();
  p5.strokeWeight(strokeWeight);
  p5.stroke(colorsPlayer[String(owned)]);
  p5.fill(colorsSupplyUnit);
  p5.square(_x, _y, size);
  p5.pop();
}

export function drawUnitEmbarked(p5: P5, x: number, y: number) {
  const _y = y + margin * 2 + strokeWeight / 2;

  p5.push();
  p5.strokeWeight(1);
  p5.fill(colorsUnitEmbarked[0], colorsUnitEmbarked[1], colorsUnitEmbarked[2]);
  p5.circle(x, _y, size * 0.5);
  p5.pop();
}
