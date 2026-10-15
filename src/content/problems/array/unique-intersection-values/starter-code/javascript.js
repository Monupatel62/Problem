function uniqueIntersectionValues(a, b) {
  const seen = new Set(a);
  const ans = [];
  for (const value of new Set(b)) if (seen.has(value)) ans.push(value);
  return ans.sort((x, y) => x - y);
}
