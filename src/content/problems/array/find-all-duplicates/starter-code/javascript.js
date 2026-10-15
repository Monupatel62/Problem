function findDuplicates(nums) {
  const result = [];
  for (const n of nums) {
    const idx = Math.abs(n) - 1;
    if (nums[idx] < 0) result.push(Math.abs(n));
    else nums[idx] = -nums[idx];
  }
  return result;
}
