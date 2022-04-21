const cosPI6 = Math.cos(Math.PI / 6);
const sinPI6 = Math.sin(Math.PI / 6);

/**
 *
 * @param x center of the hexagon
 * @param y center of the hexagon
 * @param r radius of the hexagon
 * @param index hexagon corner number
 * @param unit if unit == true then we calculate the center between the corner of the hexagon and his center
 * @returns coordonates points of the corner of the hexagon or the center of unit if unit == true
 */

export default function handlerHexPoints(
  x: number,
  y: number,
  r: number,
  index: number,
  unit?: boolean,
): { x: number; y: number } {
  const hexPoints = hexPointsFromIndex(x, y, r, index);

  if (unit !== true) {
    return hexPoints;
  }

  /* return the center between the two points */
  const center = { x: (hexPoints.x + x) / 2, y: (hexPoints.y + y) / 2 };
  const diff = r;

  const functions = [
    () => {
      return { x: center.x, y: y - 2 * diff };
    },
    () => {
      return { x: center.x + diff, y: y - diff };
    },
    () => {
      return { x: center.x + diff, y: y + diff };
    },
    () => {
      return { x: center.x, y: y + 2 * diff };
    },
    () => {
      return { x: center.x - diff, y: y + diff };
    },
    () => {
      return { x: center.x - diff, y: y - diff };
    },
  ];

  return functions[index]();
}

/**
 *
 * @param x center of the hexagon
 * @param r radius of the hexagon
 * @returns positive x point trigonometry
 */
export function pointCosPos(x: number, r: number) {
  return cosPI6 * r + x;
}

/**
 *
 * @param y center of the hexagon
 * @param r radius of the hexagon
 * @returns positive y point trigonometry
 */
export function pointSinPos(y: number, r: number) {
  return sinPI6 * r + y;
}

/**
 *
 * @param x center of the hexagon
 * @param r radius of the hexagon
 * @returns negative x point trigonometry
 */
export function pointCosNeg(x: number, r: number) {
  return -cosPI6 * r + x;
}

/**
 *
 * @param y center of the hexagon
 * @param r radius of the hexagon
 * @returns negative y point trigonometry
 */
export function pointSinNeg(y: number, r: number) {
  return -sinPI6 * r + y;
}

/**
 *
 * @param x center of the hexagon
 * @param y center of the hexagon
 * @param r radius of the hexagon
 * @param index hexagon corner number
 * @returns coordonates points of the number corner of the hexagon
 */
function hexPointsFromIndex(
  x: number,
  y: number,
  r: number,
  index: number,
): { x: number; y: number } {
  const functions = [
    () => {
      //point at the top of the hexagon
      return { x: x, y: y - r };
    },
    () => {
      //point at the top right of the hexagon
      return { x: pointCosPos(x, r), y: pointSinNeg(y, r) };
    },
    () => {
      //point at bottom right of the hexagon
      return { x: pointCosPos(x, r), y: pointSinPos(y, r) };
    },
    () => {
      //point at bottom of the hexagon
      return { x: x, y: y + r };
    },
    () => {
      //point at bottom left of the hexagon
      return { x: pointCosNeg(x, r), y: pointSinPos(y, r) };
    },
    () => {
      //point at top left of the hexagon
      return { x: pointCosNeg(x, r), y: pointSinNeg(y, r) };
    },
  ];

  return functions[index]();
}
