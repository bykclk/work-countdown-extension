# Work Countdown Chrome Extension

A Chrome extension that replaces your new tab page with a countdown timer showing how much time is left until you can go home from work.

## Features

- **Countdown Timer**: Shows time remaining until your workday ends (HH:MM:SS format)
- **Work Schedule Display**: Shows your full work hours (start to end time)
- **Working Days Selection**: Choose which days of the week you work
- **Smart Weekend Detection**: Different countdowns for workdays vs weekends/days off
- **Current Time Display**: Always see the current time
- **Smart Time Detection**: Shows different messages for before work, during work, and after work
- **Motivational Messages**: Random encouraging messages on each new tab
- **Customizable Schedule**: Set both your work start and end times in the settings
- **Clean Design**: Modern, work-focused interface

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select this folder
4. The extension will be installed and ready to use

## Usage

1. **First Time Setup**: 
   - Open a new tab (you'll see the extension)
   - Click the "⚙️ Settings" link
   - Set your work start time (default is 9:00 AM)
   - Set your work end time (default is 5:30 PM)
   - Choose your working days (default is Monday-Friday)
   - Click "Save Settings"

2. **Daily Use**:
   - Every new tab will show your countdown timer
   - See your full work schedule (9:00 AM to 5:30 PM)
   - Get different countdowns based on time of day:
     - Before work: "Time until work starts"
     - During work: "Time Until Freedom"
     - After work/weekends: "Time until [Next Working Day]"
   - See motivational messages to keep you going
   - Track your progress through the workday

## Files

- `manifest.json` - Extension configuration
- `newtab.html/css/js` - New tab page interface
- `options.html/css/js` - Settings page
- `README.md` - This file

## Settings

Access settings by clicking the gear icon on any new tab, or go directly to `chrome-extension://[extension-id]/options.html`

## Motivational Messages

The extension includes 15+ rotating motivational messages like:
- "Almost there, hang in! 🌟"
- "You've got this 💪"
- "Coffee can help. So can memes ☕"
- And many more!

## Technical Details

- Uses Chrome Storage API for persistent settings
- Updates countdown every second with precise HH:MM:SS format
- Smart time calculation supporting different work schedules
- Responsive design for different screen sizes
- Modern CSS with gradients and animations
- Handles edge cases like night shifts and different time zones

Enjoy your countdown to freedom! 🚀
