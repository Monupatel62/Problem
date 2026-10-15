class NumArray {
  constructor(nums) {
    this.prefix = [0];
    for (const n of nums) this.prefix.push(this.prefix[this.prefix.length - 1] + n);
  }
  sumRange(left, right) {
    return this.prefix[right + 1] - this.prefix[left];
  }
}

// For judge: wrap as a function
function rangeSumQuery(nums, queries) {
  const obj = new NumArray(nums);
  return queries.map(([l, r]) => obj.sumRange(l, r));
}
