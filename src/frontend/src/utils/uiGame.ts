import P5 from "p5";
import drawHexMap from "./draw/hexMap";

export type GameMap = { hexId: string; terrain: string }[];

const sketch = (p5: P5, gameMap: GameMap) => {
  const width = p5.windowWidth * 1.2;
  const height = p5.windowHeight * 1.9;

  //let map: Hexagon[];

  p5.setup = () => {
    p5.createCanvas(width, height);
    p5.background(220);
    drawHexMap(p5, gameMap);
  };

  // Loop
  /*p5.draw = () => {

  };*/

  /*p5.mouseClicked = (event) => {
    console.log(event);
  };*/
};

export default sketch;
