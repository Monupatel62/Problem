class Solution {
public:
    vector<int> dailyTemperatureWait(vector<int>& temperatures) {
        vector<int> ans(temperatures.size(), 0), stack;
        for (int i = 0; i < (int)temperatures.size(); i++) { while (!stack.empty() && temperatures[i] > temperatures[stack.back()]) { int day = stack.back(); stack.pop_back(); ans[day] = i - day; } stack.push_back(i); }
        return ans;
    }
};
