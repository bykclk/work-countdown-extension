// Default times and working days
const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "17:30";
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday

// Format time as HH:MM
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Calculate time difference for preview
function calculateTimeDifference(startTime, endTime, workingDays) {
    const now = new Date();
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const currentDay = now.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // Check if today is a working day
    const isWorkingDay = workingDays.includes(currentDay);
    
    if (isWorkingDay) {
        const startDateTime = new Date();
        startDateTime.setHours(startHours, startMinutes, 0, 0);
        
        const endDateTime = new Date();
        endDateTime.setHours(endHours, endMinutes, 0, 0);
        
        // If end time is earlier than start time, assume end time is next day
        if (endDateTime <= startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }
        
        // Check if we're before work hours
        if (now < startDateTime) {
            const diffMs = startDateTime - now;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            
            return {
                display: `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`,
                message: "Time until work starts"
            };
        }
        
        // If we're during work hours
        if (now >= startDateTime && now < endDateTime) {
            const diffMs = endDateTime - now;
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
            
            return {
                display: `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`,
                message: "Time Until Freedom"
            };
        }
    }
    
    // Find next working day
    const nextWorkingDay = findNextWorkingDay(workingDays);
    const nextStartDateTime = new Date();
    nextStartDateTime.setDate(nextStartDateTime.getDate() + nextWorkingDay.daysToAdd);
    nextStartDateTime.setHours(startHours, startMinutes, 0, 0);
    
    const diffMs = nextStartDateTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return {
        display: `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`,
        message: `Time until ${nextWorkingDay.dayName}`
    };
}

// Get selected working days
function getSelectedWorkingDays() {
    const checkboxes = document.querySelectorAll('.weekday-checkbox input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

// Update preview
function updatePreview() {
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const previewCurrentTime = document.getElementById('previewCurrentTime');
    const previewWorkHours = document.getElementById('previewWorkHours');
    const previewCountdown = document.getElementById('previewCountdown');
    const previewCountdownLabel = document.getElementById('previewCountdownLabel');
    
    // Update current time
    const now = new Date();
    previewCurrentTime.textContent = formatTime(now);
    
    // Update work hours and countdown with selected times
    const startTime = startTimeInput.value || DEFAULT_START_TIME;
    const endTime = endTimeInput.value || DEFAULT_END_TIME;
    const workingDays = getSelectedWorkingDays();
    
    previewWorkHours.textContent = `${startTime} to ${endTime}`;
    
    const timeInfo = calculateTimeDifference(startTime, endTime, workingDays);
    previewCountdown.textContent = timeInfo.display;
    previewCountdownLabel.textContent = timeInfo.message;
}

// Show status message
function showStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${isError ? 'error' : 'success'}`;
    
    // Hide after 3 seconds
    setTimeout(() => {
        statusDiv.style.opacity = '0';
    }, 3000);
}

// Save settings
function saveSettings() {
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const workingDays = getSelectedWorkingDays();
    
    if (!startTime || !endTime) {
        showStatus('Please select valid start and end times.', true);
        return;
    }
    
    if (workingDays.length === 0) {
        showStatus('Please select at least one working day.', true);
        return;
    }
    
    // Validate that end time is after start time (allowing for next day)
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startMinutesTotal = startHours * 60 + startMinutes;
    const endMinutesTotal = endHours * 60 + endMinutes;
    
    if (endMinutesTotal <= startMinutesTotal && endMinutesTotal > 0) {
        // This is OK - work spans midnight (night shift)
    } else if (endMinutesTotal <= startMinutesTotal) {
        showStatus('End time should be after start time.', true);
        return;
    }
    
    // Save to Chrome storage
    chrome.storage.local.set({
        startTime: startTime,
        endTime: endTime,
        workingDays: workingDays
    }, function() {
        if (chrome.runtime.lastError) {
            showStatus('Error saving settings: ' + chrome.runtime.lastError.message, true);
        } else {
            showStatus('Settings saved successfully! ✓');
        }
    });
}

// Reset to default
function resetSettings() {
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    startTimeInput.value = DEFAULT_START_TIME;
    endTimeInput.value = DEFAULT_END_TIME;
    
    // Reset working days to Monday-Friday
    const checkboxes = document.querySelectorAll('.weekday-checkbox input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = DEFAULT_WORKING_DAYS.includes(parseInt(cb.value));
    });
    
    chrome.storage.local.set({
        startTime: DEFAULT_START_TIME,
        endTime: DEFAULT_END_TIME,
        workingDays: DEFAULT_WORKING_DAYS
    }, function() {
        if (chrome.runtime.lastError) {
            showStatus('Error resetting settings: ' + chrome.runtime.lastError.message, true);
        } else {
            showStatus('Settings reset to default (Mon-Fri, 9:00 AM - 5:30 PM) ✓');
            updatePreview();
        }
    });
}

// Load saved settings
function loadSettings() {
    chrome.storage.local.get(['startTime', 'endTime', 'workingDays'], function(result) {
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');
        startTimeInput.value = result.startTime || DEFAULT_START_TIME;
        endTimeInput.value = result.endTime || DEFAULT_END_TIME;
        
        // Load working days
        const workingDays = result.workingDays || DEFAULT_WORKING_DAYS;
        const checkboxes = document.querySelectorAll('.weekday-checkbox input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = workingDays.includes(parseInt(cb.value));
        });
        
        updatePreview();
    });
}

// Find the next working day
function findNextWorkingDay(workingDays) {
    const now = new Date();
    const currentDay = now.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Check if today is a working day and we're past work hours
    if (workingDays.includes(currentDay)) {
        // Look for next working day (could be tomorrow or later)
        for (let i = 1; i <= 7; i++) {
            const nextDay = (currentDay + i) % 7;
            if (workingDays.includes(nextDay)) {
                return {
                    daysToAdd: i,
                    dayName: dayNames[nextDay]
                };
            }
        }
    } else {
        // Today is not a working day, find the next one
        for (let i = 1; i <= 7; i++) {
            const nextDay = (currentDay + i) % 7;
            if (workingDays.includes(nextDay)) {
                return {
                    daysToAdd: i,
                    dayName: dayNames[nextDay]
                };
            }
        }
    }
    
    // Fallback (should never happen if workingDays is not empty)
    return {
        daysToAdd: 1,
        dayName: 'Monday'
    };
}

// Initialize the options page
function init() {
    // Load saved settings
    loadSettings();
    
    // Set up event listeners
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const workingDayCheckboxes = document.querySelectorAll('.weekday-checkbox input[type="checkbox"]');
    
    saveBtn.addEventListener('click', saveSettings);
    resetBtn.addEventListener('click', resetSettings);
    startTimeInput.addEventListener('change', updatePreview);
    startTimeInput.addEventListener('input', updatePreview);
    endTimeInput.addEventListener('change', updatePreview);
    endTimeInput.addEventListener('input', updatePreview);
    
    // Add event listeners for working day checkboxes
    workingDayCheckboxes.forEach(cb => {
        cb.addEventListener('change', updatePreview);
    });
    
    // Update preview every second
    setInterval(updatePreview, 1000);
    
    // Initial preview update
    updatePreview();
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
