import P5 from "p5";
import Hexagon from "./Hexagon";
import dataMap from "../constants/map";
import { GameMap } from "../uiGame";
import drawHexagon from "./Hexagon";

export default function drawHexMap(
  p5: P5,
  width: number,
  height: number,
  gameMap: GameMap,
) /*: Hexagon[]*/ {
  const r = dataMap["raduisHexagon"];
  const distHex = Math.cos(Math.PI / 6) * r - -Math.cos(Math.PI / 6) * r;
  const distHex2 = Math.sin(Math.PI / 6) * r - -Math.sin(Math.PI / 6) * r;

  const id = 1;
  const loop = 1;
  for (const g of gameMap) {
    const idString = g.hexId;
    //console.log(idString);
    const ligneString = idString.substring(0, 2);
    const colonneString = idString.substring(2, 4);
    console.log(ligneString);
    const ligne = Number(ligneString);
    const colonne = Number(colonneString);
    if (ligne % 2 === 1) {
      const x = r + distHex / 2 + colonne * distHex;
      const y = r + (2 * r + distHex2 * ligne);
      drawHexagon(p5, x, y, r, Number(idString));
    }
  }

  /* for (let y = r; y <= height; y += 2 * r + distHex2) {
    for (let x = r; x <= width; x += distHex) {
      drawHexagon(p5, x, y, r, id);
      id++;
    }
    id = loop * 200 + 1;
    loop++;
  }

  id = 101;
  loop = 1;

  for (let y = 2 * r + distHex2 / 2; y <= height; y += 2 * r + distHex2) {
    for (let x = r + distHex / 2; x <= width; x += distHex) {
      drawHexagon(p5, x, y, r, id);
      id++;
    }
    id = 101 + loop * 200;
    loop++;
  } */
}
