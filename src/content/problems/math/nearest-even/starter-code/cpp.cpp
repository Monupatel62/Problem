class Solution {
public:
    int nearestEven(int n) {
        return n % 2 == 0 ? n : n + 1;
    }
};
