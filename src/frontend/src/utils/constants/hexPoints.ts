const cosPI6 = Math.cos(Math.PI / 6);
const sinPI6 = Math.sin(Math.PI / 6);

export default function handlerHexPoints(
  x: number,
  y: number,
  r: number,
  index: number,
  unit?: boolean,
): { x: number; y: number } {
  //if (index < 0 || index > 5) throw new Error("index must be between 0 and 5");

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

export function pointCosPos(x: number, r: number) {
  return cosPI6 * r + x;
}

export function pointSinPos(y: number, r: number) {
  return sinPI6 * r + y;
}

export function pointCosNeg(x: number, r: number) {
  return -cosPI6 * r + x;
}

export function pointSinNeg(y: number, r: number) {
  return -sinPI6 * r + y;
}

function hexPointsFromIndex(
  x: number,
  y: number,
  r: number,
  index: number,
): { x: number; y: number } {
  const functions = [
    () => {
      return { x: x, y: y - r };
    },
    () => {
      return { x: pointCosPos(x, r), y: pointSinNeg(y, r) };
    },
    () => {
      return { x: pointCosPos(x, r), y: pointSinPos(y, r) };
    },
    () => {
      return { x: x, y: y + r };
    },
    () => {
      return { x: pointCosNeg(x, r), y: pointSinPos(y, r) };
    },
    () => {
      return { x: pointCosNeg(x, r), y: pointSinNeg(y, r) };
    },
  ];

  return functions[index]();
}
