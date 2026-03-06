const fishes = require("../data/fishes");

function getRandomFish() {
  const totalChance = fishes.reduce((acc, fish) => acc + fish.chance, 0);
  const random = Math.random() * totalChance;

  let cumulative = 0;

  for (const fish of fishes) {
    cumulative += fish.chance;
    if (random <= cumulative) {
      return fish;
    }
  }
}

module.exports = getRandomFish;