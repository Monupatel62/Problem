class Solution {
    public int secondLargestDistinct(int[] nums) {
        Long first = null, second = null;
        for (int value : nums) {
            if ((first != null && value == first) || (second != null && value == second)) continue;
            if (first == null || value > first) { second = first; first = (long)value; }
            else if (second == null || value > second) second = (long)value;
        }
        return second == null ? -1 : second.intValue();
    }
}
