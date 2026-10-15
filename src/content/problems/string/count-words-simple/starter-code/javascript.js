function countWordsSimple(sentence) {
  return sentence.trim() ? sentence.trim().split(/ +/).length : 0;
}
