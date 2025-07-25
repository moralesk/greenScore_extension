const modelImpactData = {
    "chatgpt.com": { model: "GPT-4", energy: "high", water: "high", rating: 2 },
    "claude.ai": { model: "Claude 3", energy: "medium", water: "unknown", rating: 3 },
    "gemini.google.com": { model: "Gemini 1.5", energy: "medium", water: "medium", rating: 3 }
};

const hostname = window.location.hostname;
const info = modelImpactData[hostname];

if (info) {
    const badge = document.createElement("div");
    badge.style.cssText = `
    position: fixed;
    top: 12px;
    right: 12px;
    background: rgba(34,139,34,0.9);
    color: white;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    z-index: 99999;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  `;
    badge.textContent = `🌿 GreenScore: ${info.rating}/5`;

    document.body.appendChild(badge);
}
