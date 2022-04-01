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

class Unit {
  private _type: string;

  constructor(type: string) {
    this._type = type;
  }

  render(p5: P5, x: number, y: number) {
    drawUnits(p5, x, y);
  }
}

class Hexagon {
  private _p5: P5;
  private _x: number;
  private _y: number;
  private _r: number;
  private _id: number;
  private _strokeColor: string;
  private _strokeWidth: number;
  private _units: Unit[] = [];

  constructor(
    p5: P5,
    x: number,
    y: number,
    r: number,
    id: number,
    options?: { strokeColor?: string; strokeWidth?: number },
  ) {
    this._p5 = p5;
    this._x = x;
    this._y = y;
    this._r = r;
    this._id = id;
    this._strokeColor = options?.strokeColor ?? colors["clear"];
    this._strokeWidth = options?.strokeWidth ?? 2;
  }

  render() {
    drawHexagon(
      this._p5,
      this._x,
      this._y,
      this._r,
      colors["clear"],
      this._id,
      this._strokeColor,
      this._strokeWidth,
    );
    drawHexID(this._p5, this._x, this._y, this._id);
  }

  distanceToMouse() {
    return this._p5.dist(this._p5.mouseX, this._p5.mouseY, this._x, this._y);
  }

  addUnits(units: Unit[]) {
    for (const unit of units) {
      this._units.push(unit);
      unit.render(this._p5, this._x, this._y);
    }
  }
}

export default function drawHexMap(p5: P5, width: number, height: number): Hexagon[] {
  const hexagons: Hexagon[] = [];

  const r = 50;
  const distHex = Math.cos(Math.PI / 6) * r - -Math.cos(Math.PI / 6) * r;
  const distHex2 = Math.sin(Math.PI / 6) * r - -Math.sin(Math.PI / 6) * r;

  let id = 1;
  let loop = 1;

  for (let y = r; y <= height; y += 2 * r + distHex2) {
    for (let x = r; x <= width; x += distHex) {
      //drawHexagon(p5, x, y, r, colors["clear"], id);
      const hex = new Hexagon(p5, x, y, r, id);
      hex.render();
      hexagons.push(hex);
      //drawHexID(p5, x, y, id);
      id++;
    }
    id = loop * 200 + 1;
    loop++;
  }

  id = 101;
  loop = 1;

  for (let y = 2 * r + distHex2 / 2; y <= height; y += 2 * r + distHex2) {
    for (let x = r + distHex / 2; x <= width; x += distHex) {
      //drawHexagon(p5, x, y, r, colors["clear"], id);
      const hex = new Hexagon(p5, x, y, r, id);
      hex.render();
      hexagons.push(hex);
      id++;
    }
    id = 101 + loop * 200;
    loop++;
  }

  /*
  drawUnits(p5, 50, 50);
  const x = 50;
  p5.translate(x,0)
  drawUnits(p5, 50+x, 50);
  */

  const a: Unit[] = [new Unit("bblabla")];
  hexagons[10].addUnits(a);

  return hexagons;
}

function drawHexagon(
  p5: P5,
  x: number,
  y: number,
  side: number,
  fill: string,
  id: number,
  strokeColor: string,
  strokeWidth: number,
) {
  p5.beginShape();
  p5.strokeWeight(strokeWidth);
  p5.stroke("black");
  p5.fill(strokeColor);
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

function drawText(p5: P5, message: string | number, x: number, y: number) {
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
