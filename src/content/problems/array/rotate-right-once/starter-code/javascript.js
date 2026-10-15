function rotateRightOnce(nums) {
  if (nums.length <= 1) return nums;
  return [nums[nums.length - 1], ...nums.slice(0, -1)];
}
