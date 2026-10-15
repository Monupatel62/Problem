function firstRepeatedCharacter(s) {
  const seen = new Set();
  for (const ch of s) { if (seen.has(ch)) return ch; seen.add(ch); }
  return '';
}
