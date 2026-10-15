class Solution {
public:
    int secondLargestDistinct(vector<int>& nums) {
        long long first = LLONG_MIN, second = LLONG_MIN;
        for (int value : nums) {
            if (value == first || value == second) continue;
            if (value > first) { second = first; first = value; }
            else if (value > second) second = value;
        }
        return second == LLONG_MIN ? -1 : (int)second;
    }
};
