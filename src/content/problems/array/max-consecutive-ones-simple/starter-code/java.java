class Solution {
    public int maxConsecutiveOnesSimple(int[] nums) {
        int best = 0, current = 0;
        for (int value : nums) { current = value == 1 ? current + 1 : 0; best = Math.max(best, current); }
        return best;
    }
}
