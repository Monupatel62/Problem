function mergeSortedValues(a, b) {
  const ans = [];
  let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (j === b.length || (i < a.length && a[i] <= b[j])) ans.push(a[i++]);
    else ans.push(b[j++]);
  }
  return ans;
}
