class Solution {
public:
    vector<vector<int>> mergeOverlappingRanges(vector<vector<int>>& intervals) {
        sort(intervals.begin(), intervals.end());
        vector<vector<int>> ans;
        for (auto current : intervals) {
            if (ans.empty() || ans.back()[1] < current[0]) ans.push_back(current);
            else ans.back()[1] = max(ans.back()[1], current[1]);
        }
        return ans;
    }
};
