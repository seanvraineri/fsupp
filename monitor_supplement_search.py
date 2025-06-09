#!/usr/bin/env python3
"""
Continuous monitoring script for the supplement search process.
Alerts user to issues and provides troubleshooting guidance.
"""

import os
import time
import subprocess
import psutil
from datetime import datetime

class SupplementSearchMonitor:
    def __init__(self):
        self.start_time = datetime.now()
        self.last_check = None
        self.process_pid = None
        self.issues_detected = []
        
    def find_search_process(self):
        """Find the supplement search process."""
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if proc.info['cmdline']:
                    cmdline = ' '.join(proc.info['cmdline'])
                    if ('run_supplement_search.py' in cmdline or 
                        'supplement_processor.py' in cmdline or 
                        'auto_supplement_search.py' in cmdline):
                        return proc.info['pid']
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return None
    
    def check_files(self):
        """Check for expected output files."""
        files_status = {
            'log_file': os.path.exists('supplement_search.log'),
            'result_files': len([f for f in os.listdir('.') if f.startswith('supplement_results_')]) > 0,
            'log_size': os.path.getsize('supplement_search.log') if os.path.exists('supplement_search.log') else 0
        }
        return files_status
    
    def get_recent_log_content(self, lines=10):
        """Get recent log content for analysis."""
        if os.path.exists('supplement_search.log'):
            try:
                with open('supplement_search.log', 'r') as f:
                    content = f.readlines()
                    return content[-lines:] if len(content) >= lines else content
            except Exception:
                return []
        return []
    
    def analyze_progress(self):
        """Analyze search progress from logs."""
        recent_logs = self.get_recent_log_content()
        
        # Look for success/failure patterns
        successes = len([line for line in recent_logs if '✅' in line or 'Found' in line and 'links' in line])
        failures = len([line for line in recent_logs if '❌' in line or 'ERROR' in line])
        processing = len([line for line in recent_logs if 'Processing:' in line])
        
        return {
            'recent_successes': successes,
            'recent_failures': failures,
            'recent_processing': processing,
            'last_activity': recent_logs[-1] if recent_logs else None
        }
    
    def print_status(self, status_type, message, action=None):
        """Print formatted status message."""
        icons = {
            'success': '✅',
            'warning': '⚠️',
            'error': '🚨',
            'info': 'ℹ️',
            'progress': '🔄'
        }
        
        timestamp = datetime.now().strftime('%H:%M:%S')
        print(f"[{timestamp}] {icons.get(status_type, '•')} {message}")
        
        if action:
            print(f"    → {action}")
    
    def monitor_loop(self):
        """Main monitoring loop."""
        print("🔍 Starting Supplement Search Monitor")
        print("=" * 60)
        
        iteration = 0
        
        while True:
            iteration += 1
            self.last_check = datetime.now()
            runtime = self.last_check - self.start_time
            
            print(f"\n📊 MONITOR CHECK #{iteration} (Runtime: {runtime})")
            print("-" * 40)
            
            # Check if process is running
            self.process_pid = self.find_search_process()
            
            if not self.process_pid:
                self.print_status('error', 
                    "Supplement search process not found!",
                    "Run: python run_supplement_search.py")
                return
            
            self.print_status('success', f"Process running (PID: {self.process_pid})")
            
            # Check files
            files = self.check_files()
            
            if not files['log_file']:
                if runtime.total_seconds() > 120:  # 2 minutes
                    self.print_status('warning',
                        "No log file after 2+ minutes",
                        "Check environment setup and dependencies")
                else:
                    self.print_status('info', "Log file not created yet (normal for first 1-2 min)")
            else:
                self.print_status('success', f"Log file exists ({files['log_size']} bytes)")
                
                # Analyze progress
                progress = self.analyze_progress()
                
                if progress['recent_processing'] > 0:
                    self.print_status('progress', f"Active processing detected ({progress['recent_processing']} supplements)")
                
                if progress['recent_successes'] > 0:
                    self.print_status('success', f"Recent successes: {progress['recent_successes']}")
                
                if progress['recent_failures'] > 0:
                    self.print_status('warning', f"Recent failures: {progress['recent_failures']}")
                
                if progress['last_activity']:
                    print(f"    Last activity: {progress['last_activity'].strip()}")
                
                # Check for stagnation
                if files['log_size'] > 0:
                    log_modified = datetime.fromtimestamp(os.path.getmtime('supplement_search.log'))
                    time_since_update = self.last_check - log_modified
                    
                    if time_since_update.total_seconds() > 300:  # 5 minutes
                        self.print_status('warning',
                            f"Log not updated for {time_since_update}",
                            "Process may be stuck - check SerpApi quota/connection")
            
            # Check result files
            if files['result_files']:
                self.print_status('success', "Result files detected - progress being saved!")
            
            # Memory/CPU check
            try:
                proc = psutil.Process(self.process_pid)
                memory_mb = proc.memory_info().rss / 1024 / 1024
                cpu_percent = proc.cpu_percent()
                
                if memory_mb > 500:  # 500MB
                    self.print_status('warning', f"High memory usage: {memory_mb:.1f}MB")
                
                if cpu_percent > 80:
                    self.print_status('warning', f"High CPU usage: {cpu_percent:.1f}%")
                    
            except psutil.NoSuchProcess:
                self.print_status('error', "Process disappeared during monitoring")
                return
            
            # Check for common issues
            if runtime.total_seconds() > 600 and not files['log_file']:  # 10 minutes
                self.print_status('error',
                    "CRITICAL: No progress after 10 minutes",
                    "Stop process and check: 1) SerpApi key, 2) Internet connection, 3) Dependencies")
                return
            
            # Wait before next check
            print(f"\n⏰ Next check in 30 seconds...")
            time.sleep(30)

def main():
    monitor = SupplementSearchMonitor()
    try:
        monitor.monitor_loop()
    except KeyboardInterrupt:
        print("\n\n🛑 Monitoring stopped by user")
    except Exception as e:
        print(f"\n💥 Monitor error: {e}")

if __name__ == "__main__":
    main() 