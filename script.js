const numbers = {
  donaldo: "4076072840",
  tess: "6892600745"
};

const stageDefinitions = {
  1: 2,
  2: 4,
  3: 10
};

const rewardPools = {
  tess: [
    { label: "RTR", image: "assets/rtr.png" },
    { label: "Romantic Dinner", image: "assets/dinner.png" },
    { label: "Spa Day @ Spavia", image: "assets/getaway.png" },
    { label: "Shopping Credit", image: "assets/shopping.png" }
  ],
  donaldo: [
    { label: "Lingerie for a week", image: "assets/rtr.png" },
    { label: "Cook pasta with Mama Napoli sauce", image: "assets/dinner.png" },
    { label: "Surprise gift", image: "assets/shopping.png" },
    { label: "Make the bed and wash dishes for a week", image: "assets/getaway.png" }
  ]
};

let currentPlayer = null;
let currentMode = null;
let currentPath = null;
let wheelRotation = 0;
let moveInterval = null;
let carouselInterval = null;
let secondChanceDelayTimeout = null;
let offerCountdownInterval = null;
let offerExpireTimeout = null;
let bonusOfferDelayTimeout = null;
let bonusOfferCountdownInterval = null;
let bonusOfferExpireTimeout = null;

const progress = {
  donaldo: {
    stage: 1,
    known: Array(10).fill(""),
    askedThisStage: [],
    wheelUnlocked: false
  },
  tess: {
    stage: 1,
    known: Array(10).fill(""),
    askedThisStage: [],
    wheelUnlocked: false
  }
};

let currentRequestedIndices = [];

const mainScreen = document.getElementById("mainScreen");
const modeScreen = document.getElementById("modeScreen");
const countdownScreen = document.getElementById("countdownScreen");
const guessScreen = document.getElementById("guessScreen");
const wheelScreen = document.getElementById("wheelScreen");
const punishmentScreen = document.getElementById("punishmentScreen");

const flashNumber = document.getElementById("flashNumber");
const boom = document.getElementById("boom");
const countdown = document.getElementById("countdown");
const resultMessage = document.getElementById("resultMessage");
const wheel = document.getElementById("wheel");
const wheelResult = document.getElementById("wheelResult");
const guessTitle = document.getElementById("guessTitle");
const modeTitle = document.getElementById("modeTitle");
const hardModeList = document.getElementById("hardModeList");

const donaldoStage = document.getElementById("donaldoStage");
const tessStage = document.getElementById("tessStage");

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

const maskedNumber = document.getElementById("maskedNumber");
const digitInputs = document.getElementById("digitInputs");
const stageInstructions = document.getElementById("stageInstructions");

const secondChanceBox = document.getElementById("secondChanceBox");
const offerCountdown = document.getElementById("offerCountdown");
const offerBoom = document.getElementById("offerBoom");

const bonusOfferBox = document.getElementById("bonusOfferBox");
const bonusCountdown = document.getElementById("bonusCountdown");
const bonusOfferBoom = document.getElementById("bonusOfferBoom");

function getOpponentKey(player) {
  return player === "donaldo" ? "tess" : "donaldo";
}

function getTargetNumber(player) {
  return numbers[player];
}

function hideAllScreens() {
  mainScreen.classList.add("hidden");
  modeScreen.classList.add("hidden");
  countdownScreen.classList.add("hidden");
  guessScreen.classList.add("hidden");
  wheelScreen.classList.add("hidden");
  punishmentScreen.classList.add("hidden");
}

function updateStageDisplay() {
  donaldoStage.textContent = progress.donaldo.stage > 3 ? "WIN" : progress.donaldo.stage;
  tessStage.textContent = progress.tess.stage > 3 ? "WIN" : progress.tess.stage;
}

function updatePathButtons() {
  const safeBtn = document.getElementById("safePath");
  const doubleBtn = document.getElementById("doublePath");

  safeBtn.style.boxShadow = "none";
  doubleBtn.style.boxShadow = "none";

  if (currentPath === "safe") safeBtn.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.35)";
  if (currentPath === "double") doubleBtn.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.35)";
}

function choosePlayer(player) {
  currentPlayer = player;
  currentPath = null;
  resultMessage.textContent = "";
  stopCarousel();
  hideAllScreens();
  modeScreen.classList.remove("hidden");
  modeTitle.textContent = player === "donaldo" ? "Donaldo's Turn - Choose mode" : "Tess Turn - Choose mode";
  hardModeList.innerHTML = rewardPools[player].map(item => item.label).join(" • ");
}

function startMode(mode) {
  currentMode = mode;
  currentPath = null;
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
  const targetNumber = getTargetNumber(currentPlayer);
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

function pickRandomIndicesForStage(player) {
  const playerProgress = progress[player];
  const targetNumber = getTargetNumber(player);
  const stage = playerProgress.stage;
  const need = stageDefinitions[stage];

  if (stage === 3) {
    return [0,1,2,3,4,5,6,7,8,9];
  }

  const available = [];
  for (let i = 0; i < targetNumber.length; i++) {
    if (!playerProgress.known[i] && !playerProgress.askedThisStage.includes(i)) {
      available.push(i);
    }
  }

  const selected = [];
  const copy = [...available];

  while (copy.length > 0 && selected.length < need) {
    const idx = Math.floor(Math.random() * copy.length);
    selected.push(copy.splice(idx, 1)[0]);
  }

  while (selected.length < need) {
    for (let i = 0; i < targetNumber.length && selected.length < need; i++) {
      if (!selected.includes(i) && !playerProgress.known[i]) selected.push(i);
    }
  }

  return selected.sort((a, b) => a - b);
}

function renderMaskedNumber(player, askedIndices) {
  const playerProgress = progress[player];
  maskedNumber.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    const slot = document.createElement("div");
    slot.className = "mask-slot";

    if (playerProgress.known[i]) {
      slot.classList.add("known");
      slot.textContent = playerProgress.known[i];
    } else if (askedIndices.includes(i)) {
      slot.classList.add("ask");
      slot.textContent = "?";
    } else {
      slot.textContent = "_";
    }

    maskedNumber.appendChild(slot);
  }
}

function renderDigitInputs(player, askedIndices) {
  const playerProgress = progress[player];
  digitInputs.innerHTML = "";

  askedIndices.forEach(function (index) {
    if (playerProgress.known[index]) return;

    const wrap = document.createElement("div");
    wrap.className = "digit-input-box";

    const label = document.createElement("label");
    label.textContent = "Digit " + (index + 1);

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.dataset.index = index;
    input.inputMode = "numeric";

    input.addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 1);
    });

    wrap.appendChild(label);
    wrap.appendChild(input);
    digitInputs.appendChild(wrap);
  });
}

function showGuessScreen() {
  hideAllScreens();
  guessScreen.classList.remove("hidden");

  const playerProgress = progress[currentPlayer];
  currentRequestedIndices = pickRandomIndicesForStage(currentPlayer);

  if (currentPlayer === "donaldo") {
    guessTitle.textContent = "Type Tess's requested digits";
  } else {
    guessTitle.textContent = "Type Donaldo's requested digits";
  }

  stageInstructions.textContent =
    "Stage " + playerProgress.stage + ": fill " + stageDefinitions[playerProgress.stage] + " requested digits.";

  renderMaskedNumber(currentPlayer, currentRequestedIndices);
  renderDigitInputs(currentPlayer, currentRequestedIndices);

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

function clearPunishmentTimers() {
  if (secondChanceDelayTimeout) clearTimeout(secondChanceDelayTimeout);
  if (offerCountdownInterval) clearInterval(offerCountdownInterval);
  if (offerExpireTimeout) clearTimeout(offerExpireTimeout);
  secondChanceDelayTimeout = null;
  offerCountdownInterval = null;
  offerExpireTimeout = null;
}

function resetPunishmentVisuals() {
  clearPunishmentTimers();
  secondChanceBox.classList.add("hidden");
  offerBoom.classList.add("hidden");
  offerCountdown.textContent = "5";
}

function startSecondChanceSequence() {
  resetPunishmentVisuals();

  secondChanceDelayTimeout = setTimeout(function () {
    secondChanceBox.classList.remove("hidden");

    let secondsLeft = 5;
    offerCountdown.textContent = secondsLeft;

    offerCountdownInterval = setInterval(function () {
      secondsLeft--;
      offerCountdown.textContent = secondsLeft;
      if (secondsLeft <= 0) {
        clearInterval(offerCountdownInterval);
        offerCountdownInterval = null;
      }
    }, 1000);

    offerExpireTimeout = setTimeout(function () {
      secondChanceBox.classList.add("hidden");
      offerBoom.classList.remove("hidden");

      setTimeout(function () {
        offerBoom.classList.add("hidden");
      }, 1000);
    }, 5000);
  }, 3000);
}

function clearBonusTimers() {
  if (bonusOfferDelayTimeout) clearTimeout(bonusOfferDelayTimeout);
  if (bonusOfferCountdownInterval) clearInterval(bonusOfferCountdownInterval);
  if (bonusOfferExpireTimeout) clearTimeout(bonusOfferExpireTimeout);
  bonusOfferDelayTimeout = null;
  bonusOfferCountdownInterval = null;
  bonusOfferExpireTimeout = null;
}

function resetBonusOffer() {
  clearBonusTimers();
  bonusOfferBox.classList.add("hidden");
  bonusOfferBoom.classList.add("hidden");
  bonusCountdown.textContent = "7";
}

function startBonusOfferIfNeeded() {
  resetBonusOffer();

  if (currentPlayer !== "tess") return;

  bonusOfferDelayTimeout = setTimeout(function () {
    bonusOfferBox.classList.remove("hidden");

    let secondsLeft = 7;
    bonusCountdown.textContent = secondsLeft;

    bonusOfferCountdownInterval = setInterval(function () {
      secondsLeft--;
      bonusCountdown.textContent = secondsLeft;
      if (secondsLeft <= 0) {
        clearInterval(bonusOfferCountdownInterval);
        bonusOfferCountdownInterval = null;
      }
    }, 1000);

    bonusOfferExpireTimeout = setTimeout(function () {
      bonusOfferBox.classList.add("hidden");
      bonusOfferBoom.classList.remove("hidden");

      setTimeout(function () {
        bonusOfferBoom.classList.add("hidden");
      }, 1000);
    }, 7000);
  }, 0);
}

function selectPath(path) {
  currentPath = path;
  updatePathButtons();
}

function switchTurn() {
  currentPlayer = getOpponentKey(currentPlayer);
  currentMode = null;
  currentPath = null;
  resultMessage.textContent = "";
  stopCarousel();
  hideAllScreens();
  modeScreen.classList.remove("hidden");
  modeTitle.textContent = currentPlayer === "donaldo" ? "Donaldo's Turn - Choose mode" : "Tess Turn - Choose mode";
  hardModeList.innerHTML = rewardPools[currentPlayer].map(item => item.label).join(" • ");
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
  const newRotation = wheelRotation + spins * 360 + extraDeg;

  wheel.style.transition = "none";
  wheel.style.transform = "rotate(" + wheelRotation + "deg)";
  wheel.offsetHeight;

  requestAnimationFrame(function () {
    wheel.style.transition = "transform 4.2s cubic-bezier(0.15, 0.8, 0.2, 1)";
    wheel.style.transform = "rotate(" + newRotation + "deg)";
  });

  wheelRotation = newRotation;

  setTimeout(function () {
    const selectedPrize = getWinningPrize(prizeList, wheelRotation);
    wheelResult.textContent = "Prize won: " + selectedPrize.label;
    startBonusOfferIfNeeded();
  }, 4200);
}

function showPunishmentScreen() {
  stopCarousel();
  hideAllScreens();
  punishmentScreen.classList.remove("hidden");
  startSecondChanceSequence();
}

function advanceStageIfReady(player) {
  const playerProgress = progress[player];
  const stage = playerProgress.stage;
  const targetNeed = stageDefinitions[stage];
  let knownCount = 0;

  for (let i = 0; i < playerProgress.known.length; i++) {
    if (playerProgress.known[i]) knownCount++;
  }

  if (stage === 1 && knownCount >= 2) {
    playerProgress.stage = 2;
    playerProgress.askedThisStage = [];
  } else if (stage === 2 && knownCount >= 6) {
    playerProgress.stage = 3;
    playerProgress.askedThisStage = [];
  } else if (stage === 3 && knownCount >= 10) {
    playerProgress.stage = 4;
    playerProgress.wheelUnlocked = true;
  }

  updateStageDisplay();
}

function submitGuess() {
  if (!currentPath) {
    resultMessage.textContent = "Choose Safe Path or Bet Your Luck and Memory first.";
    return;
  }

  const playerProgress = progress[currentPlayer];
  const targetNumber = getTargetNumber(currentPlayer);
  const inputs = digitInputs.querySelectorAll("input");
  const entered = {};

  inputs.forEach(function (input) {
    entered[Number(input.dataset.index)] = input.value.trim();
  });

  currentRequestedIndices.forEach(function (index) {
    if (playerProgress.known[index]) return;

    const val = entered[index] || "";
    if (val && val === targetNumber[index]) {
      playerProgress.known[index] = val;
    }
    if (!playerProgress.askedThisStage.includes(index)) {
      playerProgress.askedThisStage.push(index);
    }
  });

  advanceStageIfReady(currentPlayer);

  if (playerProgress.wheelUnlocked) {
    resultMessage.textContent = "You completed all stages and unlocked the wheel.";
    setTimeout(function () {
      showWheel();
    }, 700);
    return;
  }

  if (currentPath === "double") {
    let allWrong = true;
    currentRequestedIndices.forEach(function (index) {
      if (playerProgress.known[index]) allWrong = false;
    });

    if (allWrong) {
      showPunishmentScreen();
      return;
    }
  }

  resultMessage.textContent =
    "Stage submitted. Known digits were saved. Turn passes to the other player.";

  setTimeout(function () {
    switchTurn();
  }, 1400);
}

function resetAll() {
  progress.donaldo.stage = 1;
  progress.donaldo.known = Array(10).fill("");
  progress.donaldo.askedThisStage = [];
  progress.donaldo.wheelUnlocked = false;

  progress.tess.stage = 1;
  progress.tess.known = Array(10).fill("");
  progress.tess.askedThisStage = [];
  progress.tess.wheelUnlocked = false;

  currentPlayer = null;
  currentMode = null;
  currentPath = null;
  wheelRotation = 0;
  currentRequestedIndices = [];
  resultMessage.textContent = "";
  wheelResult.textContent = "";
  stopCarousel();
  stopNumberMotion();
  resetPunishmentVisuals();
  resetBonusOffer();
  updateStageDisplay();
  hideAllScreens();
  mainScreen.classList.remove("hidden");
}

function resetGame() {
  resetBonusOffer();
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

document.getElementById("continueAfterPunishment").onclick = function () {
  resetPunishmentVisuals();
  switchTurn();
};

document.getElementById("acceptBonusSpin").onclick = function () {
  resetBonusOffer();
  showWheel();
};

updateStageDisplay();
