import P5 from "p5";
import drawHexMap from "./p5Map";

const sketch = (p5: P5) => {
  const width = p5.windowWidth;
  const height = 800;

  p5.setup = () => {
    p5.createCanvas(width, height);
  };

  p5.draw = () => {
    p5.background(220);
    drawHexMap(p5, width - 100, height - 50);
  };

  p5.mouseClicked = (event) => {
    console.log(event);
  };
};

export default sketch;
