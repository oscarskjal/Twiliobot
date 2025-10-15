const { getRandomChickenJoke } = require("./server");

describe("Unit Tests - Core Functions", () => {
  describe("getRandomChickenJoke", () => {
    test("should return a string", () => {
      const joke = getRandomChickenJoke();
      expect(typeof joke).toBe("string");
    });

    test("should return a joke that contains chicken-related content", () => {
      const joke = getRandomChickenJoke();
      const lowerJoke = joke.toLowerCase();
      expect(
        lowerJoke.includes("chicken") ||
          lowerJoke.includes("road") ||
          lowerJoke.includes("cross")
      ).toBe(true);
    });

    test("should return a joke with chicken emoji", () => {
      const joke = getRandomChickenJoke();
      expect(joke).toMatch(/🐔/);
    });

    test("should return different jokes when called multiple times", () => {
      const jokes = new Set();
      // Call it multiple times to increase chance of getting different jokes
      for (let i = 0; i < 20; i++) {
        jokes.add(getRandomChickenJoke());
      }
      // With 8 jokes available, we should get at least 2 different ones in 20 calls
      expect(jokes.size).toBeGreaterThan(1);
    });

    test("should return one of the predefined jokes", () => {
      const predefinedJokes = [
        "Why did the chicken cross the road? To get to the other side! 🐔",
        "Why did the chicken cross the road? Because it was free-range! 🐔",
        "Why did the chicken cross the road? To prove it wasn't chicken! 🐔",
        "Why did the chicken cross the road? Because the road crossed the chicken first! 🐔",
        "Why did the rubber chicken cross the road? She wanted to stretch her legs! 🐔",
        "Why did the chicken cross the playground? To get to the other slide! 🐔",
        "Why did the chicken cross the road twice? Because it was a double-crosser! 🐔",
        "Why did the chicken cross the road? To escape the Colonel! 🐔",
      ];

      const joke = getRandomChickenJoke();
      expect(predefinedJokes).toContain(joke);
    });

    test("should never return undefined or empty string", () => {
      for (let i = 0; i < 10; i++) {
        const joke = getRandomChickenJoke();
        expect(joke).toBeDefined();
        expect(joke).not.toBe("");
        expect(joke.length).toBeGreaterThan(0);
      }
    });
  });
});
