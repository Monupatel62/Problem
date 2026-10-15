function moveNegativesLeft(nums) {
  return nums.filter((value) => value < 0).concat(nums.filter((value) => value >= 0));
}
