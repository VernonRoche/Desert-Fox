import P5 from "p5";
import drawHexMap from "./draw/hexMap";
import dataMap from "./constants/map";
import { colorsSea } from "./constants/colors";
import { GameMap } from "./constants/types";

const getSizeCanvas = (map: GameMap): number[] => {
  let maxWidth = 0;
  let maxHeight = 0;

  for (const hexagon of map) {
    const id = hexagon.hexId;
    const y = Number(id.substring(0, 2));
    const x = Number(id.substring(2, 4));

    maxWidth = maxWidth < x ? x : maxWidth;
    maxHeight = maxHeight < y ? y : maxHeight;
  }

  //Margin
  const marginWidth = -100;
  const marginHeight = -400;
  const diameterHex = dataMap.raduisHexagon * 2;
  maxWidth = maxWidth * diameterHex + marginWidth;
  maxHeight = maxHeight * diameterHex + marginHeight;

  return [maxWidth, maxHeight];
};

const sketch = (p5: P5, gameMap: GameMap) => {
  const [width, height] = getSizeCanvas(gameMap);

  p5.setup = () => {
    p5.createCanvas(width, height);
    p5.background(colorsSea);
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
