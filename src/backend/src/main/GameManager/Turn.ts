import PlayerID from "./PlayerID";

enum Phase {
  INITIAL,
}

export default class Turn {
  private _currentPhase: Phase;
  private _currentPlayer: PlayerID;

  constructor() {
    this._currentPhase = Phase.INITIAL;
    this._currentPlayer = PlayerID.ONE;
  }
}
