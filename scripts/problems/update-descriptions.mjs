/**
 * Update all problem descriptions in bank.ts with well-formatted content.
 * Run: node scripts/problems/update-descriptions.mjs
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bankPath = path.join(__dirname, "../../src/lib/problems/bank.ts");

// Well-formatted descriptions for all 94 problems
const descriptions = {
  "two-sum": "Given an integer array `nums` and an integer `target`, return the **indices** of the two numbers that add up to `target`.\n\nReturn them as `[i, j]` with the smaller index first. Each input has exactly one valid answer, and you may not use the same element twice.",

  "add-two-numbers": "You are given two non-empty linked lists representing non-negative integers stored in **reverse order** (ones digit first). Add the two numbers and return the sum as a linked list in the same format.\n\nIn this workspace, linked lists are passed and returned as **arrays**. `[2,4,3]` represents the number 342, so `[2,4,3] + [5,6,4]` = `[7,0,8]` (807).",

  "longest-substring": "Given a string `s`, return the **length** of the longest substring without repeating characters.\n\nA **substring** is a contiguous sequence of characters — not a subsequence.",

  "median-two-arrays": "Given two sorted arrays `nums1` and `nums2`, return the **median** of the two arrays combined.\n\nThe overall run time must be `O(log(m + n))`.",

  "pair-target-indices": "Given an integer array `nums` and an integer `target`, return the **indices** of the first pair of elements that add up to `target`.\n\nIf no such pair exists, return an empty array.",

  "running-total": "Given an integer array `nums`, return a **new array** where each element at index `i` equals the sum of all elements from `nums[0]` to `nums[i]`.\n\nThis is called a **prefix sum**.",

  "count-strictly-greater": "Given an integer array `nums` and an integer `threshold`, return the **count** of elements that are strictly greater than `threshold`.",

  "first-unique-number": "Given an integer array `nums`, return the **first element** that appears exactly once.\n\nIf all elements appear more than once, return `-1`.",

  "move-negatives-left": "Given an integer array `nums`, return a **new array** where all negative numbers appear before all non-negative numbers.\n\nPreserve the **relative order** within each group.",

  "longest-even-streak": "Given an integer array `nums`, return the **length** of the longest contiguous subarray where every element is even.\n\nIf no even element exists, return `0`.",

  "maximum-neighbor-gap": "Given an integer array `nums`, return the **largest absolute difference** between any two adjacent elements.\n\nIf the array has fewer than two elements, return `0`.",

  "count-balanced-prefixes": "Given a binary array containing only `1` and `-1`, return the number of **prefixes** whose total sum equals zero.\n\nA balanced prefix has equal counts of `1` and `-1`.",

  "rotate-right-once": "Given an array `nums`, return a **new array** formed by moving the last element to the front.\n\nIf the array is empty, return an empty array.",

  "missing-zero-to-n": "Given an array `nums` of `n` distinct integers in the range `[0, n]` with exactly one value missing, return the **missing number**.",

  "reverse-clean-string": "Given a string `s`, return the **reverse** of `s` after removing all space characters.\n\nOnly spaces are removed — all other characters stay.",

  "count-vowels": "Given a string `s`, return the **number of vowels** (`a`, `e`, `i`, `o`, `u`).\n\nTreat uppercase and lowercase vowels as equal.",

  "is-soft-palindrome": "Given a string `s`, return `true` if `s` reads the same forwards and backwards after **ignoring spaces and letter case**.",

  "first-repeated-character": "Given a string `s`, return the **first character** that appears for the second time, scanning left to right.\n\nIf no character repeats, return an empty string.",

  "compress-runs": "Given a string `s` of lowercase letters, **compress consecutive runs** of the same character into the character followed by its run length.\n\nExample: `\"aaabbc\"` → `\"a3b2c1\"`.",

  "longest-same-letter-run": "Given a string `s`, return the **length of the longest run** of consecutive identical characters.\n\nExample: in `\"aabbbcc\"` the longest run is `3`.",

  "count-words-simple": "Given a string `s` with words separated by spaces, return the **number of words**.\n\nWords are non-empty groups of characters delimited by spaces.",

  "remove-adjacent-duplicates-once": "Given a string `s`, repeatedly **remove adjacent duplicate pairs** until no two adjacent characters are the same.\n\nReturn the final string.",

  "digital-sum": "Given a non-negative integer `n`, return the **sum of its digits**.\n\nExample: `123` → `1 + 2 + 3 = 6`.",

  "is-power-of-two-simple": "Given an integer `n`, return `true` if `n` is a **positive power of two** (`1, 2, 4, 8, ...`), otherwise `false`.",

  "gcd-of-two": "Given two non-negative integers `a` and `b`, return their **Greatest Common Divisor** — the largest integer that divides both without remainder.",

  "nearest-even": "Given an integer `n`, return `n` if even, otherwise return the **nearest even integer greater than** `n`.",

  "matrix-diagonal-sum": "Given a square `n × n` matrix, return the **sum of elements on both diagonals**.\n\nIf `n` is odd, the center element is shared — count it only once.",

  "count-island-cells": "Given a 2D grid where `1` = land and `0` = water, return the **total number of land cells**.",

  "transpose-square": "Given a square `n × n` matrix, return its **transpose** — a new matrix where `result[i][j] = matrix[j][i]`.",

  "sum-positive-values": "Given an integer array `nums`, return the **sum of all positive values** (strictly greater than zero).",

  "count-local-peaks": "Given an integer array `nums`, return the **number of local peaks**.\n\nAn element is a local peak if it is strictly greater than both its immediate neighbors. The first and last elements cannot be peaks.",

  "replace-with-greatest-right": "Given an integer array `nums`, replace each element with the **greatest element to its right**.\n\nSet the last element to `-1`.",

  "second-largest-distinct": "Given an integer array `nums`, return the **second largest distinct value**.\n\nIf no second largest exists, return `-1`.",

  "remove-target-values": "Given an integer array `nums` and an integer `target`, return a **new array** with all occurrences of `target` removed, preserving order.",

  "merge-sorted-values": "Given two sorted integer arrays `a` and `b`, return a **single sorted array** containing all elements from both.\n\nMerge them in a single pass without using a sort function.",

  "sorted-squares-values": "Given a sorted (non-decreasing) integer array `nums`, return a **new sorted array** of the squares of each element.",

  "max-consecutive-ones-simple": "Given a binary array `nums` of `0`s and `1`s, return the **maximum number of consecutive `1`s**.",

  "find-pivot-index-simple": "Given an integer array `nums`, return the **leftmost pivot index** where the sum to its left equals the sum to its right.\n\nReturn `-1` if no such index exists. The pivot element is not included in either sum.",

  "range-sum-basic": "Given an integer array `nums` and two indices `left` and `right`, return the **sum of elements** from index `left` to `right` inclusive.",

  "unique-intersection-values": "Given two integer arrays `a` and `b`, return a **sorted array of distinct values** that appear in both arrays.",

  "majority-vote-simple": "Given an integer array `nums` where one element appears **more than half** the time, return that **majority element**.",

  "max-sum-window": "Given an integer array `nums` and an integer `k`, return the **maximum sum** of any contiguous subarray of exactly `k` elements.",

  "min-length-subarray-sum": "Given an array of **positive integers** `nums` and a positive integer `target`, return the **minimum length** of a contiguous subarray with sum ≥ `target`.\n\nReturn `0` if no such subarray exists.",

  "subarray-sum-equals-target": "Given an integer array `nums` and an integer `k`, return the **number of contiguous subarrays** whose sum equals exactly `k`.",

  "longest-balanced-zero-one": "Given a binary array of `0`s and `1`s, return the **length of the longest contiguous subarray** with an equal number of `0`s and `1`s.",

  "three-number-zero": "Given an integer array `nums`, return all **unique triplets** `[a, b, c]` such that `a + b + c == 0`.\n\nThe result must not contain duplicate triplets.",

  "product-except-self-basic": "Given an integer array `nums`, return an array where each element is the **product of all other elements** in `nums`.\n\nSolve it without using division.",

  "merge-overlapping-ranges": "Given an array of intervals `[start, end]`, **merge all overlapping intervals** and return the resulting non-overlapping intervals sorted by start.",

  "container-water-basic": "Given an array `height` where each value is the height of a vertical bar, find two bars that form a container holding the **most water**.\n\nReturn the **maximum water** the container can hold.",

  "next-greater-right": "Given an integer array `nums`, for each element return the **first strictly greater element to its right**.\n\nIf none exists, output `-1` for that position.",

  "daily-temperature-wait": "Given an integer array `temperatures`, return an array where each element is the number of days to wait until a **warmer day**.\n\nIf no warmer day exists, output `0`.",

  "best-time-buy-sell": "Given an array `prices` where `prices[i]` is the stock price on day `i`, return the **maximum profit** from one buy and one later sell.\n\nReturn `0` if no profit is possible.",

  "contains-duplicate": "Given an integer array `nums`, return `true` if **any value appears more than once**, or `false` if all elements are distinct.",

  "majority-element": "Given an integer array `nums`, return the **majority element** — the value that appears more than `⌊n/2⌋` times.\n\nA majority element always exists in the input.",

  "rotate-array": "Given an integer array `nums` and a non-negative integer `k`, rotate the array **right by `k` steps** in-place.\n\nReturn the modified array.",

  "find-all-duplicates": "Given an integer array where `1 ≤ nums[i] ≤ n` and each integer appears **once or twice**, return all elements that appear **exactly twice**.",

  "maximum-subarray": "Given an integer array `nums`, find the **contiguous subarray** with the largest sum and return that sum.\n\nThe subarray must have at least one element.",

  "intersection-two-arrays": "Given two integer arrays `nums1` and `nums2`, return an array of their **intersection** — the unique elements that appear in both.\n\nResult may be in any order.",

  "move-zeroes": "Given an integer array `nums`, move all `0`s to the **end** while keeping the **relative order** of non-zero elements.\n\nModify the array in-place.",

  "plus-one": "Given a non-negative integer represented as a digit array (most significant first), **add one** to the integer and return the updated digit array.",

  "missing-number": "Given an array `nums` of `n` distinct integers in the range `[0, n]`, return the **one missing number** from that range.",

  "find-minimum-rotated": "A sorted array of unique integers may be **rotated** at some unknown pivot. Return its **minimum element**.\n\nSolve in `O(log n)` time.",

  "single-number": "Given an integer array where every element appears **exactly twice except one**, return that **single non-duplicate element**.\n\nUse `O(n)` time and `O(1)` space.",

  "search-rotated-array": "A sorted array may have been **rotated** at an unknown pivot. Given the rotated array `nums` and a `target`, return the **index** of `target`, or `-1` if not found.\n\nMust run in `O(log n)` time.",

  "k-closest-numbers": "Given an array of 2D `points` and an integer `k`, return the `k` points **closest to the origin** `(0, 0)` by Euclidean distance.\n\nReturn in any order.",

  "two-sum-ii": "Given a **1-indexed** sorted integer array `numbers` and a `target`, return the **1-based indices** `[i, j]` of the two numbers that add up to `target`.\n\nUse only `O(1)` extra space.",

  "sort-colors": "Given an array `nums` with only values `0`, `1`, and `2`, sort it **in-place** so all `0`s come first, then `1`s, then `2`s.\n\nDo not use a built-in sort function.",

  "4sum": "Given an integer array `nums` and a `target`, return all **unique quadruplets** `[a, b, c, d]` where `a + b + c + d == target`.\n\nNo duplicate quadruplets allowed.",

  "jump-game": "Given an integer array `nums` where `nums[i]` is your **maximum jump length** from index `i`, return `true` if you can reach the last index from index `0`.",

  "subarray-product-less-k": "Given an array of **positive integers** `nums` and an integer `k`, return the number of contiguous subarrays where the **product of all elements is strictly less than** `k`.",

  "range-sum-query-immutable": "Given an integer array `nums` and a list of range `queries`, each query asks for the **sum of elements** between indices `left` and `right` (inclusive).\n\nReturn an array of answers.",

  "spiral-matrix": "Given an `m × n` matrix, return all elements in **spiral order** — traversing right, down, left, up, repeating inward.",

  "combine-two-tables": "Write a SQL query to report the **first name, last name, city, and state** of each person.\n\nIf a person has no address, report `null` for city and state.",

  "customers-who-never-order": "Write a SQL query to find all **customers who never placed an order**.\n\nReturn only the customer names.",

  "word-frequency": "Given a text file `words.txt`, write a **bash pipeline** that counts word frequency and outputs each word with its count, sorted by frequency **descending**.",

  "print-in-order": "Implement a class `Foo` with methods `first`, `second`, and `third`. When called by three concurrent threads, they must always execute in order: **first → second → third**.",

  "cyclically-rotating-a-grid": "Given an `m × n` integer grid (both dimensions even), cyclically rotate each layer **clockwise by `k` positions**.\n\nReturn the resulting grid.",

  "select-all-employees": "Write a SQL query to find employees who earn **more than their manager**.\n\nReturn the employee names.",

  "second-highest-salary": "Write a SQL query to find the **second highest distinct salary**.\n\nReturn `null` if fewer than two distinct salaries exist.",

  "duplicate-emails": "Write a SQL query to report all **email addresses** that appear more than once in the `Person` table.",

  "department-highest-salary": "Write a SQL query to find the **employee(s) with the highest salary in each department**.\n\nReturn the department name, employee name, and their salary.",

  "rank-scores": "Write a SQL query to **rank scores** in descending order using **dense rank** — tied scores get the same rank, and no rank is skipped.",

  "consecutive-numbers": "Write a SQL query to find all numbers that appear **at least three times consecutively** in the `Logs` table.\n\nReturn each such number once.",

  "delete-duplicate-emails": "Write a SQL statement to **delete duplicate emails**, keeping only the row with the **smallest `id`** for each email.",

  "rising-temperature": "Write a SQL query to find all record `id`s where the temperature was **higher than the previous day**.",

  "nth-highest-salary": "Write a SQL function to find the **Nth highest distinct salary**.\n\nReturn `null` if fewer than `N` distinct salaries exist.",

  "valid-phone-numbers": "Given `file.txt` with phone numbers (one per line), write a **bash script** to output only **valid numbers** matching `(xxx) xxx-xxxx` or `xxx-xxx-xxxx`.",

  "transpose-file": "Given a text file `file.txt`, write a **bash script** to transpose its content — rows become columns and columns become rows.",

  "tenth-line": "Given a text file `file.txt`, write a **bash script** to print only the **10th line**.\n\nIf the file has fewer than 10 lines, print nothing.",

  "count-lines-matching-pattern": "Given a text file `file.txt`, write a **bash script** to count lines containing the word `\"error\"` (case-insensitive).",

  "print-foobar-alternately": "Implement a class `FooBar` where Thread A calls `foo()` and Thread B calls `bar()`. They must alternate to produce `\"foobarfoobar...\"` exactly `n` times.",

  "building-h2o": "Design a barrier where hydrogen and oxygen threads synchronize to form water molecules.\n\nEvery **2 hydrogen + 1 oxygen** threads must release together as a complete molecule.",

  "the-dining-philosophers": "Five philosophers share five forks around a circular table. Each needs **both adjacent forks** to eat.\n\nDesign a **deadlock-free** solution.",

  "fizz-buzz-multithreaded": "Implement multithreaded FizzBuzz with **four threads** — one each for `fizz`, `buzz`, `fizzbuzz`, and plain numbers — producing the correct sequence from 1 to `n`.",
};

let bankContent = readFileSync(bankPath, "utf8");

let updated = 0;
let failed = 0;

for (const [slug, newDesc] of Object.entries(descriptions)) {
  // Find the slug in bank.ts, then find the next "description": "..." after it
  const slugIndex = bankContent.indexOf(`"slug": "${slug}"`);
  if (slugIndex === -1) {
    console.log(`❌ Slug not found: ${slug}`);
    failed++;
    continue;
  }

  // Find "description": after this slug
  const descKeyIndex = bankContent.indexOf(`"description":`, slugIndex);
  if (descKeyIndex === -1) {
    console.log(`❌ Description not found for: ${slug}`);
    failed++;
    continue;
  }

  // Find the opening quote of the description value
  const openQuoteIndex = bankContent.indexOf(`"`, descKeyIndex + 14); // after "description":
  if (openQuoteIndex === -1) {
    console.log(`❌ Open quote not found for: ${slug}`);
    failed++;
    continue;
  }

  // Find the closing quote — handle escaped quotes
  let closeQuoteIndex = openQuoteIndex + 1;
  while (closeQuoteIndex < bankContent.length) {
    if (bankContent[closeQuoteIndex] === '"' && bankContent[closeQuoteIndex - 1] !== '\\') break;
    closeQuoteIndex++;
  }

  if (closeQuoteIndex >= bankContent.length) {
    console.log(`❌ Close quote not found for: ${slug}`);
    failed++;
    continue;
  }

  // Build escaped description
  const escapedDesc = newDesc
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");

  // Replace the old description with the new one
  bankContent =
    bankContent.slice(0, openQuoteIndex + 1) +
    escapedDesc +
    bankContent.slice(closeQuoteIndex);

  updated++;
  process.stdout.write(`\r✅ ${updated}/${Object.keys(descriptions).length}: ${slug}        `);
}

writeFileSync(bankPath, bankContent, "utf8");
console.log(`\n\nDone! Updated: ${updated}, Failed: ${failed}`);
