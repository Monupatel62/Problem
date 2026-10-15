// Helper: array → linked list
function makeList(arr) {
  let dummy = { val: 0, next: null };
  let cur = dummy;
  for (const v of arr) { cur.next = { val: v, next: null }; cur = cur.next; }
  return dummy.next;
}
// Helper: linked list → array
function listToArray(node) {
  const res = [];
  while (node) { res.push(node.val); node = node.next; }
  return res;
}

function addTwoNumbers(l1Arr, l2Arr) {
  let l1 = makeList(l1Arr);
  let l2 = makeList(l2Arr);

  let dummy = { val: 0, next: null };
  let cur = dummy;
  let carry = 0;

  while (l1 || l2 || carry) {
    const sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry;
    carry = Math.floor(sum / 10);
    cur.next = { val: sum % 10, next: null };
    cur = cur.next;
    if (l1) l1 = l1.next;
    if (l2) l2 = l2.next;
  }

  return listToArray(dummy.next);
}
