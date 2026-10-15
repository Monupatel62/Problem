function nextGreaterRight(nums) {
  const ans = Array(nums.length).fill(-1);
  const stack = [];
  for (let i = nums.length - 1; i >= 0; i--) {
    while (stack.length && stack[stack.length - 1] <= nums[i]) stack.pop();
    if (stack.length) ans[i] = stack[stack.length - 1];
    stack.push(nums[i]);
  }
  return ans;
}
