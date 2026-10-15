function countStrictlyGreater(nums, threshold) {
  let count = 0;
  for (const value of nums) if (value > threshold) count++;
  return count;
}
