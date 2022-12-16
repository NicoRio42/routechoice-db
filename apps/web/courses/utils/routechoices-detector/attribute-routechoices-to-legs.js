import { distance, stringToArray } from "./utils";

function attributeRoutechoicesToLegs(courseObject) {
  let object = { ...courseObject };

  object.tags.forEach((tag) => {
    let dist = distance([tag.x, tag.y], stringToArray(object.coursecoords[0]));
    let legNumber = 0;

    object.coursecoords.forEach((coursecoord, index) => {
      let d = distance([tag.x, tag.y], stringToArray(coursecoord));
      if (d < dist) {
        dist = d;
        legNumber = index;
      }
    });

    tag.legNumber = legNumber;
  });

  return object;
}

export default attributeRoutechoicesToLegs;
