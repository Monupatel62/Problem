class Solution {
    public String reverseCleanString(String s) {
        StringBuilder cleaned = new StringBuilder();
        for (char ch : s.toCharArray()) if (ch != ' ') cleaned.append(ch);
        return cleaned.reverse().toString();
    }
}
