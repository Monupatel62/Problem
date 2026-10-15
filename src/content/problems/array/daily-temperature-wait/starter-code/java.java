class Solution {
    public int[] dailyTemperatureWait(int[] temperatures) {
        int[] ans = new int[temperatures.length];
        ArrayDeque<Integer> stack = new ArrayDeque<>();
        for (int i = 0; i < temperatures.length; i++) { while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) { int day = stack.pop(); ans[day] = i - day; } stack.push(i); }
        return ans;
    }
}
