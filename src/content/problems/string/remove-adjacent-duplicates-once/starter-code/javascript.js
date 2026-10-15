function removeAdjacentDuplicatesOnce(s) {
  const stack = [];
  for (const ch of s) stack.at(-1) === ch ? stack.pop() : stack.push(ch);
  return stack.join('');
}
