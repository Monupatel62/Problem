class Solution {
public:
    int firstUniqueNumber(vector<int>& nums) {
        unordered_map<int, int> freq;
        for (int value : nums) freq[value]++;
        for (int value : nums) if (freq[value] == 1) return value;
        return -1;
    }
};
