import P5 from "p5";
import Hexagon from "./Hexagon";
import dataMap from "../constants/map";

export default function drawHexMap(p5: P5, width: number, height: number): Hexagon[] {
  const hexagons: Hexagon[] = [];

  const r = dataMap["raduisHexagon"];
  const distHex = Math.cos(Math.PI / 6) * r - -Math.cos(Math.PI / 6) * r;
  const distHex2 = Math.sin(Math.PI / 6) * r - -Math.sin(Math.PI / 6) * r;

  let id = 1;
  let loop = 1;

  for (let y = r; y <= height; y += 2 * r + distHex2) {
    for (let x = r; x <= width; x += distHex) {
      const hex = new Hexagon(p5, x, y, r, id);
      hex.render();
      hexagons.push(hex);
      id++;
    }
    id = loop * 200 + 1;
    loop++;
  }

  id = 101;
  loop = 1;

  for (let y = 2 * r + distHex2 / 2; y <= height; y += 2 * r + distHex2) {
    for (let x = r + distHex / 2; x <= width; x += distHex) {
      const hex = new Hexagon(p5, x, y, r, id);
      hex.render();
      hexagons.push(hex);
      id++;
    }
    id = 101 + loop * 200;
    loop++;
  }

  return hexagons;
}
