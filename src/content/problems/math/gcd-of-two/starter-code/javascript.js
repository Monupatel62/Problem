function gcdOfTwo(a, b) {
  while (b !== 0) { const t = a % b; a = b; b = t; }
  return Math.abs(a);
}
