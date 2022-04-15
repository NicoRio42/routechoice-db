/*
let rerunFileSelector = document.getElementById('2DRerun-file-selector')
let splitsFileSelector = document.getElementById('splits-file-selector')
let gpxFileSelector = document.getElementById('gpx-file-selector')
let runnerSelectContainer = document.getElementById('runner-select-container')
let runnerSelect = document.getElementById('runner-select')
let detectRoutechoicesButton = document.getElementById('detect-routechoices-button')
let routechoicesTable = document.getElementById('routechoices-table')

let courseObject
let gpx
let gpxArray
let runner
let detectedRoutechoices = [] // Problem with synchronisation of split times and GPX, should
// try to compute my own spli times from GPX and course coords

let classResult

rerunFileSelector.addEventListener('change', (event) => {
    let jsonFile = event.target.files[0]
    let reader = new FileReader()

    reader.onload = function (e) {
        let readJson = e.target.result
        courseObject = attributeRoutechoicesToLegs(JSON.parse(readJson))
    }

    reader.readAsText(jsonFile);
})

splitsFileSelector.addEventListener('change', (event) => {
    let xmlFile = event.target.files[0]
    let reader = new FileReader()

    reader.onload = function (e) {
        let readXml = e.target.result
        let parser = new DOMParser()
        let xmlDoc = parser.parseFromString(readXml, "application/xml")
        let classResults = xmlDoc.querySelectorAll('ClassResult')
        classResult = classResults[0]
        loadSplits()
        calculateSplits()
    }

    reader.readAsText(xmlFile);
})

gpxFileSelector.addEventListener('change', (event) => {
    let xmlFile = event.target.files[0]
    let reader = new FileReader()

    reader.onload = function (e) {
        let readXml = e.target.result
        let parser = new DOMParser()
        gpx = parser.parseFromString(readXml, "application/xml")
        gpxArray = gpxToGpxArray(gpx)
        selectRunner()
    }

    reader.readAsText(xmlFile);
})

const selectRunner = () => {
    runnerSelectContainer.classList.remove('w3-hide')

    if (splits) {
        splits.runners.forEach(runner => {
            // Create options in classSelect
            let option = document.createElement('option')
            option.value = runner.pk
            option.innerHTML = runner.firstName + ' ' + runner.lastName
            runnerSelect.appendChild(option)
        })
    
        runnerSelect.addEventListener('change', () => {
            let runnerPk = Number(runnerSelect.options[runnerSelect.selectedIndex].value)
            runner = splits.runners.find(runner => runner.pk === runnerPk)
        })
    }
}

detectRoutechoicesButton.addEventListener('click', () => {
    // Correct startTime
    correctedStartTime = timeToArray(runner.startTime + 'Z')
    correctedStartTime[2] -= 1
    correctedStartTime[3] += 7
    correctedStartTime[4] += 30
    runner.startTime = arrayToTime(correctedStartTime)
    
    runner.legs.forEach((leg, index) => {
        let startTime

        if (index === 0) {
            startTime = runner.startTime
        } else {
            startTime = addSecondsToTime(runner.startTime, runner.legs[index - 1].timeOverall)
        }

        let finishTime = addSecondsToTime(runner.startTime, leg.timeOverall)
        let cutGpxArray = cutGpxRemoveTimes(gpxArray, startTime, finishTime)
        let legNumber = index + 1
        let routechoices = prepareRoutechoices(courseObject, legNumber)
        let detectedRoutechoice = null
        //console.log(startTime, finishTime, cutGpxArray)

        if (routechoices.length !== 0) {
            detectedRoutechoice = detectRoutechoice(cutGpxArray, routechoices)
        }

        detectedRoutechoices.push({
            legNumber: legNumber,
            detectedRoutechoice: detectedRoutechoice,
        })
    })

    buildRoutechoicesTable(detectedRoutechoices, routechoicesTable)
})

const buildRoutechoicesTable = (data, table) => {
    data.forEach(routechoice => {
        let tr = document.createElement('tr')
        let legTd = document.createElement('td')
        legTd.innerHTML = String(routechoice.legNumber)
        let routechoiceTd = document.createElement('td')
        routechoiceTd.innerHTML = routechoice.detectedRoutechoice
        tr.appendChild(legTd)
        tr.appendChild(routechoiceTd)
        tbody = table.querySelector('tbody')
        tbody.appendChild(tr)
    })
}
*/

export const detectRunnersRoutechoices = (runners, courseObject, routes) => {
  // splitsObject is Routechoice-DB like splits object
  // routechoices is an array resulting to a GET request on RDB API
  courseObject = attributeRoutechoicesToLegs(courseObject);

  runners.forEach((runner) => {
    const route = routes[runner.rerun2dRouteIndex];

    if (route) {
      const routeArray = route.latarray.map((lat, index) => [
        lat,
        route.lngarray[index],
        route.timearray[index],
      ]);

      runner.legs.forEach((leg, index) => {
        const raceStartTime = new Date(runner.startTime);
        const raceStartTimeInSeconds = raceStartTime.getTime() / 1000;
        console.log(raceStartTimeInSeconds);
        const startTime =
          index === 0
            ? raceStartTimeInSeconds
            : raceStartTimeInSeconds + runner.legs[index - 1].timeOverall;

        const finishTime = raceStartTimeInSeconds + leg.timeOverall;
        let cutGpxArray = cutRouteArrayRemoveTimes(
          routeArray,
          startTime,
          finishTime
        );
        let legNumber = index + 1;
        let routechoices = prepareRoutechoices(courseObject, legNumber);

        leg.routeChoice =
          routechoices.length !== 0
            ? detectRoutechoice(cutGpxArray, routechoices)
            : null;
      });
    }
  });

  return runners;
};

const distancePointToSegment = (point, extremity1, extremity2) => {
  // The 3 parameters are arrays of 2 number: [x, y]
  let r =
    dotProduct(
      [extremity2[0] - extremity1[0], extremity2[1] - extremity1[1]],
      [point[0] - extremity1[0], point[1] - extremity1[1]]
    ) /
    Math.pow(
      magnitude([extremity2[0] - extremity1[0], extremity2[1] - extremity1[1]]),
      2
    );
  let distance;

  if (r < 0) {
    distance = magnitude([point[0] - extremity1[0], point[1] - extremity1[1]]);
  } else if (r > 1) {
    distance = magnitude([extremity2[0] - point[0], extremity2[1] - point[1]]);
  } else {
    distance = Math.sqrt(
      Math.pow(
        magnitude([point[0] - extremity1[0], point[1] - extremity1[1]]),
        2
      ) -
        Math.pow(
          r *
            magnitude([
              extremity2[0] - extremity1[0],
              extremity2[1] - extremity1[1],
            ]),
          2
        )
    );
  }

  return distance;
};

const distancePointToPolyline = (point, polyline) => {
  // Initiallize distance with the distance to the fist point of the polyline
  let distance = magnitude([
    point[0] - polyline[0][0],
    point[1] - polyline[0][1],
  ]);

  for (let i = 1; i < polyline.length; i++) {
    const d = distancePointToSegment(point, polyline[i - 1], polyline[i]);
    if (d < distance) {
      distance = d;
    }
  }

  return distance;
};

const distanceGPXToPolyline = (GPXArray, polyline) => {
  // GPXArray and polyline are arrays of vectors
  let distance = 0;

  GPXArray.forEach((point) => {
    distance += distancePointToPolyline(point, polyline);
  });

  return distance;
};

const detectRoutechoice = (GPXArray, routechoices) => {
  // Initiallisation with first routechoice
  let routechoiceName = routechoices[0].name;
  let routechoiceColor = routechoices[0].color;
  let distance = distanceGPXToPolyline(GPXArray, routechoices[0].points);

  routechoices.forEach((routechoice) => {
    let d = distanceGPXToPolyline(GPXArray, routechoice.points);

    if (d < distance) {
      distance = d;
      routechoiceName = routechoice.name;
      routechoiceColor = routechoice.color;
    }
  });

  return {
    name: routechoiceName,
    color: routechoiceColor,
  };
};

const cutGpxRemoveTimes = (gpxArray, startTime, finishTime) => {
  // Cut GPX and remove times
  return gpxArray
    .filter((trkpt) => {
      return timeIsHigher(trkpt[2], startTime);
    })
    .filter((trkpt) => {
      return !timeIsHigher(trkpt[2], finishTime);
    })
    .map((trkpt) => {
      return [trkpt[0], trkpt[1]];
    });
};

const cutRouteArrayRemoveTimes = (routeArray, startTime, finishTime) => {
  // Cut GPX and remove times
  return routeArray
    .filter((point) => point[2] > startTime)
    .filter((point) => point[2] < finishTime)
    .map((point) => [point[0], point[1]]);
};

const timeIsHigher = (time1, time2) => {
  // Compare times in '2021-07-03T13:39:22Z' format
  let t1 = timeToArray(time1);
  let t2 = timeToArray(time2);

  for (let i = 0; i < t1.length; i++) {
    if (t1[i] > t2[i] && arraysEqualsToIndex(t1, t2, i)) {
      return true;
    }
  }

  return false;
};

const arraysEqualsToIndex = (array1, array2, index) => {
  // Check if 2 arrays are the same to a certain index
  let areEquals = true;

  for (let i = 0; i < index; i++) {
    if (array1[i] != array2[i]) {
      areEquals = false;
    }
  }

  return areEquals;
};

const timeToArray = (time) => {
  // Convert time in '2021-07-03T13:39:22Z' format to an array of numbers
  const t1 = time.slice(0, -1); // remove Z
  const t2 = t1.split("T");
  const t3 = t2[0]
    .split("-")
    .concat(t2[1].split(":"))
    .map((t) => Number(t));
  return t3;
};

const arrayToTime = (timeArray) => {
  // Invert function of timeToArray()
  const array = timeArray.map((element) => String(element));

  // Add '0' for number smaller than 10
  for (let i = 1; i < array.length; i++) {
    if (array[i].length === 1) {
      array[i] = "0" + array[i];
    }
  }

  return (
    [array[0], array[1], array[2]].join("-") +
    "T" +
    [array[3], array[4], array[5]].join(":") +
    "Z"
  );
};

const addSecondsToTime = (time, seconds) => {
  // Add seconds to time in '2021-07-03T13:39:22Z' format and return a time in the same format
  // Won't work if there is a month change (Don't organize 10Mila the 30 of april please)
  let array = timeToArray(time);
  array[5] += seconds;

  if (array[5] >= 60) {
    let minutes = Math.trunc(array[5] / 60);
    array[5] %= 60;
    array[4] += minutes;
  }

  if (array[4] >= 60) {
    let hours = Math.trunc(array[4] / 60);
    array[4] %= 60;
    array[3] += hours;
  }

  if (array[3] >= 24) {
    let days = Math.trunc(array[3] / 24);
    array[3] %= 24;
    array[2] += days;
  }

  return arrayToTime(array);
};

const gpxToGpxArray = (gpx) => {
  let trkptArray = [...gpx.querySelectorAll("trkpt")];
  let gpxArray = trkptArray.map((trkpt) => [
    Number(trkpt.getAttribute("lat")),
    Number(trkpt.getAttribute("lon")),
    trkpt.querySelector("time").innerHTML,
  ]);
  return gpxArray;
};

const prepareRoutechoices = (courseObject, legNumber) => {
  // Prepare routechoices object for findBestRoutechoice() function
  let routechoices = courseObject.tags.filter(
    (tag) => tag.legNumber === legNumber
  );
  let preparedRoutechoices = routechoices.map((routechoice) => ({
    name: routechoice.name,
    legNumber: routechoices.legNumber,
    points: routechoice.points.map((point) => stringToArray(point)),
    color: routechoice.color,
  }));

  return preparedRoutechoices;
};

const attributeRoutechoicesToLegs = (courseObject) => {
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
};

const stringToArray = (string) => {
  // Convert a vector from a string notation like "x,y" to a array like [x, y]
  return string.split(",").map((x) => Number(x));
};

const magnitude = (vector) => {
  return Math.sqrt(Math.pow(vector[0], 2) + Math.pow(vector[1], 2));
};

const dotProduct = (vector1, vector2) => {
  return vector1[0] * vector2[0] + vector1[1] * vector2[1];
};

const substractVectors = (vector1, vector2) => {
  return [vector1[0] - vector2[0], vector1[1] - vector2[1]];
};

const distance = (vector1, vector2) => {
  return magnitude(substractVectors(vector1, vector2));
};
