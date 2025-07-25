function getBadgeColor(score) {
    const colors = {
        '0': '#d32f2f', // red
        '1': '#f57c00', // orange
        '2': '#fbc02d', // yellow
        '3': '#c0ca33', // yellow-green
        '4': '#7cb342', // light green
        '5': '#388e3c'  // green
    };
    return colors[score] || '#9e9e9e'; // default gray
}

function updateBadge(tabId, url) {
    const domain = new URL(url).hostname.replace(/^www\./, '');

    fetch(chrome.runtime.getURL('site-models.json'))
        .then((res) => res.json())
        .then((data) => {
            const siteInfo = data[domain];
            if (siteInfo && siteInfo.greenscore != null) {
                const score = String(siteInfo.greenscore);
                chrome.action.setBadgeText({ text: score, tabId });
                chrome.action.setBadgeBackgroundColor({ color: getBadgeColor(score), tabId });
            } else {
                chrome.action.setBadgeText({ text: '', tabId });
            }
        })
        .catch((err) => {
            console.error('Error loading site-models:', err);
        });
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
