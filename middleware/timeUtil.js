// timeUtil.js
function getCurrentTime() {
   
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  minutes = minutes < 10 ? "0" + minutes : minutes;
  const timeString = `${hours < 10 ? "0" + hours : hours}:${minutes} Hrs`;
  return timeString;
}

module.exports = getCurrentTime;
