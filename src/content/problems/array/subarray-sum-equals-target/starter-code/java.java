class Solution {
    public int subarraySumEqualsTarget(int[] nums, int target) {
        Map<Integer, Integer> counts = new HashMap<>();
        counts.put(0, 1);
        int prefix = 0, answer = 0;
        for (int value : nums) {
            prefix += value;
            answer += counts.getOrDefault(prefix - target, 0);
            counts.put(prefix, counts.getOrDefault(prefix, 0) + 1);
        }
        return answer;
    }
}
