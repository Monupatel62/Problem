function countBalancedPrefixes(nums) {
  let sum = 0, count = 0;
  for (const value of nums) { sum += value; if (sum === 0) count++; }
  return count;
}
