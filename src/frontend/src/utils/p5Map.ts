import P5 from "p5";
//declare const p5: P5;

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
/*
class Hexagon {

  private x: number;
  private y: number;
  private r: number;
  private name: string;

  constructor(p5: P5, x: number, y: number, r: number, name: string) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.name = name;
  }
  
  render() {
    p5.noFill();
    p5.stroke(0);
    //drawHexagon(p5, this.x, this.y, this.r);
    p5.text(this.name, this.x, this.y);
  }
  
  get distanceToMouse() {
    return p5.dist(p5.mouseX, p5.mouseY, this.x, this.y);
  }
}
*/
export default function drawHexMap(p5: P5, width: number, height: number) {
  const r = 50;
  const distHex = Math.cos(Math.PI / 6) * r - -Math.cos(Math.PI / 6) * r;
  const distHex2 = Math.sin(Math.PI / 6) * r - -Math.sin(Math.PI / 6) * r;

  let id = 1;
  let loop = 1;

  for (let y = r; y <= height; y += 2 * r + distHex2) {
    for (let x = r; x <= width; x += distHex) {
      drawHexagon(p5, x, y, r, colors["clear"], id);
      drawHexID(p5, x, y, id);
      id++;
    }
    id = loop * 200 + 1;
    loop++;
  }

  id = 101;
  loop = 1;

  for (let y = 2 * r + distHex2 / 2; y <= height; y += 2 * r + distHex2) {
    for (let x = r + distHex / 2; x <= width; x += distHex) {
      drawHexagon(p5, x, y, r, colors["clear"], id);
      drawHexID(p5, x, y, id);
      id++;
    }
    id = 101 + loop * 200;
    loop++;
  }

  drawUnits(p5, 50, 50);
}

function drawHexagon(
  p5: P5,
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
  p5.beginShape();
  p5.strokeWeight(2);
  p5.stroke("black");
  p5.fill("#ece9c8");
  p5.vertex(x, y - side);
  p5.vertex(Math.cos(Math.PI / 6) * side + x, -Math.sin(Math.PI / 6) * side + y);
  p5.vertex(Math.cos(Math.PI / 6) * side + x, Math.sin(Math.PI / 6) * side + y);
  p5.vertex(x, y + side);
  p5.vertex(-Math.cos(Math.PI / 6) * side + x, Math.sin(Math.PI / 6) * side + y);
  p5.vertex(-Math.cos(Math.PI / 6) * side + x, -Math.sin(Math.PI / 6) * side + y);
  p5.describeElement(`Case #${id}`, `case events : #${id}`);
  p5.endShape(p5.CLOSE);
}

function drawHexID(p5: P5, x: number, y: number, id: number) {
  drawText(p5, id, x, y);
}

function drawText(p5: P5, message: string | number, x: number, y: number): any {
  p5.push();
  p5.fill("black");
  p5.stroke("black");
  p5.strokeWeight(0);
  p5.textSize(12);
  p5.textStyle("normal");
  p5.text(message, x - 30, y);
  p5.pop();
}

function drawUnits(p5: P5, x: number, y: number) {
  p5.push();
  p5.fill("red");

  const size = 50;
  const diff = size / 2;

  p5.rect(x - diff, y - diff, size, size);
  p5.pop();
}
