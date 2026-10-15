class Solution {
public:
    string firstRepeatedCharacter(string s) {
        unordered_set<char> seen;
        for (char ch : s) { if (seen.count(ch)) return string(1, ch); seen.insert(ch); }
        return "";
    }
};
