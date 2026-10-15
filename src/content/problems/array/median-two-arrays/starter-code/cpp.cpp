class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        vector<int> merged = nums1;
        merged.insert(merged.end(), nums2.begin(), nums2.end());
        sort(merged.begin(), merged.end());
        int mid = merged.size() / 2;
        if (merged.size() % 2 == 1) return merged[mid];
        return (merged[mid - 1] + merged[mid]) / 2.0;
    }
};
