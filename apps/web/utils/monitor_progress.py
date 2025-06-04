#!/usr/bin/env python3
import os
import time
import json

def monitor_progress():
    """Monitor the progress of supplement search"""
    print("Monitoring supplement search progress...")
    print("Press Ctrl+C to stop monitoring\n")
    
    last_count = 0
    start_time = time.time()
    
    while True:
        try:
            # Check for JSON file
            if os.path.exists('supplement_products.json'):
                with open('supplement_products.json', 'r') as f:
                    data = json.load(f)
                    current_count = len(data)
                    
                if current_count != last_count:
                    elapsed = int(time.time() - start_time)
                    print(f"[{elapsed}s] Processed {current_count}/200 supplements")
                    
                    # Show last few supplements processed
                    if current_count > 0:
                        recent = list(data.keys())[-3:]
                        print(f"  Recent: {', '.join(recent)}")
                    
                    last_count = current_count
                    
                    # Estimate completion time
                    if current_count > 0:
                        rate = elapsed / current_count
                        remaining = (200 - current_count) * rate
                        print(f"  Estimated time remaining: {int(remaining)}s ({int(remaining/60)}m)")
            else:
                elapsed = int(time.time() - start_time)
                print(f"[{elapsed}s] Waiting for first batch to complete (saves every 10 supplements)...")
            
            # Check every 5 seconds
            time.sleep(5)
            
        except KeyboardInterrupt:
            print("\nMonitoring stopped.")
            break
        except Exception as e:
            print(f"Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    monitor_progress() 
