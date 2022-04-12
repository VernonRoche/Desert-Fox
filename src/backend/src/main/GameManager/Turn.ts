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
