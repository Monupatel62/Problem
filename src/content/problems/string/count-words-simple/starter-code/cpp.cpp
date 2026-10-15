class Solution {
public:
    int countWordsSimple(string sentence) {
        stringstream ss(sentence);
        string word;
        int count = 0;
        while (ss >> word) count++;
        return count;
    }
};
