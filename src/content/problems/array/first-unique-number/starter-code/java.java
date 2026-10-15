class Solution {
    public int firstUniqueNumber(int[] nums) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (int value : nums) freq.put(value, freq.getOrDefault(value, 0) + 1);
        for (int value : nums) if (freq.get(value) == 1) return value;
        return -1;
    }
}
