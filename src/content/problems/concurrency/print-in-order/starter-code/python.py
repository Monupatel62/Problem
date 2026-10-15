import threading

class Foo:
    def __init__(self):
        self.sem2 = threading.Semaphore(0)  # blocks second until first done
        self.sem3 = threading.Semaphore(0)  # blocks third until second done

    def first(self, printFirst):
        printFirst()
        self.sem2.release()

    def second(self, printSecond):
        self.sem2.acquire()
        printSecond()
        self.sem3.release()

    def third(self, printThird):
        self.sem3.acquire()
        printThird()
