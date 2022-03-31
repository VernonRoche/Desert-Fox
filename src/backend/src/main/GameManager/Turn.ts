import PlayerID from "./PlayerID";

enum Phase {
  INITIAL,

  //Strategic impulse
  EVENT,
  AIR_SUPERIORITY,
  REIFORCEMENTS,
  ALLOCATION,
  INITIATIVE,

  //first player initial impulse
  FIRST_PLAYER_MOVEMENT,
  SECOND_PLAYER_REACTION,
  FIRST_PLAYER_COMBAT,

  //second player initial impulse
  SECOND_PLAYER_MOVEMENT,
  FIRST_PLAYER_REACTION,
  SECOND_PLAYER_COMBAT,

  //first player follow-on impulse

  FIRST_PLAYER_MOVEMENT2,
  SECOND_PLAYER_REACTION2,
  FIRST_PLAYER_COMBAT2,

  //second player follow-on impulse

  SECOND_PLAYER_MOVEMENT2,
  FIRST_PLAYER_REACTION2,
  SECOND_PLAYER_COMBAT2,

  //Administative impulse

  SUPPLY_ATTRITION,
  VICTORY_CHECK,
  TURN_MARKER,
  NONE,
}

export default class Turn {
  private _currentPhase: Phase;
  private _currentPlayer: PlayerID;

  constructor() {
    this._currentPhase = Phase.INITIAL;
    this._currentPlayer = PlayerID.ONE;
  }

  getCurrentPhase(): Phase {
    return this._currentPhase;
  }

  getCurrentPlayer(): PlayerID {
    return this._currentPlayer;
  }

  switchPlayer(): void {
    this._currentPlayer = (this._currentPlayer % 2) + 1;
    if (this._currentPlayer == 2) {
      this._currentPhase = 1;
    }
  }

  public changePhase(): void {
    this._currentPhase = this._currentPhase + 1;
    if (this.getCurrentPhase() == 21) {
      this._currentPhase = 1;
    }
  }
}
