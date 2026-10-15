class Solution {
public:
    bool isSoftPalindrome(string s) {
        string cleaned;
        for (char ch : s) if (ch != ' ') cleaned += tolower(ch);
        string rev = cleaned;
        reverse(rev.begin(), rev.end());
        return cleaned == rev;
    }
};
