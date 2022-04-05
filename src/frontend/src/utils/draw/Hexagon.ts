import P5 from "p5";
import colors from "../constants/colors";
import drawText from "./text";
import Unit from "./Units";

export default class Hexagon {
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
    this.drawHexagon();
    this.drawID();
  }

  distanceToMouse() {
    return this._p5.dist(this._p5.mouseX, this._p5.mouseY, this._x, this._y);
  }

  addUnits(units: Unit[]) {
    for (const unit of units) this._units.push(unit);
  }

  removeUnit(unit: Unit) {
    this._units = this._units.filter((item) => item !== unit);
  }

  clearUnits() {
    this._units = [];
  }

  private drawHexagon() {
    this._p5.beginShape();
    this._p5.strokeWeight(this._strokeWidth);
    this._p5.stroke("black");
    this._p5.fill(this._strokeColor);

    this._p5.vertex(this._x, this._y - this._r);
    this._p5.vertex(
      Math.cos(Math.PI / 6) * this._r + this._x,
      -Math.sin(Math.PI / 6) * this._r + this._y,
    );
    this._p5.vertex(
      Math.cos(Math.PI / 6) * this._r + this._x,
      Math.sin(Math.PI / 6) * this._r + this._y,
    );
    this._p5.vertex(this._x, this._y + this._r);
    this._p5.vertex(
      -Math.cos(Math.PI / 6) * this._r + this._x,
      Math.sin(Math.PI / 6) * this._r + this._y,
    );
    this._p5.vertex(
      -Math.cos(Math.PI / 6) * this._r + this._x,
      -Math.sin(Math.PI / 6) * this._r + this._y,
    );

    this._p5.endShape(this._p5.CLOSE);
  }

  private drawID() {
    drawText(this._p5, this._x - 30, this._y, this._id);
  }
}
