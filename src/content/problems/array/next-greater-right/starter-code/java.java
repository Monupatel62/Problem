class Solution {
    public int[] nextGreaterRight(int[] nums) {
        int[] ans = new int[nums.length];
        Arrays.fill(ans, -1);
        ArrayDeque<Integer> stack = new ArrayDeque<>();
        for (int i = nums.length - 1; i >= 0; i--) { while (!stack.isEmpty() && stack.peek() <= nums[i]) stack.pop(); if (!stack.isEmpty()) ans[i] = stack.peek(); stack.push(nums[i]); }
        return ans;
    }
}
