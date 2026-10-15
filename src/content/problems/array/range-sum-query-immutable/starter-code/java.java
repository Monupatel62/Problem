class Solution {
    public int[] rangeSumQuery(int[] nums, int[][] queries) {
        int[] prefix = new int[nums.length + 1];
        for (int i = 0; i < nums.length; i++) prefix[i+1] = prefix[i] + nums[i];
        int[] result = new int[queries.length];
        for (int i = 0; i < queries.length; i++)
            result[i] = prefix[queries[i][1]+1] - prefix[queries[i][0]];
        return result;
    }
}
