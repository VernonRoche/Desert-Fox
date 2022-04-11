import P5 from "p5";

export default function drawText(
  p5: P5,
  x: number,
  y: number,
  message: string | number,
  color = "black",
  size = 10,
  alignment : P5.HORIZ_ALIGN = "center",
) {
  p5.push();
  p5.fill(color);
  p5.stroke("black");
  p5.strokeWeight(0);
  p5.textSize(size);
  p5.textStyle("normal");
  p5.textAlign(alignment);
  p5.text(message, x, y);
  p5.pop();
}
