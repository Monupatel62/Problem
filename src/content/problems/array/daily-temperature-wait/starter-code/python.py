class Solution:
    def dailyTemperatureWait(self, temperatures):
        ans = [0] * len(temperatures)
        stack = []
        for i, value in enumerate(temperatures):
            while stack and value > temperatures[stack[-1]]:
                day = stack.pop()
                ans[day] = i - day
            stack.append(i)
        return ans
