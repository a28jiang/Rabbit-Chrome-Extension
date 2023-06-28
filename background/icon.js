export const setPopupIcon = (procrastination) => {
  let mood = "chill";

  if (procrastination > 70) {
    mood = "happy";
  } else if (procrastination > 49) {
    mood = "chill";
  } else if (procrastination > 30) {
    mood = "meh";
  } else {
    mood = "cry";
  }

  let i = 0;

  const iconLoop = () => {
    setTimeout(() => {
      chrome.action.setIcon({
        path: `../assets/${mood}${i % 4}.png`,
      });
      i++;
      if (i < 8) {
        iconLoop();
      }
    }, 300);
  };

  iconLoop();
};
