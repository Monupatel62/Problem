function rangeSumBasic(nums, left, right) {
  let sum = 0;
  for (let i = left; i <= right; i++) sum += nums[i];
  return sum;
}
