// Color scale from red (0) to green (5)
function getBadgeColor(rating) {
  const colors = [
    "#c0392b", // 0 - Red
    "#e67e22", // 1 - Orange
    "#f1c40f", // 2 - Yellow
    "#2ecc71", // 3 - Light Green
    "#27ae60", // 4 - Green
    "#1e8449"  // 5 - Dark Green
  ];
  return colors[Math.max(0, Math.min(rating, 5))];
}

function showBadge(info) {
  const hostname = window.location.hostname.replace("www.", "");
  const badgeLink = `https://github.com/moralesk/greenScore_extension/issues/new?template=add_model.yml&title=[New Entry]%20${hostname}`;
  const badge = document.createElement("a");
  badge.href = badgeLink;
  badge.target = "_blank";
  badge.rel = "noopener noreferrer";

  badge.style.cssText = `
    position: fixed;
    top: 12px;
    right: 12px;
    background: ${getBadgeColor(info.rating)};
    color: white;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: bold;
    z-index: 99999;
    text-decoration: none;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  `;

  badge.textContent = `🌿 GreenScore: ${info.rating}/5`;
  document.body.appendChild(badge);
}

const hostname = window.location.hostname.replace("www.", "");
const info = modelImpactData[hostname];

if (info) {
  showBadge(info);
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
