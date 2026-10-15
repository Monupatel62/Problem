function longestSameLetterRun(s) {
  let best = 0, current = 0, prev = '';
  for (const ch of s) { current = ch === prev ? current + 1 : 1; prev = ch; best = Math.max(best, current); }
  return best;
}
