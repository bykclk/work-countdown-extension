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

// Get random motivational message
function getRandomMessage() {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
}

// Update the display
function updateDisplay() {
    const currentTimeElement = safeGetElement('currentTime');
    const countdownElement = safeGetElement('countdown');
    const workHoursElement = safeGetElement('workHours');
    
    if (!currentTimeElement || !countdownElement || !workHoursElement) {
        console.error('Required DOM elements not found');
        return;
    }
    
    const countdownLabel = countdownElement.previousElementSibling;
    
    // Update current time
    const now = new Date();
    currentTimeElement.textContent = formatTime(now);
    
    // Get times from storage
    chrome.storage.local.get(['startTime', 'endTime', 'workingDays'], function(result) {
        if (chrome.runtime.lastError) {
            console.error('Error reading from storage:', chrome.runtime.lastError);
            return;
        }
        
        const startTime = result.startTime || DEFAULT_START_TIME;
        const endTime = result.endTime || DEFAULT_END_TIME;
        const workingDays = result.workingDays || DEFAULT_WORKING_DAYS;
        
        // Update work hours display
        workHoursElement.textContent = `${startTime} to ${endTime}`;
        
        const timeInfo = calculateTimeDifference(startTime, endTime, workingDays);
        
        countdownElement.textContent = timeInfo.display;
        if (countdownLabel) {
            countdownLabel.textContent = timeInfo.message;
        }
        
        // Update styling based on status
        countdownElement.className = 'time countdown-time';
        if (timeInfo.status === 'weekend') {
            countdownElement.classList.add('weekend');
        } else if (timeInfo.status === 'after-work') {
            countdownElement.classList.add('after-work');
        } else if (timeInfo.status === 'before-work') {
            countdownElement.classList.add('before-work');
        } else if (timeInfo.status === 'counting') {
            countdownElement.classList.add('counting');
        }
    });
}

// Global variable to store interval ID for cleanup
let updateInterval = null;

// Initialize the page
function init() {
    // Display random motivational message
    const messageElement = safeGetElement('motivationMessage');
    if (messageElement) {
        messageElement.textContent = getRandomMessage();
    }
    
    // Clean up any existing interval
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    
    // Update display immediately
    updateDisplay();
    
    // Update every second
    updateInterval = setInterval(updateDisplay, 1000);
}

// Cleanup function
function cleanup() {
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }
}

// Clean up when page unloads
window.addEventListener('beforeunload', cleanup);

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
