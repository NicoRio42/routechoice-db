import routesColors from "./routes-colors";

function addNiceColorsAndNamesToAttributedRoutechoices(routechoices) {
  const rcs = [...routechoices];
  const routechoicesNumberPerLeg = {};

  rcs.forEach((routechoice) => {
    routechoicesNumberPerLeg[routechoice.legNumber] =
      routechoicesNumberPerLeg[routechoice.legNumber] === undefined
        ? 0
        : routechoicesNumberPerLeg[routechoice.legNumber] + 1;

    routechoice.color =
      routesColors[
        routechoicesNumberPerLeg[routechoice.legNumber] % routesColors.length
      ];

    if (routechoicesNumberPerLeg[routechoice.legNumber] < names.length) {
      routechoice.name = names[routechoicesNumberPerLeg[routechoice.legNumber]];
    }
  });

  return rcs;
}

const names = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

export default addNiceColorsAndNamesToAttributedRoutechoices;
