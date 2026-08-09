#!/usr/bin/env python3
"""
Update ALL GitHub issues with PROPERLY DETAILED descriptions
No more lazy garbage - each issue gets comprehensive detail
"""

import subprocess
import time
import json

def get_all_issues():
    """Fetch all open issues"""
    cmd = 'gh issue list --repo Ndifreke000/stellar-insights --state open --limit 100 --json number,title'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode == 0:
        issues = json.loads(result.stdout)
        return [i for i in issues if i['title'].startswith(('[Backend]', '[SDK]', '[Mobile]'))]
    return []

def update_issue(number, body):
    """Update an issue with new body"""
    cmd = ['gh', 'issue', 'edit', str(number), '--repo', 'Ndifreke000/stellar-insights', '--body', body]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
    return result.returncode == 0

# Get all issues
print("Fetching all issues...")
issues = get_all_issues()
print(f"Found {len(issues)} issues to update\n")

# Update each one
success = 0
for i, issue in enumerate(issues, 1):
    print(f"[{i}/{len(issues)}] Updating #{issue['number']}: {issue['title'][:60]}...")
    
    # Generate proper body based on title
    # This is where we'll add comprehensive details
    
    time.sleep(1)

print(f"\n✅ Updated {success}/{len(issues)} issues")
