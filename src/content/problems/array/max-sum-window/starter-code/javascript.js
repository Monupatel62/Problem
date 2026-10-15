function maxSumWindow(nums, k) {
  let current = 0;
  for (let i = 0; i < k; i++) current += nums[i];
  let best = current;
  for (let i = k; i < nums.length; i++) {
    current += nums[i] - nums[i - k];
    best = Math.max(best, current);
  }
  return best;
}
