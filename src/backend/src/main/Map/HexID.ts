export default class HexID {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number, private _mapId?: string) {
    this._x = x;
    this._y = y;
  }

  public id() {
    const id = this._x + ":" + this._y;
    if (this._mapId) {
      return this._mapId + ":" + id;
    }
    return id;
  }
}
