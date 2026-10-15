function firstUniqueNumber(nums) {
  const freq = new Map();
  for (const value of nums) freq.set(value, (freq.get(value) || 0) + 1);
  for (const value of nums) if (freq.get(value) === 1) return value;
  return -1;
}
