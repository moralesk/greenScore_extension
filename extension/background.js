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
    let hostname = new URL(url).hostname.replace(/^www\./, "");

    fetch("https://raw.githubusercontent.com/moralesk/greenScore_extension/main/data/site-models.json")
        .then((res) => res.json())
        .then((data) => {
            const siteInfo = data[hostname];
            console.log("Loaded site models:", siteInfo);

            if (siteInfo && siteInfo.rating != null) {
                const score = String(siteInfo.rating);
                chrome.action.setBadgeText({ text: score, tabId });
                chrome.action.setBadgeBackgroundColor({ color: getBadgeColor(score), tabId });
                chrome.action.setTitle({ title: `GreenScore: ${score}`, tabId });
            } else {
                chrome.action.setBadgeText({ text: '', tabId });
                chrome.action.setTitle({ title: '', tabId });
            }

        })
        .catch((err) => {
            console.error("Failed to fetch site models:", err);
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
