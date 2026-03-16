import time


class Timer:
    def __init__(self):
        self.start_time = None
        self.end_time = None
        self.elapsed = None

    def start(self):
        self.start_time = time.perf_counter()
        self.end_time = None
        self.elapsed = None

    def stop(self):
        self.end_time = time.perf_counter()
        self.elapsed = self.end_time - self.start_time
        return self.elapsed

    def get_elapsed_ms(self):
        if self.elapsed is None:
            return 0
        return round(self.elapsed * 1000, 3)   # convert to milliseconds

    def __repr__(self):
        if self.elapsed is None:
            return "Timer not run yet"
        return f"Time taken: {self.get_elapsed_ms()} ms"