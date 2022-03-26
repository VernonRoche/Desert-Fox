import Turn from "./Turn";
import Player from "./Player";

export default class Game {
  private turn: Turn;
  private player1: Player;
  private player2: Player;

  public constructor(player1: Player, player2: Player) {
    this.turn = new Turn();
    this.player1 = player1;
    this.player2 = player2;
  }
}
