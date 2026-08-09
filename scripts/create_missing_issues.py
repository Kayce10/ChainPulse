#!/usr/bin/env python3
"""
Create the 5 missing issues to reach 70 total
"""

import subprocess
import time

def create_issue(title, body, index, total):
    """Create a single GitHub issue"""
    try:
        print(f"[{index}/{total}] Creating: {title}")
        
        cmd = ["gh", "issue", "create", "--title", title, "--body", body]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            print(f"✓ Created issue {index}\n")
            return True
        else:
            print(f"✗ Failed: {result.stderr}\n")
            return False
            
    except Exception as e:
        print(f"✗ Error: {str(e)}\n")
        return False

# Missing 5 issues to reach 70
missing_issues = [
    {
        "title": "[Mobile] Onboarding Flow",
        "body": """## Project Context
Phase 3: Mobile App MVP - Create user onboarding experience for first-time users.

## Task Type
- [x] Feature
- [x] UI/UX

## File Locations
```
mobile/src/screens/onboarding/OnboardingScreen.tsx
mobile/src/screens/onboarding/WelcomeScreen.tsx
```

## Description
Implement multi-step onboarding flow introducing users to key features and wallet setup.

## Acceptance Criteria
- [ ] Create welcome screen
- [ ] Add feature highlights (3-4 screens)
- [ ] Implement swipe navigation
- [ ] Add skip button
- [ ] Store onboarding completion status
- [ ] Show only on first launch
- [ ] Add smooth animations
- [ ] Test on both platforms

## Estimated Effort
6-8 hours"""
    },
    {
        "title": "[Mobile] Wallet Integration",
        "body": """## Project Context
Phase 3: Mobile App MVP - Integrate with popular Stellar mobile wallets for authentication.

## Task Type
- [x] Feature
- [x] Security

## File Locations
```
mobile/src/services/wallet.ts
mobile/src/hooks/useWallet.ts
```

## Description
Implement deep linking integration with Freighter Mobile, Lobstr, and other Stellar wallets.

## Acceptance Criteria
- [ ] Support Freighter Mobile
- [ ] Support Lobstr wallet
- [ ] Handle wallet callbacks
- [ ] Implement SEP-10 challenge
- [ ] Verify wallet signatures
- [ ] Handle wallet errors
- [ ] Add wallet selection UI
- [ ] Test with multiple wallets

## Estimated Effort
10-12 hours"""
    },
    {
        "title": "[Mobile] Chart Components",
        "body": """## Project Context
Phase 3: Mobile App MVP - Create reusable chart components for data visualization.

## Task Type
- [x] Feature
- [x] UI/UX

## File Locations
```
mobile/src/components/charts/LineChart.tsx
mobile/src/components/charts/BarChart.tsx
mobile/src/components/charts/PieChart.tsx
```

## Description
Implement mobile-optimized chart components using react-native-svg and react-native-chart-kit.

## Acceptance Criteria
- [ ] Create line chart component
- [ ] Create bar chart component
- [ ] Create pie chart component
- [ ] Support touch interactions
- [ ] Add tooltips on tap
- [ ] Implement zoom/pan
- [ ] Support dark mode
- [ ] Optimize performance

## Estimated Effort
8-10 hours"""
    },
    {
        "title": "[Mobile] Localization Support",
        "body": """## Project Context
Phase 3: Mobile App MVP - Add internationalization support for multiple languages.

## Task Type
- [x] Feature
- [x] Enhancement

## File Locations
```
mobile/src/i18n/index.ts
mobile/src/i18n/locales/en.json
mobile/src/i18n/locales/es.json
```

## Description
Implement i18n using react-i18next with support for English and Spanish initially.

## Acceptance Criteria
- [ ] Set up react-i18next
- [ ] Create English translations
- [ ] Create Spanish translations
- [ ] Detect device language
- [ ] Add language selector in settings
- [ ] Format dates/numbers by locale
- [ ] Support RTL languages (future)
- [ ] Test language switching

## Estimated Effort
6-8 hours"""
    },
    {
        "title": "[Mobile] App Store Preparation",
        "body": """## Project Context
Phase 3: Mobile App MVP - Prepare app for submission to Apple App Store and Google Play Store.

## Task Type
- [x] DevOps
- [x] Enhancement

## File Locations
```
mobile/ios/fastlane/
mobile/android/fastlane/
mobile/app-store-assets/
```

## Description
Prepare all assets, metadata, and configurations required for app store submissions.

## Acceptance Criteria
- [ ] Create app store screenshots (iOS)
- [ ] Create play store screenshots (Android)
- [ ] Write app description
- [ ] Prepare app preview video
- [ ] Set up fastlane for iOS
- [ ] Set up fastlane for Android
- [ ] Configure app signing
- [ ] Test release builds
- [ ] Create privacy policy
- [ ] Prepare support documentation

## Estimated Effort
12-15 hours"""
    }
]

def main():
    print(f"\n📋 Creating {len(missing_issues)} missing issues to reach 70 total\n")
    
    success_count = 0
    
    for i, issue in enumerate(missing_issues, 1):
        if create_issue(issue["title"], issue["body"], i, len(missing_issues)):
            success_count += 1
        time.sleep(1)
    
    print(f"\n✅ Done! Created {success_count}/{len(missing_issues)} issues successfully.")
    print(f"\nTotal issues should now be: 65 + {success_count} = {65 + success_count}")

if __name__ == "__main__":
    main()
