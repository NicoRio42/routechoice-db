export const stringToArray = (string) => {
  // Convert a vector from a string notation like "x,y" to a array like [x, y]
  return string.split(",").map((x) => Number(x));
};

export const magnitude = (vector) => {
  return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
};

export const dotProduct = (vector1, vector2) => {
  return vector1[0] * vector2[0] + vector1[1] * vector2[1];
};

export const substractVectors = (vector1, vector2) => {
  return [vector1[0] - vector2[0], vector1[1] - vector2[1]];
};

export const distance = (vector1, vector2) => {
  return magnitude(substractVectors(vector1, vector2));
};
