function countVowels(s) {
  let count = 0;
  for (const ch of s.toLowerCase()) if ('aeiou'.includes(ch)) count++;
  return count;
}
