function secondLargestDistinct(nums) {
  let first = -Infinity, second = -Infinity;
  for (const value of nums) {
    if (value === first || value === second) continue;
    if (value > first) { second = first; first = value; }
    else if (value > second) second = value;
  }
  return second === -Infinity ? -1 : second;
}
