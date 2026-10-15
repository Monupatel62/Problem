class Solution {
public:
    vector<int> mergeSortedValues(vector<int>& a, vector<int>& b) {
        vector<int> ans;
        int i = 0, j = 0;
        while (i < (int)a.size() || j < (int)b.size()) {
            if (j == (int)b.size() || (i < (int)a.size() && a[i] <= b[j])) ans.push_back(a[i++]);
            else ans.push_back(b[j++]);
        }
        return ans;
    }
};
