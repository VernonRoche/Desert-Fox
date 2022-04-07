export default class Dice {
  static rollDice(): number {
    return Math.ceil(Math.random() * 6);
  }
}
