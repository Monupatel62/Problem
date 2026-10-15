# Write your bash solution below.
# Input file: words.txt (words separated by spaces/newlines)
# Output: count word (descending by count), one per line

tr -s '[:space:]' '\n' < words.txt | sort | uniq -c | sort -k1,1nr -k2,2 | awk '{print $1, $2}'
