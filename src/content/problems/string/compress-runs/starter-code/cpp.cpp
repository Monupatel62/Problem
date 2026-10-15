class Solution {
public:
    string compressRuns(string s) {
        if (s.empty()) return "";
        string out;
        int count = 1;
        for (int i = 1; i <= (int)s.size(); i++) {
            if (i < (int)s.size() && s[i] == s[i - 1]) count++;
            else { out += s[i - 1]; out += to_string(count); count = 1; }
        }
        return out;
    }
};
