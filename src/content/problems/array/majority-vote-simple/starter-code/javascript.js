function majorityVoteSimple(nums) {
  let candidate = 0, count = 0;
  for (const value of nums) {
    if (count === 0) candidate = value;
    count += value === candidate ? 1 : -1;
  }
  return candidate;
}
