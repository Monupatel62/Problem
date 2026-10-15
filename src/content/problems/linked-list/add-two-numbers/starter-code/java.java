class Solution {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int v) { val = v; }
    }

    static ListNode makeList(int[] arr) {
        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;
        for (int v : arr) { cur.next = new ListNode(v); cur = cur.next; }
        return dummy.next;
    }

    // Input/output: int arrays representing linked list values in order
    public int[] addTwoNumbers(int[] l1Arr, int[] l2Arr) {
        ListNode l1 = makeList(l1Arr);
        ListNode l2 = makeList(l2Arr);

        ListNode dummy = new ListNode(0);
        ListNode cur = dummy;
        int carry = 0;

        while (l1 != null || l2 != null || carry != 0) {
            int sum = (l1 != null ? l1.val : 0) + (l2 != null ? l2.val : 0) + carry;
            carry = sum / 10;
            cur.next = new ListNode(sum % 10);
            cur = cur.next;
            if (l1 != null) l1 = l1.next;
            if (l2 != null) l2 = l2.next;
        }

        int len = 0;
        ListNode node = dummy.next;
        while (node != null) { len++; node = node.next; }
        int[] res = new int[len];
        node = dummy.next;
        for (int i = 0; i < len; i++) { res[i] = node.val; node = node.next; }
        return res;
    }
}
