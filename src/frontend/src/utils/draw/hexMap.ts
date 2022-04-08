import P5 from "p5";
import dataMap from "../constants/map";
import { GameMap } from "../uiGame";
import drawHexagon from "./hexagon";

export default function drawHexMap(p5: P5, gameMap: GameMap) /*: Hexagon[]*/ {
  const r = dataMap["raduisHexagon"];
  const distHex = Math.cos(Math.PI / 6) * r - -Math.cos(Math.PI / 6) * r;
  const distHex2 = Math.sin(Math.PI / 6) * r - -Math.sin(Math.PI / 6) * r;

  const marginTop = 50;
  const marginLeft = 50;

  for (const g of gameMap) {
    const idString = g.hexId;
    const ligneString = idString.substring(0, 2);
    const colonneString = idString.substring(2, 4);
    const ligne = Number(ligneString) - 1;
    const colonne = Number(colonneString) - 1;
    if (ligne % 2 === 1) {
      const x = r + distHex / 2 + colonne * distHex + marginLeft;
      const y = (r + distHex2 / 2) * (ligne + 1) + marginTop;
      drawHexagon(p5, x, y, r, idString, g.terrain);
    } else {
      const x = r + colonne * distHex + marginLeft;
      const y = r + distHex2 * 2 + (r + distHex2 / 2) * (ligne - 1) + marginTop;
      drawHexagon(p5, x, y, r, idString, g.terrain);
    }
  }
}
