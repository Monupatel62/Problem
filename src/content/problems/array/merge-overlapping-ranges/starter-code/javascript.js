function mergeOverlappingRanges(intervals) {
  intervals = intervals.map((row) => [...row]).sort((a, b) => a[0] - b[0]);
  const ans = [];
  for (const current of intervals) {
    if (ans.length === 0 || ans[ans.length - 1][1] < current[0]) ans.push(current);
    else ans[ans.length - 1][1] = Math.max(ans[ans.length - 1][1], current[1]);
  }
  return ans;
}
