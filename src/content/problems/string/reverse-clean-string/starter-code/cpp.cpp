class Solution {
public:
    string reverseCleanString(string s) {
        string cleaned;
        for (char ch : s) if (ch != ' ') cleaned += ch;
        reverse(cleaned.begin(), cleaned.end());
        return cleaned;
    }
};
