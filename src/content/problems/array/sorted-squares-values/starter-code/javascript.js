function sortedSquaresValues(nums) {
  const ans = Array(nums.length);
  let left = 0, right = nums.length - 1;
  for (let index = nums.length - 1; index >= 0; index--) {
    if (Math.abs(nums[left]) > Math.abs(nums[right])) ans[index] = nums[left] * nums[left++];
    else ans[index] = nums[right] * nums[right--];
  }
  return ans;
}
