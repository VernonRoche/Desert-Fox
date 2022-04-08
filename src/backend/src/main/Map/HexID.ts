export default class HexID {
  private _x: number;
  private _y: number;

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  public id() {
    function zeroIfNeeded(num: number) {
      return (num < 10 ? "0" : "") + num;
    }

    return zeroIfNeeded(this._y) + zeroIfNeeded(this._x);
  }

  getX() {
    return this._x;
  }

  getY() {
    return this._y;
  }

  toString() {
    return this.id();
  }
}
