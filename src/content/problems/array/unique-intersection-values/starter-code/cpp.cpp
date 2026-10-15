class Solution {
public:
    vector<int> uniqueIntersectionValues(vector<int>& a, vector<int>& b) {
        unordered_set<int> seen(a.begin(), a.end()), added;
        vector<int> ans;
        for (int value : b) if (seen.count(value) && !added.count(value)) { ans.push_back(value); added.insert(value); }
        sort(ans.begin(), ans.end());
        return ans;
    }
};
