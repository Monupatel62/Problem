class Solution {
    public int countVowels(String s) {
        int count = 0;
        for (char raw : s.toCharArray()) { char ch = Character.toLowerCase(raw); if ("aeiou".indexOf(ch) >= 0) count++; }
        return count;
    }
}
