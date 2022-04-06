import P5 from "p5";
import colors from "../constants/colors";
import drawText from "./text";

export default function drawHexagon(
  p5: P5,
  x: number,
  y: number,
  r: number,
  id: string,
  typeTerrain = "empty",
) {
  if (typeTerrain === "empty") return;

  p5.stroke("black");
  p5.strokeWeight(2);
  p5.fill(colors[typeTerrain]);
  p5.beginShape();
  p5.vertex(x, y - r);
  p5.vertex(Math.cos(Math.PI / 6) * r + x, -Math.sin(Math.PI / 6) * r + y);
  p5.vertex(Math.cos(Math.PI / 6) * r + x, Math.sin(Math.PI / 6) * r + y);
  p5.vertex(x, y + r);
  p5.vertex(-Math.cos(Math.PI / 6) * r + x, Math.sin(Math.PI / 6) * r + y);
  p5.vertex(-Math.cos(Math.PI / 6) * r + x, -Math.sin(Math.PI / 6) * r + y);
  p5.endShape(p5.CLOSE);

  // ID
  if (typeTerrain === "mountain" || typeTerrain === "rough")
    drawText(p5, x - 30, y, id.toString(), "white");
  else drawText(p5, x - 30, y, id.toString(), "black");
}
