"use strict";

import $ from 'jquery';
import Bootstrap from 'bootstrap';
import * as Cookies from "js-cookie";
import NoSleep from "nosleep";


$(document).ready(function () {

  const IN_MILLISECONDS = 60 * 1000;
  const FILLSTYLE_TIMER = "#EE3C0C";
  const FILLSTYLE_INVERTED = "#0f4c61";

  const canvas = document.getElementById("timerCanvas");
  const audio = document.getElementById("audio");
  const mp3 = document.getElementById("mp3");
  const minutesInput = document.getElementById("minutes");
  const startButton = document.getElementById("start");
  const stopButton = document.getElementById("stop");
  const resetButton = document.getElementById("reset");
  const soundOnButton = document.getElementById("sound_on");
  const soundOnLabel = document.getElementById("sound_on_lbl");
  const zoomOutButton = document.getElementById("zoom_out");
  const zoomInButton = document.getElementById("zoom_in");

  const noSleep = new NoSleep();


  const myTimer = {
    duration: 0,
    remaining: 0,
    startTime: Date.now(),
    isRunning: false,
    isCompleted: true
  };

  function calculateRadius(width, height) {
    return Math.min(width, height) * 0.49;
  }

  function formatTime(milliseconds) {
    const seconds = Math.round(milliseconds / 1000);
    const min = Math.floor(seconds / 60);
    const sec = (seconds % 60);
    const m = min < 10 ? " " + min : min;
    const s = sec < 10 ? "0" + sec : sec;
    return m + ":" + s;
  }


  function drawTimer(ctx, canvas, duration, remaining, fillstyle) {
    // save canvas state
    ctx.save();

    // draw the pie
    const radius = calculateRadius(canvas.width, canvas.height);
    ctx.fillStyle = fillstyle;
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
    const ctx = canvas.getContext("2d");
    const minutes = document.getElementById("minutes").value;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTimer(ctx, canvas, minutes * IN_MILLISECONDS, minutes * IN_MILLISECONDS, FILLSTYLE_TIMER);
  }

  function drawExpiredTimer(fillstyle) {
    const ctx = canvas.getContext("2d");
    const minutes = document.getElementById("minutes").value;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTimer(ctx, canvas, minutes * IN_MILLISECONDS, 0, fillstyle);
  }

  function isOdd(num) {
    return num % 2;
  }

  function flashTimer(n) {
    if (isOdd(n)) {
      drawExpiredTimer(FILLSTYLE_TIMER);
    } else {
      drawExpiredTimer(FILLSTYLE_INVERTED);
    }
  }

  // from: https://stackoverflow.com/a/2956980
  function setIntervalX(callback, delay, repetitions) {
    let n = 0;
    const intervalID = window.setInterval(function () {

      callback(n);

      if (++n === repetitions) {
        window.clearInterval(intervalID);
      }
    }, delay);
  }

  function playSound(source) {
    mp3.src = source;
    audio.load();
    audio.play();
  }

  function playExpiredSound() {
    playSound("mp3/expired.mp3");
  }

  function playStartSound() {
    playSound("mp3/start.mp3");
  }

  function preventScreenFromLocking() {
    noSleep.enable();
  }

  function allowScreenLock() {
    noSleep.disable();
  }

  function playSoundAndFlash() {
    if (soundOnButton.checked === true) {
      playExpiredSound();
    }
    startButton.disabled = false;
    stopButton.disabled = true;
    minutesInput.disabled = false;
    setIntervalX(flashTimer, 200, 10);
  }

  function calculateNewTimerState() {
    const passed = Date.now() - myTimer.startTime;
    myTimer.remaining = myTimer.duration - passed;
    if (myTimer.remaining <= 0) {
      myTimer.isRunning = false;
      myTimer.isCompleted = true;
      myTimer.remaining = 0;
    }
  }

  function animateTimer() {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    calculateNewTimerState();

    drawTimer(ctx, canvas, myTimer.duration, myTimer.remaining, FILLSTYLE_TIMER);

    if (myTimer.isRunning) {
      requestAnimationFrame(animateTimer);
    } else {
      allowScreenLock();
      if (myTimer.isCompleted) {
        playSoundAndFlash();
      }
    }
  }

  function unPauseTimer() {
    myTimer.isRunning = true;
    myTimer.isCompleted = false;
    myTimer.startTime = Date.now() - (myTimer.duration - myTimer.remaining);
    animateTimer();
  }

  function startTimerFromScratch() {
    const minutes = minutesInput.value;
    Cookies.set('minutes', minutes);
    Cookies.set('soundOn', soundOnButton.checked);
    Cookies.set('size', canvas.height);

    myTimer.duration = minutes * IN_MILLISECONDS;
    myTimer.remaining = myTimer.duration;
    myTimer.startTime = Date.now();
    myTimer.isRunning = true;
    myTimer.isCompleted = false;
    animateTimer();
  }

  function startTimer() {
    startButton.disabled = true;
    stopButton.disabled = false;
    minutesInput.disabled = true;

    if (soundOnButton.checked) {
      playStartSound();
    }

    if (myTimer.isCompleted) {
      startTimerFromScratch();
    } else {
      unPauseTimer();
    }
  }

  function stopTimer() {
    myTimer.isRunning = false;

    startButton.disabled = false;
    stopButton.disabled = true;
    minutesInput.disabled = false;
  }

  function resetTimer() {
    if (myTimer.isRunning) {
      if (soundOnButton.checked) {
        playStartSound();
      }
      const minutes = minutesInput.value;
      myTimer.duration = minutes * IN_MILLISECONDS;
      myTimer.remaining = minutes * IN_MILLISECONDS;
      myTimer.startTime = Date.now();
      myTimer.isCompleted = false;
      animateTimer();
    } else {
      myTimer.isCompleted = true;
      drawReadyTimer();
    }
  }

  function zoomOut() {
    canvas.height = canvas.height - 50;
    canvas.width = canvas.width - 50;
    if (myTimer === undefined || !myTimer.isRunning) {
      drawReadyTimer();
    }
  }

  function zoomIn() {
    canvas.height = canvas.height + 50;
    canvas.width = canvas.width + 50;
    if (myTimer === undefined || !myTimer.isRunning) {
      drawReadyTimer();
    }
  }

  function setDefaultMinutes() {
    const minutes = Cookies.get('minutes');
    if (minutes !== undefined) {
      minutesInput.value = minutes;
    } else {
      minutesInput.value = 5;
    }
  }

  function toggleSoundOn(soundOn) {
    if (soundOn === true) {
      $('#sound_on_lbl').button('toggle');
    } else {
      $('#sound_off_lbl').button('toggle');
    }
  }

  function setDefaultSoundOnOff() {
    const soundOn = Cookies.get('soundOn');
    if (soundOn !== undefined) {
      toggleSoundOn(JSON.parse(soundOn));
    } else {
      toggleSoundOn(true);
    }
  }

  function setDefaultCanvasSize() {
    const size = Cookies.get('size');
    if (size !== undefined) {
      canvas.height = size;
      canvas.width = size;
    }
  }

  function enableMobileScreenLockPrevention() {
    startButton.addEventListener('click', preventScreenFromLocking, false);
  }

  minutesInput.onchange = drawReadyTimer;
  startButton.onclick = startTimer;
  stopButton.onclick = stopTimer;
  resetButton.onclick = resetTimer;
  soundOnLabel.onclick = playStartSound;
  zoomOutButton.onclick = zoomOut;
  zoomInButton.onclick = zoomIn;

  setDefaultMinutes();
  setDefaultSoundOnOff();
  setDefaultCanvasSize();

  enableMobileScreenLockPrevention();

  stopButton.disabled = true;
  drawReadyTimer();

});
