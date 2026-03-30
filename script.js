const numbers = {
  donaldo: "4076072840",
  tess: "6892600745",
};

const rewards = {
  donaldo: [
    "Lingerie for a week",
    "Cook pasta with Mama Napoli sauce",
    "Surprise gift",
    "Make the bed and wash dishes for a week",
  ],
  tess: [
    "Extra runway outfit",
    "Romantic getaway",
    "Romantic dinner",
    "Shopping trip with a budget wherever you want",
  ],
};

let currentPlayer = null;
let currentMode = null;
let currentPath = null;
let lives = { donaldo: 3, tess: 3 };
let wheelRotation = 0;

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

const donaldoLives = document.getElementById("donaldoLives");
const tessLives = document.getElementById("tessLives");

document.getElementById("donaldoBtn").addEventListener("click", () => choosePlayer("donaldo"));
document.getElementById("tessBtn").addEventListener("click", () => choosePlayer("tess"));
document.getElementById("hardMode").addEventListener("click", () => startMode("hard"));
document.getElementById("easyMode").addEventListener("click", () => startMode("easy"));
document.getElementById("safePath").addEventListener("click", () => selectPath("safe"));
document.getElementById("doublePath").addEventListener("click", () => selectPath("double"));
document.getElementById("submitGuess").addEventListener("click", submitGuess);
document.getElementById("newRound").addEventListener("click", resetGame);

function hideAllScreens() {
  mainScreen.classList.add("hidden");
  modeScreen.classList.add("hidden");
  countdownScreen.classList.add("hidden");
  guessScreen.classList.add("hidden");
  wheelScreen.classList.add("hidden");
}

function choosePlayer(player) {
  currentPlayer = player;
  currentPath = null;
  resultMessage.textContent = "";
  guessInput.value = "";
  hideAllScreens();
  modeScreen.classList.remove("hidden");
  modeTitle.textContent =
    player === "donaldo" ? "Donaldo's Turn - Choose mode" : "Tess Turn - Choose mode";
}

function startMode(mode) {
  currentMode = mode;
  currentPath = null;
  guessInput.value = "";
  resultMessage.textContent = "";
  hideAllScreens();
  countdownScreen.classList.remove("hidden");
  startCountdown();
}

function startCountdown() {
  let count = 3;
  countdown.textContent = count;

  const interval = setInterval(() => {
    count--;
    countdown.textContent = count;

    if (count <= 0) {
      clearInterval(interval);
      showRandomNumber();
    }
  }, 1000);
}

function showRandomNumber() {
  hideAllScreens();

  const targetNumber = currentPlayer === "donaldo" ? numbers.donaldo : numbers.tess;

  const top = Math.floor(Math.random() * 60) + 10;
  const left = Math.floor(Math.random() * 60) + 10;

  flashNumber.style.top = `${top}%`;
  flashNumber.style.left = `${left}%`;
  flashNumber.textContent = targetNumber;
  flashNumber.classList.remove("hidden");

  const revealTime = currentMode === "hard" ? 2000 : 3500;

  setTimeout(() => {
    flashNumber.classList.add("hidden");
    showExplosion();
  }, revealTime);
}

function showExplosion() {
  boom.classList.remove("hidden");

  setTimeout(() => {
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
}

function selectPath(path) {
  currentPath = path;
  updatePathButtons();
}

function updatePathButtons() {
  const safeBtn = document.getElementById("safePath");
  const doubleBtn = document.getElementById("doublePath");

  safeBtn.style.outline = "none";
  doubleBtn.style.outline = "none";
  safeBtn.style.boxShadow = "none";
  doubleBtn.style.boxShadow = "none";

  if (currentPath === "safe") {
    safeBtn.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.35)";
  }

  if (currentPath === "double") {
    doubleBtn.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.35)";
  }
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

  const correctNumber = currentPlayer === "donaldo" ? numbers.donaldo : numbers.tess;
  const gotItRight = guess === correctNumber;

  if (gotItRight) {
    if (currentPath === "safe") {
      resultMessage.textContent = "Correct. Safe Path success. Start a new round.";
      return;
    }

    resultMessage.textContent = "Correct. Spinning the wheel...";
    setTimeout(() => {
      showWheel();
    }, 700);
    return;
  }

  lives[currentPlayer] = Math.max(0, lives[currentPlayer] - 1);
  updateLives();

  if (currentPath === "safe") {
    resultMessage.textContent =
      "Wrong. You lose one life. Nothing else happens. Now it is the other player's turn.";
  } else {
    resultMessage.textContent =
      "Wrong. You lose one life and your partner chooses a punishment right now.";
  }

  checkGameOver();

  setTimeout(() => {
    switchTurn();
  }, 1800);
}

function updateLives() {
  donaldoLives.textContent = lives.donaldo;
  tessLives.textContent = lives.tess;
}

function switchTurn() {
  currentPlayer = currentPlayer === "donaldo" ? "tess" : "donaldo";
  currentMode = null;
  currentPath = null;
  guessInput.value = "";
  resultMessage.textContent = "";
  hideAllScreens();
  modeScreen.classList.remove("hidden");
  modeTitle.textContent =
    currentPlayer === "donaldo" ? "Donaldo's Turn - Choose mode" : "Tess Turn - Choose mode";
}

function checkGameOver() {
  if (lives.donaldo <= 0) {
    setTimeout(() => {
      alert("Donaldo is out of lives. Tess wins.");
      resetAll();
    }, 300);
  }

  if (lives.tess <= 0) {
    setTimeout(() => {
      alert("Tess is out of lives. Donaldo wins.");
      resetAll();
    }, 300);
  }
}

function showWheel() {
  hideAllScreens();
  wheelScreen.classList.remove("hidden");
  wheelResult.textContent = "";

  const prizeList = rewards[currentPlayer];
  const spins = 5 + Math.floor(Math.random() * 4);
  const extraDeg = Math.floor(Math.random() * 360);
  wheelRotation += spins * 360 + extraDeg;

  wheel.style.transform = `rotate(${wheelRotation}deg)`;

  setTimeout(() => {
    const selectedPrize = getWinningPrize(prizeList, wheelRotation);
    wheelResult.textContent = `Prize won: ${selectedPrize}`;
  }, 4000);
}

function getWinningPrize(prizeList, rotation) {
  const normalized = ((rotation % 360) + 360) % 360;
  const segmentSize = 360 / prizeList.length;
  const pointerAngle = (360 - normalized) % 360;
  const index = Math.floor(pointerAngle / segmentSize) % prizeList.length;
  return prizeList[index];
}

function resetGame() {
  switchTurn();
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
  updateLives();
  hideAllScreens();
  mainScreen.classList.remove("hidden");
}

updateLives();
