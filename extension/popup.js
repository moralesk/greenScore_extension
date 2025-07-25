chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = new URL(tabs[0].url);
    const domain = url.hostname.replace(/^www\./, '');

    fetch(chrome.runtime.getURL('site-models.json'))
        .then((response) => response.json())
        .then((data) => {
            const info = data[domain];

            const score = document.getElementById('score');
            const details = document.getElementById('details');

            if (info) {
                score.textContent = info.greenscore || '?';
                details.textContent = `Model: ${info.model || 'Unknown'}\nEnergy: ${info.energy || 'Unknown'}`;
            } else {
                score.textContent = '?';
                details.textContent = `No data found for this site.`;
            }
        });
});
