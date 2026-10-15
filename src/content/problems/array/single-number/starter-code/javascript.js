function singleNumber(nums) {
  return nums.reduce((acc, n) => acc ^ n, 0);
}
