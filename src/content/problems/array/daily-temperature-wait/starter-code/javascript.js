function dailyTemperatureWait(temperatures) {
  const ans = Array(temperatures.length).fill(0);
  const stack = [];
  for (let i = 0; i < temperatures.length; i++) {
    while (stack.length && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const day = stack.pop();
      ans[day] = i - day;
    }
    stack.push(i);
  }
  return ans;
}
