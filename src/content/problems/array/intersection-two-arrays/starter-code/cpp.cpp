class Solution {
public:
    vector<int> intersection(vector<int>& nums1, vector<int>& nums2) {
        unordered_set<int> s(nums1.begin(), nums1.end()), res;
        for (int n : nums2) if (s.count(n)) res.insert(n);
        return vector<int>(res.begin(), res.end());
    }
};
