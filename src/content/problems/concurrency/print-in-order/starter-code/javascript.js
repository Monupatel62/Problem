// Concurrency problems are tested via Python threading.
// Implement your solution in the Python tab.
// This JavaScript stub is kept for display purposes only.

// Python solution using threading.Semaphore:
//
// import threading
// class Foo:
//     def __init__(self):
//         self.sem2 = threading.Semaphore(0)
//         self.sem3 = threading.Semaphore(0)
//     def first(self, printFirst):
//         printFirst()
//         self.sem2.release()
//     def second(self, printSecond):
//         self.sem2.acquire()
//         printSecond()
//         self.sem3.release()
//     def third(self, printThird):
//         self.sem3.acquire()
//         printThird()
