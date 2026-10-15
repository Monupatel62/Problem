class Solution {
    public int[] mergeSortedValues(int[] a, int[] b) {
        int[] ans = new int[a.length + b.length];
        int i = 0, j = 0, k = 0;
        while (i < a.length || j < b.length) {
            if (j == b.length || (i < a.length && a[i] <= b[j])) ans[k++] = a[i++];
            else ans[k++] = b[j++];
        }
        return ans;
    }
}
