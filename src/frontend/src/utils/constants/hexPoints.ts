const cosPI6 = Math.cos(Math.PI / 6);
const sinPI6 = Math.sin(Math.PI / 6);

export default function handlerHexPoints(
  x: number,
  y: number,
  r: number,
  index: number,
  options?: { unit?: boolean },
): { x: number; y: number } {
  if (index < 0 || index > 5) throw new Error("index must be between 0 and 5");

  const hexPoints = hexPointsFromIndex(x, y, r, index);

  if (options?.unit) {
    /* return the center between the two points */
    return { x: (hexPoints.x + x) / 2, y: (hexPoints.y + y) / 2 };
  }

  return hexPoints;
}

function hexPointsFromIndex(
  x: number,
  y: number,
  r: number,
  index: number,
): { x: number; y: number } {
  function pointCosPos() {
    return cosPI6 * r + x;
  }

  function pointSinPos() {
    return sinPI6 * r + y;
  }

  function pointCosNeg() {
    return -cosPI6 * r + x;
  }

  function pointSinNeg() {
    return -sinPI6 * r + y;
  }

  const functions = [
    () => {
      return { x: x, y: y - r };
    },
    () => {
      return { x: pointCosPos(), y: pointSinNeg() };
    },
    () => {
      return { x: pointCosPos(), y: pointSinPos() };
    },
    () => {
      return { x: x, y: y + r };
    },
    () => {
      return { x: pointCosNeg(), y: pointSinPos() };
    },
    () => {
      return { x: pointCosNeg(), y: pointSinNeg() };
    },
  ];

  return functions[index]();
}
