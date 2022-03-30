import PlayerID from "./PlayerID";

enum Phase {
  INITIAL,

  //Strategic impulse
  Event,
  Air_Superiority,
  Reiforcements,
  Allocation,
  Initiative,
  
  //first player initial impulse
  First_Player_Movement,
  Second_Player_Reaction,
  First_Player_Combat,
  
  //second player initial impulse
  Second_Player_Movement,
  First_Player_Reaction,
  Second_Player_Combat,

  //first player follow-on impulse

  First_Player_Movement2,
  Second_Player_Reaction2,
  First_Player_Combat2,

  //second player follow-on impulse

  Second_Player_Movement2,
  First_Player_Reaction2,
  Second_Player_Combat2,
  
  //Administative impulse

  Supply_Attrition,
  Victory_Check,
  Turn_Marker,
  NONE,

}

export default class Turn {
  private _currentPhase: Phase;
  private _currentPlayer: PlayerID;



  constructor() {
    this._currentPhase = Phase.INITIAL;
    this._currentPlayer = PlayerID.ONE;
  }


  get currentPhase(): Phase {
    return this._currentPhase;
  }

  get getcurrentPlayer(): PlayerID {
    return this._currentPlayer;
  }

public  switchPlayer():void{
  this._currentPlayer = (this._currentPlayer%2) +1 ;
  if (this._currentPlayer == 2){
    this._currentPhase = 1;
  }
}

public changePhase():void{
  this._currentPhase = this._currentPhase + 1;
  if (this.currentPhase == 21){
    this._currentPhase = 1;
  }
}



}
