class Solution {
public:
    int subarraySumEqualsTarget(vector<int>& nums, int target) {
        unordered_map<int, int> counts;
        counts[0] = 1;
        int prefix = 0, answer = 0;
        for (int value : nums) { prefix += value; answer += counts[prefix - target]; counts[prefix]++; }
        return answer;
    }
};
