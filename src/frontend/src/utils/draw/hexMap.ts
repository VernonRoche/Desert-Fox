import P5 from "p5";
import dataMap from "../constants/map";
import { GameMap } from "../uiGame";
import drawHexagon from "./hexagon";
import drawUnit from "./Units";

export default function drawHexMap(p5: P5, gameMap: GameMap) /*: Hexagon[]*/ {
  let x, y;
  const r = dataMap["raduisHexagon"];
  const distHex = Math.cos(Math.PI / 6) * r - -Math.cos(Math.PI / 6) * r;
  const distHex2 = Math.sin(Math.PI / 6) * r - -Math.sin(Math.PI / 6) * r;

  const marginTop = 50;
  const marginLeft = 50;

  for (const g of gameMap) {
    const idString = g.hexId;
    const lineString = idString.substring(0, 2);
    const columnString = idString.substring(2, 4);
    const line = Number(lineString) - 1;
    const column = Number(columnString) - 1;

    //Hexagons
    {
      if (line % 2 === 1) {
        x = xPositionOddLine(column);
        y = yPositionOddLine(line);
        drawHexagon(p5, x, y, r, idString, g.terrain);
      } else {
        x = xPositionEvenLine(column);
        y = yPositionEvenLine(line);
        drawHexagon(p5, x, y, r, idString, g.terrain);
      }
    }
    //Units
    {
      const units = g.units;
      for (const u of units) {
        drawUnit(p5, x, y, u.id, u.owned, u.type);
      }
    }
  }

  function xPositionOddLine(_column: number) {
    return r + distHex / 2 + _column * distHex + marginLeft;
  }

  function yPositionOddLine(_line: number) {
    return (r + distHex2 / 2) * (_line + 1) + marginTop;
  }

  function xPositionEvenLine(_column: number) {
    return r + _column * distHex + marginLeft;
  }

  function yPositionEvenLine(_line: number) {
    return r + distHex2 * 2 + (r + distHex2 / 2) * (_line - 1) + marginTop;
  }
}
