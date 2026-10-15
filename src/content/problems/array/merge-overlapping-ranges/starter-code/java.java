class Solution {
    public int[][] mergeOverlappingRanges(int[][] intervals) {
        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));
        ArrayList<int[]> merged = new ArrayList<>();
        for (int[] current : intervals) {
            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < current[0]) merged.add(current.clone());
            else merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], current[1]);
        }
        int[][] ans = new int[merged.size()][2];
        for (int i = 0; i < merged.size(); i++) ans[i] = merged.get(i);
        return ans;
    }
}
