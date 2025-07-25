chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = new URL(tabs[0].url);
    const domain = url.hostname.replace(/^www\./, '');

    fetch("https://raw.githubusercontent.com/moralesk/greenScore_extension/main/data/site-models.json")
        .then((response) => response.json())
        .then((data) => {
            const info = data[domain];

            const score = document.getElementById('score');
            const details = document.getElementById('details');

            if (info) {
                score.textContent = `GreenScore: ${info.rating}` || '?';
                details.textContent = `Model: ${info.model || 'Unknown'},\nEnergy: ${info.energy || 'Unknown'}`;
            } else {
                score.textContent = '?';
                details.textContent = `No data found for this site.`;
            }
        });
});
