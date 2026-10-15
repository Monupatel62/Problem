class Solution:
    def findMedianSortedArrays(self, nums1, nums2):
        merged = sorted(nums1 + nums2)
        mid = len(merged) // 2
        if len(merged) % 2 == 1:
            return merged[mid]
        return (merged[mid - 1] + merged[mid]) / 2
