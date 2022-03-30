import Two from "two.js";

function drawEverything(two: Two) {
    console.log(two.width, two.height);
    const polygon = two.makePolygon(two.width / 2, two.height / 2, 50, 6);
    console.log(polygon);
    polygon.fill = "#000";
    polygon.stroke = "#FF0000";
    polygon.linewidth = 2;
    two.update();

}

export default drawEverything;