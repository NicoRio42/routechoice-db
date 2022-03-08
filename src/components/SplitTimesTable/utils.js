export const secondsToPrettyTime = (seconds) => {
  // Convert seconds in number format to string in HH:MM:SS string format
  let hours = Math.trunc(seconds / 3600);
  let remainingSeconds = seconds % 3600;
  let minutes = Math.trunc(remainingSeconds / 60);
  remainingSeconds = remainingSeconds % 60;
  if (hours === 0 && minutes === 0) {
    return String(remainingSeconds);
  } else if (hours === 0) {
    if (remainingSeconds < 10) {
      return String(minutes) + ":0" + String(remainingSeconds);
    } else {
      return String(minutes) + ":" + String(remainingSeconds);
    }
  } else if (minutes < 10) {
    return (
      String(hours) + ":0" + String(minutes) + ":" + String(remainingSeconds)
    );
  }
  return String(hours) + ":" + String(minutes) + ":" + String(remainingSeconds);
};

export const fullNameToShortName = (firstName, lastName) => {
  if (firstName.length === 1 || lastName.length === 1) {
    return `${firstName} ${lastName}`;
  }

  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
};

export const rankToCSSClass = (rank) => {
  if (rank === 1) {
    return "first";
  } else if (rank === 2) {
    return "second";
  } else if (rank === 3) {
    return "third";
  }

  return "";
};
