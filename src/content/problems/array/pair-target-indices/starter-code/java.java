class Solution {
    public int[] pairTargetIndices(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) return new int[]{seen.get(need), i};
            seen.putIfAbsent(nums[i], i);
        }
        return new int[]{};
    }
}
