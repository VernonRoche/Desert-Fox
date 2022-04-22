import P5 from "p5";
import dataMap from "../constants/map";
import drawHexagon from "./hexagon";
import drawCaption from "./caption";
import { drawDump, drawSupplyUnit, drawUnit, drawUnitEmbarked } from "./units";
import { GameMap } from "../constants/types";
import { colorsPlayer } from "../constants/colors";

/**
 * Iterate on the map and display each element
 * @param p5 library of drawing
 * @param gameMap map to display
 */
export default function drawHexMap(p5: P5, gameMap: GameMap) {
  let x, y;
  const r = dataMap["raduisHexagon"];
  //Horizontal distance between two hexagons
  const distHex = Math.cos(Math.PI / 6) * r - -Math.cos(Math.PI / 6) * r;
  //Vertical distance between two hexagons
  const distHex2 = Math.sin(Math.PI / 6) * r - -Math.sin(Math.PI / 6) * r;

  const marginTop = 50;
  const marginLeft = 50;

  const strokeWeightBase = 5;
  const reduceRadiusBase = r / 10;

  for (const g of gameMap) {
    const idString = g.hexId;
    const lineString = idString.substring(0, 2);
    const columnString = idString.substring(2, 4);
    const line = Number(lineString) - 1;
    const column = Number(columnString) - 1;

    //Hexagons
    {
      const base = g.base;
      if (line % 2 === 1) {
        x = xPositionOddLine(column);
        y = yPositionOddLine(line);
      } else {
        x = xPositionEvenLine(column);
        y = yPositionEvenLine(line);
      }
      //Bases
      //If there is a base on a case we draw the outline of the hexagon in another color
      base !== undefined
        ? drawHexagon(
            p5,
            x,
            y,
            r - reduceRadiusBase,
            idString,
            g.terrain,
            colorsPlayer[String(base.owned)],
            strokeWeightBase,
          )
        : drawHexagon(p5, x, y, r, idString, g.terrain);
    }

    //SuplyUnit
    {
      const suppplyUnits = g.supplyUnits;
      for (const s of suppplyUnits) {
        drawSupplyUnit(p5, x, y, s.owned);
      }
    }

    //Units
    {
      const units = g.units;
      let i = 0;
      for (const u of units) {
        //If the unit is embarked we draw the unit on the SupplyUnit
        if (u.embarked === true) drawUnitEmbarked(p5, x, y);
        else drawUnit(p5, x, y, i, u.owned, u.type, u.id, u.disrupted);
        i++;
      }
    }

    //Dumps
    {
      const dumps = g.dumps;
      for (const d of dumps) {
        drawDump(p5, x, y, d.owned);
      }
    }
  }

  drawCaption(p5);

  /**
   * @returns x position of the hexagon on the canvas when the line is odd
   */
  function xPositionOddLine(_column: number) {
    return r + distHex / 2 + _column * distHex + marginLeft;
  }

  /**
   * @returns y position of the hexagon on the canvas when the line is odd
   */
  function yPositionOddLine(_line: number) {
    return (r + distHex2 / 2) * (_line + 1) + marginTop;
  }

  /**
   * @returns x position of the hexagon on the canvas when the line is even
   */
  function xPositionEvenLine(_column: number) {
    return r + _column * distHex + marginLeft;
  }

  /**
   * @returns x position of the hexagon on the canvas when the line is even
   */
  function yPositionEvenLine(_line: number) {
    return r + distHex2 * 2 + (r + distHex2 / 2) * (_line - 1) + marginTop;
  }
}
