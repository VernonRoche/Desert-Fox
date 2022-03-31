import { traceDeprecation } from "process";
import Two from "two.js";
import { Anchor } from "two.js/src/anchor";

const colors = {
  clear: "#ece9c8",
  rough: "#453925",
  empty: "#32adeb",
  sandSea: "#f2efba",
  mountain: "5b4627",
  oasis: "#019267",
  marsh: "#96ceb4",
  city: "#99a799",
};

function drawEverything(two: Two) {
  const r = 50;
  const distHex = Math.cos(Math.PI / 6) * r - -Math.cos(Math.PI / 6) * r;
  const distHex2 = Math.sin(Math.PI / 6) * r - -Math.sin(Math.PI / 6) * r;
  console.log(distHex);
  console.log(distHex2);

  let id = 1;
  let loop = 1;

  for (let y = r; y <= two.height; y += 2 * r + distHex2) {
    for (let x = r / 2; x <= two.width; x += distHex) {
      drawHexagon(x, y, r, colors["clear"], id);
      drawHexID(x, y, id);
      id++;
    }
    id = loop * 200 + 1;
    loop++;
  }

  id = 101;
  loop = 1;

  for (let y = 2 * r + distHex2 / 2; y <= two.height; y += 2 * r + distHex2) {
    for (let x = r / 2 + distHex / 2; x <= two.width; x += distHex) {
      drawHexagon(x, y, r, colors["clear"], id);
      drawHexID(x, y, id);
      id++;
    }
    id = 101 + loop * 200;
    loop++;
  }

  two.update();

  function drawHexagon(
    x: number,
    y: number,
    side: number,
    fill: string,
    id: number,
    options?: {
      strokeColor?: string;
      strokeWidth?: number;
    },
  ) {
    const points: Anchor[] = [];

    points.push(new Two.Anchor(x, y - side, 0, 0, 0, 0, Two.Commands.line));
    points.push(
      new Two.Anchor(
        Math.cos(Math.PI / 6) * side + x,
        -Math.sin(Math.PI / 6) * side + y,
        0,
        0,
        0,
        0,
        Two.Commands.line,
      ),
    );
    points.push(
      new Two.Anchor(
        Math.cos(Math.PI / 6) * side + x,
        Math.sin(Math.PI / 6) * side + y,
        0,
        0,
        0,
        0,
        Two.Commands.line,
      ),
    );
    points.push(new Two.Anchor(x, y + side, 0, 0, 0, 0, Two.Commands.line));
    points.push(
      new Two.Anchor(
        -Math.cos(Math.PI / 6) * side + x,
        Math.sin(Math.PI / 6) * side + y,
        0,
        0,
        0,
        0,
        Two.Commands.line,
      ),
    );
    points.push(
      new Two.Anchor(
        -Math.cos(Math.PI / 6) * side + x,
        -Math.sin(Math.PI / 6) * side + y,
        0,
        0,
        0,
        0,
        Two.Commands.line,
      ),
    );

    const hexagon = two.makePath(points, 0, 1, 0);
    hexagon.id = "shape-" + id;

    hexagon.fill = fill;

    hexagon.stroke = options?.strokeColor ?? "black";
    hexagon.linewidth = options?.strokeWidth ?? 2;

    two.add(hexagon);
  }

  function drawHexID(x: number, y: number, id: number) {
    const text = two.makeText(id.toString(), x, y);
    text._size = 10;
    text.rotation = (7 * Math.PI) / 4;
    text._baseline = "top";
  }
}

export default drawEverything;
