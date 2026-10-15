function longestBalancedZeroOne(nums) {
  const first = new Map([[0, -1]]);
  let prefix = 0, best = 0;
  for (let i = 0; i < nums.length; i++) {
    prefix += nums[i] === 1 ? 1 : -1;
    if (first.has(prefix)) best = Math.max(best, i - first.get(prefix));
    else first.set(prefix, i);
  }
  return best;
}
