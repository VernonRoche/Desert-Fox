import P5 from "p5";
import { colorsHexagon } from "../constants/colors";
import drawText from "./text";

export default function drawCaption(p5: P5) {
  let height = p5.height - 30;
  const width = 5;
  const heightRect = 25;
  const widthRect = 30;
  const centreX = 2 * width + widthRect;

  for (const [key, color] of Object.entries(colorsHexagon)) {
    if (key !== "empty") {
      /* p5.push();
            p5.fill(color);
            p5.rect(width, height, widthRect, heightRect);
            p5.pop();
            drawText(p5, widthRect*2 + 5, height + heightRect/2, key, "black");
            height -= 30; */
      const centreY = height + heightRect / 2;
      p5.push();
      p5.fill(color);
      p5.rect(width, height, widthRect, heightRect);
      p5.pop();
      drawText(p5, centreX, centreY, key, "black", 10, "left");
      height -= 30;
    }
  }
}
