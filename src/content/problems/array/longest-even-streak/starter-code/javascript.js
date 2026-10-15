function longestEvenStreak(nums) {
  let best = 0, current = 0;
  for (const value of nums) {
    current = value % 2 === 0 ? current + 1 : 0;
    best = Math.max(best, current);
  }
  return best;
}
