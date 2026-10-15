function runningTotal(nums) {
  let sum = 0;
  return nums.map((value) => (sum += value));
}
