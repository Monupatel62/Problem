class Solution {
public:
    bool isPowerOfTwoSimple(int n) {
        return n > 0 && (n & (n - 1)) == 0;
    }
};
