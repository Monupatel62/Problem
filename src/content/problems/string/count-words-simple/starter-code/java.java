class Solution {
    public int countWordsSimple(String sentence) {
        String trimmed = sentence.trim();
        if (trimmed.isEmpty()) return 0;
        return trimmed.split(" +").length;
    }
}
