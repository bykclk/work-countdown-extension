// Motivational messages
const motivationalMessages = [
    "Almost there, hang in! 🌟",
    "You've got this 💪",
    "One step closer to freedom 🚀",
    "Coffee can help. So can memes ☕",
    "Stay strong, the end is near! 💼",
    "Every minute counts, you're doing great! ⏰",
    "Just a little more, then it's your time! 🌅",
    "Push through, weekend warrior! 🏆",
    "You're closer than you think! 🎯",
    "Breathe. You've got this covered. 🧘‍♀️",
    "The clock is your friend today! 🕐",
    "Home stretch, keep going! 🏠",
    "Your future self will thank you! ✨",
    "Making progress, one tick at a time! ⚡",
    "The countdown is in your favor! 🎉"
];

// Default times and working days
const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "17:30";
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday (0=Sunday, 1=Monday, etc.)

// Get random motivational message
function getRandomMessage() {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
}

// Format time as HH:MM
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Calculate time difference in HH:MM:SS format
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
                status: "before-work",
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
                status: "counting",
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
        status: "weekend",
        message: `Time until ${nextWorkingDay.dayName}`
    };
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

// Update the display
function updateDisplay() {
    const currentTimeElement = document.getElementById('currentTime');
    const countdownElement = document.getElementById('countdown');
    const workHoursElement = document.getElementById('workHours');
    const countdownLabel = countdownElement.previousElementSibling;
    
    // Update current time
    const now = new Date();
    currentTimeElement.textContent = formatTime(now);
    
    // Get times from storage
    chrome.storage.local.get(['startTime', 'endTime', 'workingDays'], function(result) {
        const startTime = result.startTime || DEFAULT_START_TIME;
        const endTime = result.endTime || DEFAULT_END_TIME;
        const workingDays = result.workingDays || DEFAULT_WORKING_DAYS;
        
        // Update work hours display
        workHoursElement.textContent = `${startTime} to ${endTime}`;
        
        const timeInfo = calculateTimeDifference(startTime, endTime, workingDays);
        
        countdownElement.textContent = timeInfo.display;
        countdownLabel.textContent = timeInfo.message;
        
        // Update styling based on status
        countdownElement.className = 'time countdown-time';
        if (timeInfo.status === 'finished') {
            countdownElement.classList.add('finished');
            countdownElement.textContent = "FREE! 🎉";
        } else if (timeInfo.status === 'weekend') {
            countdownElement.classList.add('weekend');
        } else if (timeInfo.status === 'after-work') {
            countdownElement.classList.add('after-work');
        } else if (timeInfo.status === 'before-work') {
            countdownElement.classList.add('before-work');
        } else if (timeInfo.status === 'overtime') {
            countdownElement.classList.add('overtime');
        }
    });
}

// Initialize the page
function init() {
    // Display random motivational message
    const messageElement = document.getElementById('motivationMessage');
    messageElement.textContent = getRandomMessage();
    
    // Update display immediately
    updateDisplay();
    
    // Update every second
    setInterval(updateDisplay, 1000);
}

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
