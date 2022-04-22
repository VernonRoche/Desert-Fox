export default class Dice {
  /*
   *  A simple function to roll a 1d6 dice.
   */
  static rollDice(): number {
    return Math.ceil(Math.random() * 6);
  }
}
