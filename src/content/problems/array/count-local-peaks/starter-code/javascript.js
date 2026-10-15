function countLocalPeaks(nums) {
  let count = 0;
  for (let i = 1; i + 1 < nums.length; i++) {
    if (nums[i] > nums[i - 1] && nums[i] > nums[i + 1]) count++;
  }
  return count;
}
