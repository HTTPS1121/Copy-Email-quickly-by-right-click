// Simple email regex
const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/;

// Keep track of extension state
let isExtensionActive = true;
chrome.storage.local.get(['isActive'], function(result) {
    isExtensionActive = result.isActive === undefined ? true : result.isActive;
});

// Listen for changes in extension state
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.isActive) {
        isExtensionActive = changes.isActive.newValue;
    }
});

// Function to get exact clicked text
function getClickedText(element, x, y) {
    try {
        // If element is a text node, use its parent
        if (element.nodeType === Node.TEXT_NODE) {
            element = element.parentNode;
        }

        // First try: direct text content if it's an email
        const directText = element.textContent?.trim() || '';
        if (emailRegex.test(directText)) {
            return directText;
        }

        // Second try: check if it's a mailto link
        if (element.tagName === 'A' && element.href?.startsWith('mailto:')) {
            const email = element.href.replace('mailto:', '').trim();
            if (emailRegex.test(email)) {
                return email;
            }
        }

        // Third try: find email in text content
        const text = element.textContent || '';
        const matches = text.match(new RegExp(emailRegex, 'g')) || [];
        
        if (matches.length === 1) {
            return matches[0];
        } else if (matches.length > 1) {
            // If multiple matches, try to find the closest one to click
            try {
                const range = document.createRange();
                const textNode = element.firstChild;
                
                for (const match of matches) {
                    const startIndex = text.indexOf(match);
                    const endIndex = startIndex + match.length;
                    
                    range.setStart(textNode, startIndex);
                    range.setEnd(textNode, endIndex);
                    
                    const rect = range.getBoundingClientRect();
                    if (x >= rect.left && x <= rect.right && 
                        y >= rect.top && y <= rect.bottom) {
                        return match;
                    }
                }
            } catch (e) {
                // If range selection fails, return the first match
                return matches[0];
            }
        }
    } catch (e) {
        console.debug('Non-critical error getting clicked text:', e);
    }
    return null;
}

// Function to show notification
function showNotification(text, x, y) {
    const notification = document.createElement('div');
    notification.textContent = text;
    notification.style.cssText = `
        position: fixed;
        top: ${y}px;
        left: ${x}px;
        background: #4CAF50;
        color: white;
        padding: 8px;
        border-radius: 4px;
        z-index: 999999;
        font-family: Arial, sans-serif;
        font-size: 14px;
        pointer-events: none;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 1000);
}

// Variable to track if we should block the next context menu
let shouldBlockNextContextMenu = false;

// Handle mousedown event
document.addEventListener('mousedown', function(e) {
    if (e.button !== 2 || !isExtensionActive) return; // Only handle right click when extension is active
    
    const clickedText = getClickedText(e.target, e.clientX, e.clientY);
    if (clickedText && emailRegex.test(clickedText)) {
        shouldBlockNextContextMenu = true;
        
        // Copy the email
        navigator.clipboard.writeText(clickedText).then(() => {
            showNotification('Email copied!', e.clientX, e.clientY);
        });
        
        // Block the event
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }
}, true);

// Handle context menu event
document.addEventListener('contextmenu', function(e) {
    if (shouldBlockNextContextMenu) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        shouldBlockNextContextMenu = false; // Reset the flag
        return false;
    }
}, true);
