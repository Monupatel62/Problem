class Solution {
    public int[] removeTargetValues(int[] nums, int target) {
        ArrayList<Integer> values = new ArrayList<>();
        for (int value : nums) if (value != target) values.add(value);
        int[] ans = new int[values.size()];
        for (int i = 0; i < values.size(); i++) ans[i] = values.get(i);
        return ans;
    }
}
