function moveZeroes(nums) {
  let pos = 0;
  for (const n of nums) {
    if (n !== 0) nums[pos++] = n;
  }
  while (pos < nums.length) nums[pos++] = 0;
  return nums;
}
