class Solution {
public:
    // Input/output: vectors representing linked list values in order
    vector<int> addTwoNumbers(vector<int>& l1Arr, vector<int>& l2Arr) {
        struct ListNode {
            int val;
            ListNode* next;
            ListNode(int v) : val(v), next(nullptr) {}
        };

        auto makeList = [](vector<int>& arr) -> ListNode* {
            ListNode dummy(0);
            ListNode* cur = &dummy;
            for (int v : arr) { cur->next = new ListNode(v); cur = cur->next; }
            return dummy.next;
        };

        ListNode* l1 = makeList(l1Arr);
        ListNode* l2 = makeList(l2Arr);

        ListNode dummy(0);
        ListNode* cur = &dummy;
        int carry = 0;

        while (l1 || l2 || carry) {
            int sum = (l1 ? l1->val : 0) + (l2 ? l2->val : 0) + carry;
            carry = sum / 10;
            cur->next = new ListNode(sum % 10);
            cur = cur->next;
            if (l1) l1 = l1->next;
            if (l2) l2 = l2->next;
        }

        vector<int> res;
        ListNode* node = dummy.next;
        while (node) { res.push_back(node->val); node = node->next; }
        return res;
    }
};
