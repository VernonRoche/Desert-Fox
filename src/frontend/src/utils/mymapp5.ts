import P5 from "p5";

const sketch = (p5: P5) => {
  const widthWindows = 400;
  const heightWindows = 400;
  const a = (2 * Math.PI) / 6;
  const r = 10;

  p5.setup = () => {
    p5.createCanvas(widthWindows, widthWindows);
  };

  p5.draw = () => {
    p5.background(220);
    for (let y = r; y + r * p5.sin(a) < heightWindows; y += r * p5.sin(a)) {
      for (
        let x = r, j = 0;
        x + r * (1 + p5.cos(a)) < widthWindows;
        x += r * (1 + p5.cos(a)), y += (-1) ** j++ * r * p5.sin(a)
      ) {
        drawHexagon(x, y);
      }
    }
  };

  function drawHexagon(x: number, y: number) {
    p5.beginShape();
    p5.strokeWeight(2);
    p5.fill(194, 178, 128);
    for (let i = 0; i < 6; i++) {
      p5.vertex(x + r * p5.cos(a * i), y + r * p5.sin(a * i));
    }
    p5.endShape(p5.CLOSE);
  }
};

export default sketch;
