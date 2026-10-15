function findPivotIndexSimple(nums) {
  const total = nums.reduce((sum, value) => sum + value, 0);
  let left = 0;
  for (let i = 0; i < nums.length; i++) {
    if (left === total - left - nums[i]) return i;
    left += nums[i];
  }
  return -1;
}
