class Solution {
    public String compressRuns(String s) {
        if (s.isEmpty()) return "";
        StringBuilder out = new StringBuilder();
        int count = 1;
        for (int i = 1; i <= s.length(); i++) {
            if (i < s.length() && s.charAt(i) == s.charAt(i - 1)) count++;
            else { out.append(s.charAt(i - 1)).append(count); count = 1; }
        }
        return out.toString();
    }
}
