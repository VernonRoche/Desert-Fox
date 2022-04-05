import P5 from "p5";
import Hexagon from "./draw/Hexagon";
import drawHexMap from "./draw/hexMap";
import Unit from "./draw/Units";

const sketch = (p5: P5) => {
  const width = p5.windowWidth - 400;
  const height = p5.windowHeight - 100;

  let map: Hexagon[];

  p5.setup = () => {
    p5.createCanvas(width, height);
    p5.background(220);
    map = drawHexMap(p5, width - 100, height);
    const myunit = [new Unit("blabla")];
    map[26].addUnits(myunit);
    map[26].clearUnits();
  };

  // Loop
  /*p5.draw = () => {

  };*/

  p5.mouseClicked = (event) => {
    console.log(event);
  };
};

export default sketch;
