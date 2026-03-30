const numbers = {
  donaldo: "4076072840",
  tess: "6892600745"
};

const rewardPools = {
  tess: [
    {
      label: "RTR",
      image: "assets/rtr.png"
    },
    {
      label: "Romantic Dinner",
      image: "assets/dinner.png"
    },
    {
      label: "Romantic Weekend Getaway",
      image: "assets/getaway.png"
    },
    {
      label: "Shopping Credit",
      image: "assets/shopping.png"
    }
  ],
  donaldo: [
    {
      label: "Lingerie for a week",
      image: "assets/rtr.png"
    },
    {
      label: "Cook pasta with Mama Napoli sauce",
      image: "assets/dinner.png"
    },
    {
      label: "Surprise gift",
      image: "assets/shopping.png"
    },
    {
      label: "Make the bed and wash dishes for a week",
      image: "assets/getaway.png"
    }
  ]
};

let currentPlayer = null;
let currentMode = null;
let currentPath = null;
let lives = {
  donaldo: 3,
  tess: 3
};
let wheelRotation = 0;
let moveInterval = null;
let carouselInterval = null;

const mainScreen = document.getElementById("mainScreen");
const modeScreen = document.getElementById("modeScreen");
const countdownScreen = document.getElementById("countdownScreen");
const guessScreen = document.getElementById("guessScreen");
const wheelScreen = document.getElementById("wheelScreen");

const flashNumber = document.getElementById("flashNumber");
const boom = document.getElementById("boom");
const countdown = document.getElementById("countdown");
const guessInput = document.getElementById("guessInput");
const resultMessage = document.getElementById("resultMessage");
const wheel = document.getElementById("wheel");
const wheelResult = document.getElementById("wheelResult");
const guessTitle = document.getElementById("guessTitle");
const modeTitle = document.getElementById("modeTitle");
const hardModeList = document.getElementById("hardModeList");

const donaldoLives = document.getElementById("donaldoLives");
const tessLives = document.getElementById("tessLives");

const carouselImage = document.getElementById("carouselImage");
const carouselCaption = document.getElementById("carouselCaption");

const wheelImg1 = document.getElementById("wheelImg1");
const wheelImg2 = document.getElementById("wheelImg2");
const wheelImg3 = document.getElementById("wheelImg3");
const wheelImg4 = document.getElementById("wheelImg4");

const wheelLabel1 = document.getElementById("wheelLabel1");
const wheelLabel2 = document.getElementById("wheelLabel2");
const wheelLabel3 = document.getElementById("wheelLabel3");
const wheelLabel4 = document.getElementById("wheelLabel4");

function hideAllScreens() {
  mainScreen.classList.add("hidden");
  modeScreen.classList.add("hidden");
  countdownScreen.classList.add("hidden");
  guessScreen.classList.add("hidden");
  wheelScreen.classList.add("hidden");
}

function updateLives() {
  donaldoLives.textContent = lives.donaldo;
  tessLives.textContent = lives.tess;
}

function updatePathButtons() {
  const safeBtn = document.getElementById("safePath");
  const doubleBtn = document.getElementById("doublePath");

  safeBtn.style.boxShadow = "none";
  doubleBtn.style.boxShadow = "none";

  if (currentPath === "safe") {
    safeBtn.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.35)";
  }

  if (currentPath === "double") {
    doubleBtn.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.35)";
  }
}

function choosePlayer(player) {
  currentPlayer = player;
  currentPath = null;
  guessInput.value = "";
  resultMessage.textContent = "";
  stopCarousel();
  hideAllScreens();
  modeScreen.classList.remove("hidden");

  modeTitle.textContent =
    player === "donaldo"
      ? "Donaldo's Turn - Choose mode"
      : "Tess Turn - Choose mode";

  const pool = rewardPools[player];
  hardModeList.innerHTML = pool.map(item => item.label).join(" • ");
}

function startMode(mode) {
  currentMode = mode;
  currentPath = null;
  guessInput.value = "";
  resultMessage.textContent = "";
  stopCarousel();
  hideAllScreens();
  countdownScreen.classList.remove("hidden");
  startCountdown();
}

function startCountdown() {
  let count = 3;
  countdown.textContent = count;

  const interval = setInterval(function () {
    count--;
    countdown.textContent = count;

    if (count <= 0) {
      clearInterval(interval);
      showMovingNumber();
    }
  }, 1000);
}

function randomPosition() {
  const top = Math.floor(Math.random() * 65) + 8;
  const left = Math.floor(Math.random() * 68) + 5;
  const rotate = Math.floor(Math.random() * 20) - 10;

  flashNumber.style.top = top + "%";
  flashNumber.style.left = left + "%";
  flashNumber.style.transform = "translate(-50%, -50%) rotate(" + rotate + "deg)";
}

function stopNumberMotion() {
  if (moveInterval) {
    clearInterval(moveInterval);
    moveInterval = null;
  }
}

function showMovingNumber() {
  hideAllScreens();

  const targetNumber =
    currentPlayer === "donaldo" ? numbers.donaldo : numbers.tess;

  flashNumber.textContent = targetNumber;
  flashNumber.classList.remove("hidden");

  randomPosition();
  stopNumberMotion();

  moveInterval = setInterval(function () {
    randomPosition();
  }, 170);

  const revealTime = currentMode === "hard" ? 1500 : 2500;

  setTimeout(function () {
    stopNumberMotion();
    flashNumber.classList.add("hidden");
    showExplosion();
  }, revealTime);
}

function showExplosion() {
  boom.classList.remove("hidden");

  setTimeout(function () {
    boom.classList.add("hidden");
    showGuessScreen();
  }, 900);
}

function showGuessScreen() {
  hideAllScreens();
  guessScreen.classList.remove("hidden");

  if (currentPlayer === "donaldo") {
    guessTitle.textContent = "Type Tess's number";
  } else {
    guessTitle.textContent = "Type Donaldo's number";
  }

  currentPath = null;
  updatePathButtons();
  startCarousel();
}

function startCarousel() {
  stopCarousel();

  const items = rewardPools[currentPlayer];
  let index = 0;

  function render() {
    carouselImage.src = items[index].image;
    carouselCaption.textContent = items[index].label;
  }

  render();

  carouselInterval = setInterval(function () {
    index = (index + 1) % items.length;
    render();
  }, 2000);
}

function stopCarousel() {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
}

function selectPath(path) {
  currentPath = path;
  updatePathButtons();
}

function checkGameOver() {
  if (lives.donaldo <= 0) {
    alert("Donaldo is out of lives. Tess wins.");
    resetAll();
    return true;
  }

  if (lives.tess <= 0) {
    alert("Tess is out of lives. Donaldo wins.");
    resetAll();
    return true;
  }

  return false;
}

function switchTurn() {
  currentPlayer = currentPlayer === "donaldo" ? "tess" : "donaldo";
  currentMode = null;
  currentPath = null;
  guessInput.value = "";
  resultMessage.textContent = "";
  stopCarousel();
  hideAllScreens();
  modeScreen.classList.remove("hidden");
  modeTitle.textContent =
    currentPlayer === "donaldo"
      ? "Donaldo's Turn - Choose mode"
      : "Tess Turn - Choose mode";

  const pool = rewardPools[currentPlayer];
  hardModeList.innerHTML = pool.map(item => item.label).join(" • ");
}

function getWinningPrize(prizeList, rotation) {
  const normalized = ((rotation % 360) + 360) % 360;
  const segmentSize = 360 / prizeList.length;
  const pointerAngle = (360 - normalized) % 360;
  const index = Math.floor(pointerAngle / segmentSize) % prizeList.length;
  return prizeList[index];
}

function setupWheelVisuals() {
  const items = rewardPools[currentPlayer];

  wheelImg1.src = items[0].image;
  wheelImg2.src = items[1].image;
  wheelImg3.src = items[2].image;
  wheelImg4.src = items[3].image;

  wheelLabel1.textContent = items[0].label;
  wheelLabel2.textContent = items[1].label;
  wheelLabel3.textContent = items[2].label;
  wheelLabel4.textContent = items[3].label;
}

function showWheel() {
  stopCarousel();
  hideAllScreens();
  wheelScreen.classList.remove("hidden");
  wheelResult.textContent = "";

  setupWheelVisuals();

  const prizeList = rewardPools[currentPlayer];
  const spins = 5 + Math.floor(Math.random() * 4);
  const extraDeg = Math.floor(Math.random() * 360);
  wheelRotation += spins * 360 + extraDeg;

  wheel.style.transform = "rotate(" + wheelRotation + "deg)";

  setTimeout(function () {
    const selectedPrize = getWinningPrize(prizeList, wheelRotation);
    wheelResult.textContent = "Prize won: " + selectedPrize.label;
  }, 4200);
}

function submitGuess() {
  if (!currentPath) {
    resultMessage.textContent = "Choose Safe Path or Prizes Are Double first.";
    return;
  }

  const guess = guessInput.value.trim();

  if (guess.length !== 10) {
    resultMessage.textContent = "Enter the full 10-digit number.";
    return;
  }

  const correctNumber =
    currentPlayer === "donaldo" ? numbers.donaldo : numbers.tess;

  const gotItRight = guess === correctNumber;

  if (gotItRight) {
    if (currentPath === "safe") {
      resultMessage.textContent = "Correct. Safe Path success.";
      return;
    }

    resultMessage.textContent = "Correct. Spinning the wheel...";
    setTimeout(function () {
      showWheel();
    }, 700);
    return;
  }

  lives[currentPlayer] = Math.max(0, lives[currentPlayer] - 1);
  updateLives();

  if (currentPath === "safe") {
    resultMessage.textContent =
      "Wrong. You lose one life. Now it is the other player's turn.";
  } else {
    resultMessage.textContent =
      "Wrong. You lose one life and your partner chooses a punishment right now 😈";
  }

  if (checkGameOver()) {
    return;
  }

  setTimeout(function () {
    switchTurn();
  }, 1800);
}

function resetAll() {
  currentPlayer = null;
  currentMode = null;
  currentPath = null;
  lives = { donaldo: 3, tess: 3 };
  wheelRotation = 0;
  guessInput.value = "";
  resultMessage.textContent = "";
  wheelResult.textContent = "";
  stopCarousel();
  stopNumberMotion();
  updateLives();
  hideAllScreens();
  mainScreen.classList.remove("hidden");
}

function resetGame() {
  switchTurn();
}

document.getElementById("donaldoBtn").onclick = function () {
  choosePlayer("donaldo");
};

document.getElementById("tessBtn").onclick = function () {
  choosePlayer("tess");
};

document.getElementById("hardMode").onclick = function () {
  startMode("hard");
};

document.getElementById("easyMode").onclick = function () {
  startMode("easy");
};

document.getElementById("safePath").onclick = function () {
  selectPath("safe");
};

document.getElementById("doublePath").onclick = function () {
  selectPath("double");
};

document.getElementById("submitGuess").onclick = function () {
  submitGuess();
};

document.getElementById("newRound").onclick = function () {
  resetGame();
};

updateLives();
