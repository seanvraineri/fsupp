#!/usr/bin/env python3
"""
Continuous monitoring script for supplement search progress.
Tracks completion and provides regular updates.
"""

import time
import os
import subprocess
import re
from datetime import datetime

class SupplementProgressMonitor:
    def __init__(self):
        self.start_time = datetime.now()
        self.last_supplement = None
        self.total_supplements = 200
        self.current_index = 0
        self.links_found = 0
        self.total_links = 0
        
    def get_process_status(self):
        """Check if the supplement search process is running."""
        try:
            result = subprocess.run(
                ['ps', 'aux'], 
                capture_output=True, 
                text=True
            )
            
            for line in result.stdout.split('\n'):
                if 'auto_supplement_search_fixed.py' in line and 'grep' not in line:
                    return True
            return False
        except:
            return False
    
    def parse_latest_progress(self):
        """Parse the latest progress from log files."""
        try:
            # Check the main log file
            with open('search_output_WORKING.log', 'r') as f:
                lines = f.readlines()
                
            if not lines:
                return None
                
            # Find the latest supplement being processed
            processing_lines = [line for line in lines if 'Processing:' in line]
            if processing_lines:
                latest = processing_lines[-1]
                match = re.search(r'Processing: (.+)', latest)
                if match:
                    self.last_supplement = match.group(1)
                    self.current_index = len(processing_lines)
            
            # Count total links found
            found_lines = [line for line in lines if 'Found' in line and 'results for' in line]
            self.total_links = 0
            for line in found_lines:
                match = re.search(r'Found (\d+) results', line)
                if match:
                    self.total_links += int(match.group(1))
            
            # Check for completion indicators
            completion_indicators = [
                'supplement processing completed',
                'All supplements processed',
                'Processing finished'
            ]
            
            last_few_lines = ''.join(lines[-10:])
            for indicator in completion_indicators:
                if indicator.lower() in last_few_lines.lower():
                    return 'COMPLETED'
            
            return 'RUNNING'
            
        except FileNotFoundError:
            return 'NO_LOG'
        except Exception as e:
            return f'ERROR: {e}'
    
    def print_status_update(self):
        """Print current status update."""
        runtime = datetime.now() - self.start_time
        hours, remainder = divmod(runtime.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        
        print(f"\n🔄 **SUPPLEMENT SEARCH PROGRESS UPDATE**")
        print(f"⏰ Runtime: {hours:02d}:{minutes:02d}:{seconds:02d}")
        print(f"📊 Current: {self.last_supplement or 'Starting...'}")
        print(f"📈 Progress: {self.current_index}/{self.total_supplements} supplements")
        print(f"🔗 Links Found: {self.total_links} total links")
        print(f"📁 Completion: {(self.current_index/self.total_supplements)*100:.1f}%")
        print("=" * 60)
    
    def monitor_until_complete(self):
        """Monitor the process until completion."""
        print("🚀 Starting continuous monitoring of supplement search...")
        print("📊 Will update every 60 seconds until completion")
        print("=" * 60)
        
        while True:
            # Check if process is still running
            if not self.get_process_status():
                print("\n⚠️ **PROCESS STOPPED** - Checking for completion...")
                status = self.parse_latest_progress()
                
                if status == 'COMPLETED':
                    print("\n🎉 **SEARCH COMPLETED SUCCESSFULLY!**")
                    self.print_final_summary()
                    break
                else:
                    print(f"\n❌ **PROCESS ENDED UNEXPECTEDLY** - Status: {status}")
                    print("Check search_output_WORKING.log for details")
                    break
            
            # Parse current progress
            status = self.parse_latest_progress()
            
            if status == 'COMPLETED':
                print("\n🎉 **SEARCH COMPLETED SUCCESSFULLY!**")
                self.print_final_summary()
                break
            elif status == 'RUNNING':
                self.print_status_update()
            else:
                print(f"\n⚠️ Status: {status}")
            
            # Wait before next check
            time.sleep(60)  # Check every minute
    
    def print_final_summary(self):
        """Print final completion summary."""
        runtime = datetime.now() - self.start_time
        hours, remainder = divmod(runtime.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        
        print(f"\n🎊 **SUPPLEMENT SEARCH COMPLETED!**")
        print(f"📊 **FINAL STATISTICS:**")
        print(f"   ⏰ Total Runtime: {hours:02d}:{minutes:02d}:{seconds:02d}")
        print(f"   📈 Supplements Processed: {self.current_index}")
        print(f"   🔗 Total Links Found: {self.total_links}")
        print(f"   📁 Result Files: Check supplement_results_*.json")
        print(f"   💾 Database: Links saved to Supabase product_links table")
        print("=" * 60)
        print("✅ **YOU CAN NOW CHECK YOUR SUPPLEMENT CARDS!**")
        print("🔗 All supplement cards should now show actual purchase links!")

if __name__ == "__main__":
    monitor = SupplementProgressMonitor()
    try:
        monitor.monitor_until_complete()
    except KeyboardInterrupt:
        print("\n🛑 Monitoring stopped by user")
    except Exception as e:
        print(f"\n❌ Monitoring error: {e}") 