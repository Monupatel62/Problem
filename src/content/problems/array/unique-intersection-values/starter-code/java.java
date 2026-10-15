class Solution {
    public int[] uniqueIntersectionValues(int[] a, int[] b) {
        HashSet<Integer> seen = new HashSet<>();
        for (int value : a) seen.add(value);
        TreeSet<Integer> ansSet = new TreeSet<>();
        for (int value : b) if (seen.contains(value)) ansSet.add(value);
        int[] ans = new int[ansSet.size()];
        int i = 0;
        for (int value : ansSet) ans[i++] = value;
        return ans;
    }
}
