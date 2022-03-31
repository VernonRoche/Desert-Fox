export default class HexID {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  public id() {
    function zeroIfNeeded(num: number){
        return ((num > 10) ? "0" : "") + num;
    }
    const id = zeroIfNeeded(this._x)  + zeroIfNeeded(this._y);
    return id;
  }

  toString() {
    return this.id();
  }

}
