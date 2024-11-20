// Simple email regex
const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/;

// Function to get exact clicked text
function getClickedText(element, x, y) {
    try {
        if (!element.firstChild) return null;
        
        const range = document.createRange();
        const textNode = element.firstChild;
        const text = textNode.textContent;
        
        // Try each word in the text
        const words = text.split(/\s+/);
        let currentPos = 0;
        
        for (const word of words) {
            if (!word) continue;
            
            // Create range for this word
            range.setStart(textNode, currentPos);
            range.setEnd(textNode, currentPos + word.length);
            
            // Check if click was within this word's bounds
            const rect = range.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && 
                y >= rect.top && y <= rect.bottom) {
                return word;
            }
            
            currentPos += word.length + 1; // +1 for the space
        }
    } catch (e) {
        console.error('Error getting clicked text:', e);
    }
    return null;
}

// Aggressively block context menu and handle email copy
document.addEventListener('mousedown', function(e) {
    if (e.button !== 2) return; // Only handle right click
    
    // Check if extension is active
    chrome.storage.local.get(['isActive'], function(result) {
        const isActive = result.isActive === undefined ? true : result.isActive;
        if (!isActive) return;

        const clickedText = getClickedText(e.target, e.clientX, e.clientY);
        if (!clickedText) return;
        
        // Check if clicked text is an email
        if (emailRegex.test(clickedText)) {
            // Block the context menu completely
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // Copy the email
            navigator.clipboard.writeText(clickedText).then(() => {
                // Show notification
                const notification = document.createElement('div');
                notification.textContent = 'Email copied!';
                notification.style.cssText = `
                    position: fixed;
                    top: ${e.clientY}px;
                    left: ${e.clientX}px;
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
            });
        }
    });
}, true);

// Additional blocking of context menu
document.addEventListener('contextmenu', function(e) {
    const clickedText = getClickedText(e.target, e.clientX, e.clientY);
    if (clickedText && emailRegex.test(clickedText)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
    }
}, true);
