class Solution {
    public boolean isSoftPalindrome(String s) {
        StringBuilder cleaned = new StringBuilder();
        for (char ch : s.toCharArray()) if (ch != ' ') cleaned.append(Character.toLowerCase(ch));
        return cleaned.toString().equals(cleaned.reverse().toString());
    }
}
