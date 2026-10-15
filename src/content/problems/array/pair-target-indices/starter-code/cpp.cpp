class Solution {
public:
    vector<int> pairTargetIndices(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int need = target - nums[i];
            if (seen.count(need)) return {seen[need], i};
            if (!seen.count(nums[i])) seen[nums[i]] = i;
        }
        return {};
    }
};
