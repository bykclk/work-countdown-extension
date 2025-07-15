// Get selected working days
function getSelectedWorkingDays() {
    const checkboxes = document.querySelectorAll('.weekday-checkbox input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

// Update preview
function updatePreview() {
    const startTimeInput = safeGetElement('startTime');
    const endTimeInput = safeGetElement('endTime');
    const previewCurrentTime = safeGetElement('previewCurrentTime');
    const previewWorkHours = safeGetElement('previewWorkHours');
    const previewCountdown = safeGetElement('previewCountdown');
    const previewCountdownLabel = safeGetElement('previewCountdownLabel');
    
    if (!startTimeInput || !endTimeInput || !previewCurrentTime || !previewWorkHours || !previewCountdown || !previewCountdownLabel) {
        console.error('Required DOM elements not found in preview');
        return;
    }
    
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
    const statusDiv = safeGetElement('status');
    if (!statusDiv) {
        console.error('Status element not found');
        return;
    }
    
    statusDiv.textContent = message;
    statusDiv.className = `status ${isError ? 'error' : 'success'}`;
    statusDiv.style.opacity = '1';
    
    // Hide after 3 seconds
    setTimeout(() => {
        statusDiv.style.opacity = '0';
    }, 3000);
}

// Save settings
function saveSettings() {
    const startTimeInput = safeGetElement('startTime');
    const endTimeInput = safeGetElement('endTime');
    
    if (!startTimeInput || !endTimeInput) {
        showStatus('Error: Required input fields not found.', true);
        return;
    }
    
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const workingDays = getSelectedWorkingDays();
    
    // Validate inputs
    if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
        showStatus('Please enter valid times in HH:MM format.', true);
        return;
    }
    
    if (!isValidWorkingDays(workingDays)) {
        showStatus('Please select at least one working day.', true);
        return;
    }
    
    // Note: We allow night shifts where end time is before start time
    // This is a valid use case and should not be restricted
    
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
    const startTimeInput = safeGetElement('startTime');
    const endTimeInput = safeGetElement('endTime');
    
    if (!startTimeInput || !endTimeInput) {
        showStatus('Error: Required input fields not found.', true);
        return;
    }
    
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
        if (chrome.runtime.lastError) {
            console.error('Error loading settings:', chrome.runtime.lastError);
            return;
        }
        
        const startTimeInput = safeGetElement('startTime');
        const endTimeInput = safeGetElement('endTime');
        
        if (startTimeInput && endTimeInput) {
            startTimeInput.value = result.startTime || DEFAULT_START_TIME;
            endTimeInput.value = result.endTime || DEFAULT_END_TIME;
        }
        
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

// Global variable to store interval ID for cleanup
let previewUpdateInterval = null;

// Initialize the options page
function init() {
    // Load saved settings
    loadSettings();
    
    // Set up event listeners with error handling
    const saveBtn = safeGetElement('saveBtn');
    const resetBtn = safeGetElement('resetBtn');
    const startTimeInput = safeGetElement('startTime');
    const endTimeInput = safeGetElement('endTime');
    const workingDayCheckboxes = document.querySelectorAll('.weekday-checkbox input[type="checkbox"]');
    
    if (saveBtn) saveBtn.addEventListener('click', saveSettings);
    if (resetBtn) resetBtn.addEventListener('click', resetSettings);
    if (startTimeInput) {
        startTimeInput.addEventListener('change', updatePreview);
        startTimeInput.addEventListener('input', updatePreview);
    }
    if (endTimeInput) {
        endTimeInput.addEventListener('change', updatePreview);
        endTimeInput.addEventListener('input', updatePreview);
    }
    
    // Add event listeners for working day checkboxes
    workingDayCheckboxes.forEach(cb => {
        cb.addEventListener('change', updatePreview);
    });
    
    // Clean up any existing interval
    if (previewUpdateInterval) {
        clearInterval(previewUpdateInterval);
    }
    
    // Update preview every second
    previewUpdateInterval = setInterval(updatePreview, 1000);
    
    // Initial preview update
    updatePreview();
}

// Cleanup function
function cleanup() {
    if (previewUpdateInterval) {
        clearInterval(previewUpdateInterval);
        previewUpdateInterval = null;
    }
}

// Clean up when page unloads
window.addEventListener('beforeunload', cleanup);

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
