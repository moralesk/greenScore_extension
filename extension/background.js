// Import the shared calculator
importScripts('green-calculator.js');

async function updateBadge(tabId, url) {
    try {
        // Use the shared calculator
        const data = await GreenCalculator.calculateEnvironmentalImpact(url);

        // Create detailed tooltip with calculation breakdown
        const tooltip = GreenCalculator.generateTooltip(data);

        // Update badge
        chrome.action.setBadgeText({ text: data.letterGrade, tabId });
        chrome.action.setBadgeBackgroundColor({ color: data.color, tabId });
        chrome.action.setTitle({ title: tooltip, tabId });

    } catch (error) {
        console.error('Environmental calculation failed:', error);
        chrome.action.setBadgeText({ text: '?', tabId });
        chrome.action.setTitle({ title: 'Unable to calculate environmental impact', tabId });
    }
}

// Update badge when tab changes or page loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        updateBadge(tabId, tab.url);
    }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        if (tab.url) {
            updateBadge(activeInfo.tabId, tab.url);
        }
    });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'openPopup') {
        // Open the extension popup
        chrome.action.openPopup();
    }
});
