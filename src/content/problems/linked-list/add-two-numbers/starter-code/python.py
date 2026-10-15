class Solution:
    def addTwoNumbers(self, l1_arr, l2_arr):
        # Build linked list from array
        class ListNode:
            def __init__(self, val=0, next=None):
                self.val = val
                self.next = next

        def make_list(arr):
            dummy = ListNode()
            cur = dummy
            for v in arr:
                cur.next = ListNode(v)
                cur = cur.next
            return dummy.next

        def list_to_array(node):
            res = []
            while node:
                res.append(node.val)
                node = node.next
            return res

        l1 = make_list(l1_arr)
        l2 = make_list(l2_arr)

        dummy = ListNode()
        cur = dummy
        carry = 0

        while l1 or l2 or carry:
            total = (l1.val if l1 else 0) + (l2.val if l2 else 0) + carry
            carry = total // 10
            cur.next = ListNode(total % 10)
            cur = cur.next
            if l1: l1 = l1.next
            if l2: l2 = l2.next

        return list_to_array(dummy.next)
