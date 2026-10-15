function twoSum(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;
  while (left < right) {
    const s = numbers[left] + numbers[right];
    if (s === target) return [left + 1, right + 1];
    else if (s < target) left++;
    else right--;
  }
  return [];
}
