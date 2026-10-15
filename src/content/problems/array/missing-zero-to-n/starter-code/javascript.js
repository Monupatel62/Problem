function missingZeroToN(nums) {
  const n = nums.length;
  return (n * (n + 1)) / 2 - nums.reduce((sum, value) => sum + value, 0);
}
