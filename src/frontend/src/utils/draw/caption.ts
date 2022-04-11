import P5 from "p5";
import { colorsHexagon } from "../constants/colors";
import drawText from "./text";

export default function drawCaption(p5: P5){
    let height = p5.height - 30;
    let width = 5;
    let heightRect = 25;
    let widthRect = 30;
    let centreX = 2 * width + widthRect;
    
    for(const [key, color] of Object.entries(colorsHexagon)){
        if(key !== "empty"){
            /* p5.push();
            p5.fill(color);
            p5.rect(width, height, widthRect, heightRect);
            p5.pop();
            drawText(p5, widthRect*2 + 5, height + heightRect/2, key, "black");
            height -= 30; */
            let centreY = height + heightRect / 2;
            p5.push();
            p5.fill(color);
            p5.rect(width, height, widthRect, heightRect);
            p5.pop();
            drawText(p5, centreX , centreY, key, "black", 10, "left");
            height -= 30;
        }
    } 
    
} 