class Solution {
public:
    string removeAdjacentDuplicatesOnce(string s) {
        string stack;
        for (char ch : s) { if (!stack.empty() && stack.back() == ch) stack.pop_back(); else stack.push_back(ch); }
        return stack;
    }
};
