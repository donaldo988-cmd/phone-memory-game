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
let currentAnswer = "";
let lives = { donaldo: 3, tess: 3 };

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

document.getElementById("donaldoBtn").onclick = () => choosePlayer("donaldo");
document.getElementById("tessBtn").onclick = () => choosePlayer("tess");
document.getElementById("hardMode").onclick = () => startMode("hard");
document.getElementById("easyMode").onclick = () => startMode("easy");
document.getElementById("safePath").onclick = () => selectPath("safe");
document.getElementById("doublePath").onclick = () => selectPath("double");
document.getElementById("submitGuess").onclick = submitGuess;
