import PlayerID from "./PlayerID";

enum Phase {
  //Strategic impulse
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

export class Turn {
  private _currentPhase: Phase;
  private _currentPlayer: PlayerID;

  constructor() {
    this._currentPhase = Phase.AIR_SUPERIORITY;
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
    if (this._currentPlayer == PlayerID.TWO) {
      this._currentPhase = 1;
    }
  }

  public nextPhase(): void {
    if (this.getCurrentPhase() == Phase.AIR_SUPERIORITY) {
      this._currentPhase = Phase.FIRST_PLAYER_MOVEMENT;
    }
  }

  public changePhase(): void {
    this._currentPhase = this._currentPhase + 1;
    if (this.getCurrentPhase() == 19) {
      this._currentPhase = 1;
    }
  }
}

export default Phase;
