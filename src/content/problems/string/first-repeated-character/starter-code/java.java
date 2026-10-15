class Solution {
    public String firstRepeatedCharacter(String s) {
        Set<Character> seen = new HashSet<>();
        for (char ch : s.toCharArray()) { if (seen.contains(ch)) return String.valueOf(ch); seen.add(ch); }
        return "";
    }
}
