function numSubarrayProductLessThanK(nums, k) {
  if (k <= 1) return 0;
  let product = 1, count = 0, left = 0;
  for (let right = 0; right < nums.length; right++) {
    product *= nums[right];
    while (product >= k) product /= nums[left++];
    count += right - left + 1;
  }
  return count;
}
