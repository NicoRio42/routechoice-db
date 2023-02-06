import type { Coordinate } from "ol/coordinate";

export function transformProjection(
  point: number[],
  matrixParams: MatrixParams
): [number, number] {
  const x =
    matrixParams.A * point[0] + matrixParams.B * point[1] + matrixParams.C;
  const y =
    matrixParams.D * point[0] + matrixParams.E * point[1] + matrixParams.F;
  return [x, y];
}

export function calculate(
  sourcePoints: Coordinate[],
  targetPoints: Coordinate[]
): MatrixParams {
  const numberPoints = sourcePoints.length;

  if (numberPoints < 3) throw "Number of points must be at least 3!";
  if (sourcePoints.length !== targetPoints.length)
    throw "Number of points do not mach!";

  let i;

  let sp = [];
  for (i = 0; i < numberPoints; i++) {
    sp[i] = sourcePoints[i].slice(0);
  }
  let tp = [];
  for (i = 0; i < numberPoints; i++) {
    tp[i] = targetPoints[i].slice(0);
  }

  i = 0;
  let xcg, ycg, xcl, ycl;
  let a1, b1, a2, b2, c1, c2;

  xcg = ycg = xcl = ycl = a1 = b1 = a2 = b2 = c1 = c2 = 0;

  for (i = 0; i < numberPoints; i++) {
    xcg = xcg + tp[i][0];
    ycg = ycg + tp[i][1];
    xcl = xcl + sp[i][0];
    ycl = ycl + sp[i][1];
  }
  xcg /= numberPoints;
  ycg /= numberPoints;
  xcl /= numberPoints;
  ycl /= numberPoints;
  for (i = 0; i < numberPoints; i++) {
    tp[i][0] -= xcg;
    tp[i][1] -= ycg;
    sp[i][0] -= xcl;
    sp[i][1] -= ycl;
  }
  let x1 = 0;
  let y1 = 0;
  let x2 = 0;
  let y2 = 0;
  let x3 = 0;
  let y3 = 0;
  let x4 = 0;
  let n1 = 0;
  for (i = 0; i < numberPoints; i++) {
    x1 += sp[i][0] * tp[i][0];
    y1 += sp[i][1] * tp[i][0];
    x2 += sp[i][0] * sp[i][0];
    y2 += sp[i][1] * tp[i][1];
    x3 += sp[i][0] * tp[i][1];
    y3 += sp[i][1] * sp[i][1];
    x4 += sp[i][0] * sp[i][1];
  }
  a1 = x1 * y3 - y1 * x4;
  b1 = y1 * x2 - x1 * x4;
  a2 = y2 * x2 - x3 * x4;
  b2 = x3 * y3 - y2 * x4;
  n1 = x2 * y3 - x4 * x4;
  a1 /= n1;
  b1 /= n1;
  a2 /= n1;
  b2 /= n1;
  c1 = xcg - a1 * xcl - b1 * ycl;
  c2 = ycg - a2 * ycl - b2 * xcl;

  return {
    A: a1,
    B: b1,
    C: c1,
    D: b2,
    E: a2,
    F: c2,
  };
}

type MatrixParams = {
  A: number;
  B: number;
  C: number;
  D: number;
  E: number;
  F: number;
};
