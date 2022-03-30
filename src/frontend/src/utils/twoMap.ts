import Two from "two.js";
import { Polygon } from "two.js/src/shapes/polygon";
const a = (2 * Math.PI) / 6;

function drawEverything(two: Two) {
  const r = 50;

  for (let y = r; y + r * Math.sin(a) < two.height; y += r * Math.sin(a)) {
    for (
      let x = r, j = 0;
      x + r * (1 + Math.cos(a)) < two.width;
      x += r * (1 + Math.cos(a)), y += (-1) ** j++ * r * Math.sin(a)
    ) {
      let polygon = drawHexagon(x, y, 50, "#FF0000");
    }
  }

  //const polygon = drawHexagon(two.width/2 , two.height / 2, 50, "#FF0000");
  two.update();

  function drawHexagon(
    x: number,
    y: number,
    side: number,
    fill: string,
    options?: {
      strokeColor?: string;
      strokeWidth?: number;
    },
  ) {
    let points: number[] = [];
    for (let i = 0; i < 6; i++) {
      let px = x + side * Math.cos(a * i);
      let py = y + side * Math.sin(a * i);
      points.push(px, py);
    }

    let hexagon = two.makePath(
      [
        new Two.Anchor(points[0], points[1], 0, 0, 0, 0, Two.Commands.line),
        new Two.Anchor(points[2], points[3], 0, 0, 0, 0, Two.Commands.line),
        new Two.Anchor(points[4], points[5], 0, 0, 0, 0, Two.Commands.line),
        new Two.Anchor(points[6], points[7], 0, 0, 0, 0, Two.Commands.line),
        new Two.Anchor(points[8], points[9], 0, 0, 0, 0, Two.Commands.line),
        new Two.Anchor(points[10], points[11], 0, 0, 0, 0, Two.Commands.line),
      ],
      0,
      1,
      0,
    );

    hexagon.fill = fill;

    hexagon.stroke = options?.strokeColor ?? "black";
    hexagon.linewidth = options?.strokeWidth ?? 2;

    two.add(hexagon);
  }
}

export default drawEverything;
