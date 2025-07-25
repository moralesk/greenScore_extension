chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
    const score = document.getElementById('score');
    const details = document.getElementById('details');

    // Show loading state
    score.textContent = '⏳';
    details.textContent = 'Calculating environmental impact...';

    console.log('Starting calculation for:', tabs[0].url);

    try {
        // Use the shared calculator
        const data = await GreenCalculator.calculateEnvironmentalImpact(tabs[0].url);

        console.log('Calculation result:', data);

        // Update UI with calculated data
        score.textContent = data.letterGrade;
        score.style.color = data.color; // Use the same color as the badge

        const statusText = data.success ? '' : ' (estimated)';
        const greenHostingText = data.isGreen === null ? '❓ Unknown' : (data.isGreen ? '✅ Yes' : '❌ No');

        let detailsHTML = '';

        // AI Section
        detailsHTML += `<div style="margin-bottom: 12px; padding: 8px; background-color: #fff3e0; border-left: 3px solid #ff6b35; border-radius: 4px;">`;
        detailsHTML += `<strong style="color: #ff6b35;">🤖 AI PROCESSING</strong><br>`;
        detailsHTML += `<div style="margin-top: 4px; font-size: 11px;">`;

        if (data.aiDetected && data.aiModel) {
            detailsHTML += `• AI Model: ${data.aiModel}<br>`;
            detailsHTML += `• Type: ${data.aiType}<br>`;
            detailsHTML += `• Impact: ${data.aiCO2Display} additional CO2<br>`;
            detailsHTML += `• Multiplier: ${data.aiImpactMultiplier}x`;
        } else {
            detailsHTML += `<span style="color: #999; font-style: italic;">No AI processing detected</span>`;
        }
        detailsHTML += `</div></div>`;

        // Environmental Section
        detailsHTML += `<div style="padding: 8px; background-color: #f1f8e9; border-left: 3px solid #4caf50; border-radius: 4px;">`;
        detailsHTML += `<strong style="color: #4caf50;">🌍 ENVIRONMENTAL IMPACT</strong><br>`;
        detailsHTML += `<div style="margin-top: 4px; font-size: 11px;">`;

        if (data.success || data.co2Display) {
            if (data.aiDetected) {
                detailsHTML += `• Base website: ${data.baseCO2Display}<br>`;
                detailsHTML += `• Total CO2: ${data.co2Display}${statusText}<br>`;
            } else {
                detailsHTML += `• CO2 per visit: ${data.co2Display}${statusText}<br>`;
            }
            detailsHTML += `• Page size: ${data.pageSizeDisplay}${statusText}<br>`;
            detailsHTML += `• Green hosting: ${greenHostingText}<br>`;
            detailsHTML += `• Rating: ${data.rating} ${getScoreEmoji(data.score)}${statusText}`;
        } else {
            detailsHTML += `<span style="color: #999; font-style: italic;">Environmental data unavailable</span>`;
        }
        detailsHTML += `</div></div>`;

        details.innerHTML = detailsHTML;

        console.log('UI updated successfully');

    } catch (error) {
        console.error('Environmental calculation failed:', error);
        score.textContent = '?';
        details.textContent = 'Unable to calculate environmental impact for this site.';
    }
});

function getScoreEmoji(score) {
    if (score >= 90) return '🌟';
    if (score >= 80) return '🌱';
    if (score >= 70) return '👍';
    if (score >= 60) return '⚠️';
    if (score >= 40) return '😟';
    return '🚨';
}
