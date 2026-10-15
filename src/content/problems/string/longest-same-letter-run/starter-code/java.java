class Solution {
    public int longestSameLetterRun(String s) {
        int best = 0, current = 0;
        char prev = 0;
        for (char ch : s.toCharArray()) { current = ch == prev ? current + 1 : 1; prev = ch; best = Math.max(best, current); }
        return best;
    }
}
