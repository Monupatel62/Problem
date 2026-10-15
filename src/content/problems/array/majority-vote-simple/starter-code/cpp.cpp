class Solution {
public:
    int majorityVoteSimple(vector<int>& nums) {
        int candidate = 0, count = 0;
        for (int value : nums) { if (count == 0) candidate = value; count += value == candidate ? 1 : -1; }
        return candidate;
    }
};
