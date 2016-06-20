"use strict";

var IN_MILLISECONDS = 60 * 1000;

function calculateRadius(width, height) {
  return Math.min(width, height) * 0.49;
}

function formatTime(milliseconds) {
  var seconds = Math.round(milliseconds / 1000);
  var min = Math.floor(seconds / 60);
  var sec = (seconds % 60);
  var m = min < 10 ? " " + min : min;
  var s = sec < 10 ? "0" + sec : sec;
  return m + ":" + s;
}


function drawTimer(ctx, canvas, duration, remaining) {
  // save canvas state
  ctx.save();

  // draw the pie
  var radius = calculateRadius(canvas.width, canvas.height);
  ctx.fillStyle = "#CC0000";
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(-90 * Math.PI / 180);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, radius, 0, (duration - remaining) * 2 * Math.PI / duration);
  ctx.lineTo(0, 0);
  ctx.fill();

  // display the time
  ctx.globalCompositeOperation = "xor";
  ctx.fillStyle = "black";
  ctx.font = Math.round(radius * 0.5) + "px monaco";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.rotate(90 * Math.PI / 180);
  ctx.fillText(formatTime(remaining), 0, 0);

  // restore canvas state
  ctx.restore();
}

function drawReadyTimer() {
  var canvas = document.getElementById("timerCanvas");
  var ctx = canvas.getContext("2d");
  var minutes = document.getElementById("minutes").value;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTimer(ctx, canvas, minutes * IN_MILLISECONDS, minutes * IN_MILLISECONDS);
}



var audio = document.getElementById("audio");
var minutesInput = document.getElementById("minutes");
var startButton = document.getElementById("start");
var stopButton = document.getElementById("stop");
var resetButton = document.getElementById("reset");
var soundOnButton = document.getElementById("sound_on");
var soundOnLabel = document.getElementById("sound_on_lbl");
var zoomOutButton = document.getElementById("zoom_out");
var zoomInButton = document.getElementById("zoom_in");

var myTimer;

function playSound() {
  audio.play();
}

function animateTimer() {
  var canvas = document.getElementById("timerCanvas");
  var ctx = canvas.getContext("2d");

  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // calculate new timer state
  var passed = Date.now() - myTimer.startTime;
  myTimer.remaining = myTimer.duration - passed;
  if (myTimer.remaining <= 0) {
    myTimer.isRunning = false;
    myTimer.isCompleted = true;
    myTimer.remaining = 0;
  }

  // draw
  drawTimer(ctx, canvas, myTimer.duration, myTimer.remaining);

  if (myTimer.isRunning) {
    // schedule next animation step
    requestAnimationFrame(function () {
      animateTimer();
    });
  } else if (myTimer.isCompleted) {
    if (soundOnButton.checked === true) { playSound(); }
    startButton.disabled = false;
    stopButton.disabled = true;
    minutesInput.disabled = false;
  }
}


function startTimer() {
  var minutes = minutesInput.value;
  Cookies.set('minutes', minutes);
  myTimer = {
    duration: minutes * IN_MILLISECONDS,
    remaining: minutes * IN_MILLISECONDS,
    startTime: Date.now(),
    isRunning: true,
    isCompleted: false
  };
  animateTimer(myTimer);
  startButton.disabled = true;
  stopButton.disabled = false;
  minutesInput.disabled = true;
}

function stopTimer() {
  myTimer.isRunning = false;
  startButton.disabled = false;
  stopButton.disabled = true;
  minutesInput.disabled = false;
}

function resetTimer() {
  if (myTimer.isRunning) {
    startTimer();
  } else {
    drawReadyTimer();
  }
}

function soundOn() {
  playSound(); // iOS: will load the sound so that it can play later when timer expires
}

function zoomOut() {
  var canvas = document.getElementById("timerCanvas");
  canvas.height = canvas.height - 50;
  canvas.width = canvas.width - 50;
  if (myTimer === undefined || !myTimer.isRunning) {
    drawReadyTimer();
  }
}

function zoomIn() {
  var canvas = document.getElementById("timerCanvas");
  canvas.height = canvas.height + 50;
  canvas.width = canvas.width + 50;
  if (myTimer === undefined || !myTimer.isRunning) {
    drawReadyTimer();
  }
}

function setMinutesFromCookie() {
  var minutes = Cookies.get('minutes');
  if (minutes !== undefined) {
    minutesInput.value = minutes;
  }
}

minutesInput.onchange = drawReadyTimer;
startButton.onclick = startTimer;
stopButton.onclick = stopTimer;
resetButton.onclick = resetTimer;
soundOnLabel.onclick = soundOn;
zoomOutButton.onclick = zoomOut;
zoomInButton.onclick = zoomIn;

setMinutesFromCookie();

stopButton.disabled = true;
drawReadyTimer();

