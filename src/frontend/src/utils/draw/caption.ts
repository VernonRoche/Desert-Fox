import P5 from "p5";
import {
  colorsDump,
  colorsHexagon,
  colorsPlayer,
  colorsSupplyUnit,
  colorsUnit,
} from "../constants/colors";
import drawHexagon from "./hexagon";
import drawText from "./text";

export default function drawCaption(p5: P5) {
  let height = p5.height - 30;
  const width = 5;
  const heightRect = 25;
  const widthRect = 30;
  const centreX = 2 * width + widthRect;
  let centreY;
  const spaceBetween = 30;

  //Terrain
  for (const [key, color] of Object.entries(colorsHexagon)) {
    if (key !== "empty") {
      centreY = height + heightRect / 2;
      p5.push();
      p5.fill(color);
      p5.rect(width, height, widthRect, heightRect);
      p5.pop();
      drawText(p5, centreX, centreY, key, "black", "left");
      height -= spaceBetween;
    }
  }

  //Unit
  for (const [key, color] of Object.entries(colorsUnit)) {
    const xCirlce = width + widthRect / 2;
    const yCircle = height + heightRect / 2;
    centreY = height + heightRect / 2;
    p5.push();
    p5.fill(color);
    p5.circle(xCirlce, yCircle, heightRect);
    p5.pop();
    drawText(p5, centreX, centreY, key, "black", "left");
    height -= spaceBetween;
  }

  //Dump
  centreY = height + heightRect / 2;
  p5.push();
  p5.fill(colorsDump[0], colorsDump[1], colorsDump[2], colorsDump[3]);
  p5.rect(width, height, widthRect, heightRect);
  p5.pop();
  drawText(p5, centreX, centreY, "dump", "black", "left");
  height -= spaceBetween;

  //Supply
  centreY = height + heightRect / 2;
  p5.push();
  p5.fill(colorsSupplyUnit);
  p5.rect(width, height, widthRect, heightRect);
  p5.pop();
  drawText(p5, centreX, centreY, "supply unit", "black", "left");
  height -= spaceBetween;

  //Base
  let xHexagon = width * 5;
  drawHexagon(p5, xHexagon, height, heightRect, "", "clear", colorsPlayer["true"], 4);
  xHexagon += heightRect + width;
  drawText(p5, xHexagon, height, "base", "black", "left");
}
