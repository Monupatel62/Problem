function sumPositiveValues(nums) {
  let sum = 0;
  for (const value of nums) if (value > 0) sum += value;
  return sum;
}
