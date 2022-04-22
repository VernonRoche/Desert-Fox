// This class is used to identify each individual hexagon on the map.
// It also represents it's coordinates on the map.
// It is represented in YX format.
export default class HexID {
  private _x: number;
  private _y: number;

  constructor(y: number, x: number) {
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
