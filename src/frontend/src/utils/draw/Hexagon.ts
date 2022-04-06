import P5 from "p5";
import colors from "../constants/colors";
import drawText from "./text";
import Unit from "./Units";

export default function drawHexagon(
  p5: P5,
  x: number,
  y: number,
  r: number,
  id: number,
  options?: { strokeColor?: string; strokeWidth?: number },
) {
  const strokeColor = options?.strokeColor ?? "clear";
  const strokeWidth = options?.strokeWidth ?? 2;

  p5.stroke("black");
  p5.strokeWeight(strokeWidth);
  p5.fill(strokeColor);
  p5.beginShape();
  p5.vertex(x, y - r);
  p5.vertex(Math.cos(Math.PI / 6) * r + x, -Math.sin(Math.PI / 6) * r + y);
  p5.vertex(Math.cos(Math.PI / 6) * r + x, Math.sin(Math.PI / 6) * r + y);
  p5.vertex(x, y + r);
  p5.vertex(-Math.cos(Math.PI / 6) * r + x, Math.sin(Math.PI / 6) * r + y);
  p5.vertex(-Math.cos(Math.PI / 6) * r + x, -Math.sin(Math.PI / 6) * r + y);
  p5.endShape(p5.CLOSE);

  drawText(p5, x, y, id.toString());
}

function drawID(p5: P5, x: number, y: number, id: number) {
  drawText(p5, x - 30, y, id);
}
