// Shared utility functions for Work Countdown Extension

// Default times and working days
const DEFAULT_START_TIME = "09:00";
const DEFAULT_END_TIME = "17:30";
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5]; // Monday to Friday (0=Sunday, 1=Monday, etc.)

// Format time as HH:MM
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
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
        
        // If we're after work hours on a working day
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
            status: "after-work",
            message: `Time until ${nextWorkingDay.dayName}`
        };
    }
    
    // Find next working day (weekend or non-working day)
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

// Safe DOM element getter with error handling
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

// Validate time format (HH:MM)
function isValidTimeFormat(time) {
    if (!time) return false;
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
}

// Validate working days array
function isValidWorkingDays(workingDays) {
    return Array.isArray(workingDays) && 
           workingDays.length > 0 && 
           workingDays.every(day => day >= 0 && day <= 6);
}