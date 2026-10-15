class Solution {
    public double findMedianSortedArrays(int[] nums1, int[] nums2) {
        int[] merged = new int[nums1.length + nums2.length];
        int index = 0;
        for (int value : nums1) merged[index++] = value;
        for (int value : nums2) merged[index++] = value;
        Arrays.sort(merged);
        int mid = merged.length / 2;
        if (merged.length % 2 == 1) return merged[mid];
        return (merged[mid - 1] + merged[mid]) / 2.0;
    }
}
