function replaceWithGreatestRight(nums) {
  const ans = Array(nums.length).fill(-1);
  let best = -1;
  for (let i = nums.length - 1; i >= 0; i--) {
    ans[i] = best;
    best = Math.max(best, nums[i]);
  }
  return ans;
}
