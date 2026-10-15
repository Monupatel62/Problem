function isSoftPalindrome(s) {
  const cleaned = s.toLowerCase().replaceAll(' ', '');
  return cleaned === cleaned.split('').reverse().join('');
}
