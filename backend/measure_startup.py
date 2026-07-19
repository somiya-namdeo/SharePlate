import time
import psutil
import os
import sys

def get_memory_mb():
    process = psutil.Process(os.getpid())
    return process.memory_info().rss / (1024 * 1024)

def measure():
    print(f"Memory before import: {get_memory_mb():.2f} MB")
    
    start_time = time.time()
    from app.services.ai_service import AIService
    print(f"Memory after import (but before init): {get_memory_mb():.2f} MB")
    
    init_start = time.time()
    service = AIService()
    init_time = time.time() - init_start
    total_time = time.time() - start_time
    
    print(f"Memory after AIService(): {get_memory_mb():.2f} MB")
    print(f"Time to init AIService: {init_time:.2f} seconds")
    print(f"Total startup time: {total_time:.2f} seconds")

if __name__ == '__main__':
    measure()
