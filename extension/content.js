function showBadge(info) {
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

// Load external data
fetch("https://raw.githubusercontent.com/moralesk/greenScore_extension/main/data/site-models.json")
  .then(res => res.json())
  .then(data => {
    const hostname = window.location.hostname.replace("www.", "");
    const info = data[hostname];
    if (info) showBadge(info);
  })
  .catch(err => {
    console.error("Failed to load GreenScore data:", err);
  });
