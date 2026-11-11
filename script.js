const categorySelect = document.querySelector("#category");
const flashcard = document.querySelector("#flashcard");
const characterEl = document.querySelector("#character");
const answerEl = document.querySelector("#answer");
const readingEl = document.querySelector("#reading");
const meaningEl = document.querySelector("#meaning");
const hintEl = document.querySelector("#card-hint");
const counterEl = document.querySelector("#counter");
const progressLabel = document.querySelector("#progress-label");
const progressBar = document.querySelector("#progress-bar");

let cards = [];
let order = [];
let currentIndex = 0;
let isFlipped = false;
let learned = new Set();

function loadCategory() {
  const category = categorySelect.value;
  cards = [...cardSets[category]];
  order = cards.map((_, index) => index);
  currentIndex = 0;
  isFlipped = false;
  learned = new Set(JSON.parse(localStorage.getItem(`learned-${category}`) || "[]"));
  render();
}

function currentCard() {
  return cards[order[currentIndex]];
}

function render() {
  const card = currentCard();
  characterEl.textContent = card.character;
  readingEl.textContent = card.reading;
  meaningEl.textContent = card.meaning;
  answerEl.classList.toggle("hidden", !isFlipped);
  hintEl.textContent = isFlipped ? "Antwort" : "Zum Umdrehen antippen";
  counterEl.textContent = `Karte ${currentIndex + 1} / ${cards.length}`;
  progressLabel.textContent = `${learned.size} gelernt`;
  progressBar.style.width = `${(learned.size / cards.length) * 100}%`;
}

function flipCard() {
  isFlipped = !isFlipped;
  render();
}

function nextCard() {
  currentIndex = (currentIndex + 1) % cards.length;
  isFlipped = false;
  render();
}

function previousCard() {
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  isFlipped = false;
  render();
}

function shuffleCards() {
  // Fisher-Yates-Mischalgorithmus
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  currentIndex = 0;
  isFlipped = false;
  render();
}

function markLearned() {
  const category = categorySelect.value;
  const originalIndex = order[currentIndex];
  if (learned.has(originalIndex)) learned.delete(originalIndex);
  else learned.add(originalIndex);
  localStorage.setItem(`learned-${category}`, JSON.stringify([...learned]));
  render();
}

function resetProgress() {
  const category = categorySelect.value;
  if (!confirm("Möchtest du den Lernfortschritt dieser Kategorie zurücksetzen?")) return;
  learned.clear();
  localStorage.removeItem(`learned-${category}`);
  render();
}

categorySelect.addEventListener("change", loadCategory);
flashcard.addEventListener("click", flipCard);
document.querySelector("#flip").addEventListener("click", flipCard);
document.querySelector("#next").addEventListener("click", nextCard);
document.querySelector("#previous").addEventListener("click", previousCard);
document.querySelector("#shuffle").addEventListener("click", shuffleCards);
document.querySelector("#reset").addEventListener("click", resetProgress);

// Mit Leertaste umdrehen, mit Pfeiltasten wechseln.
document.addEventListener("keydown", (event) => {
  if (event.code === "Space") { event.preventDefault(); flipCard(); }
  if (event.key === "ArrowRight") nextCard();
  if (event.key === "ArrowLeft") previousCard();
});

// Doppelklick auf die Karte bzw. Taste L markiert sie als gelernt.
flashcard.addEventListener("dblclick", markLearned);
document.addEventListener("keydown", (event) => {
  if (event.key.toLowerCase() === "l") markLearned();
});

loadCategory();
