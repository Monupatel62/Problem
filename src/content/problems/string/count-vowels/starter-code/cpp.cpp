class Solution {
public:
    int countVowels(string s) {
        int count = 0;
        for (char ch : s) { ch = tolower(ch); if (string("aeiou").find(ch) != string::npos) count++; }
        return count;
    }
};
