import P5 from "p5";
import { colorsHexagon } from "../constants/colors";
import handlerHexPoints from "../constants/hexPoints";
import drawText from "./text";

export default function drawHexagon(
  p5: P5,
  x: number,
  y: number,
  r: number,
  id: string,
  typeTerrain = "empty",
  strokColor = "black",
  strokeWeight = 2,
) {
  if (typeTerrain === "empty") return;

  p5.stroke(strokColor);
  p5.strokeWeight(strokeWeight);
  p5.fill(colorsHexagon[typeTerrain] ?? "white");
  p5.beginShape();
  //Calculate the six points of the hexagon
  for (let i = 0; i < 6; i++) {
    const hexPoints = handlerHexPoints(x, y, r, i);
    p5.vertex(hexPoints.x, hexPoints.y);
  }
  p5.endShape(p5.CLOSE);

  // ID
  if (typeTerrain === "mountain" || typeTerrain === "rough")
    drawText(p5, x, y, id.toString(), "white");
  else drawText(p5, x, y, id.toString(), "black");
}
