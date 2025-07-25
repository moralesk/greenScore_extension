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

function createTooltip() {
  const tooltip = document.createElement('div');
  tooltip.id = 'green-score-tooltip';
  tooltip.style.position = 'fixed';
  tooltip.style.backgroundColor = '#333';
  tooltip.style.color = 'white';
  tooltip.style.padding = '10px';
  tooltip.style.borderRadius = '8px';
  tooltip.style.fontSize = '12px';
  tooltip.style.fontFamily = 'sans-serif';
  tooltip.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
  tooltip.style.zIndex = '10000';
  tooltip.style.maxWidth = '250px';
  tooltip.style.display = 'none';
  tooltip.style.pointerEvents = 'none';
  document.body.appendChild(tooltip);
  return tooltip;
}

function showTooltip(badge, info, event) {
  let tooltip = document.getElementById('green-score-tooltip');
  if (!tooltip) {
    tooltip = createTooltip();
  }

  let tooltipContent = `<strong>GreenScore: ${info?.rating || '?'}/5</strong><br>`;

  if (info) {
    if (info.model) {
      tooltipContent += `Model: ${info.model}<br>`;
    }
    if (info.energy) {
      tooltipContent += `Energy Usage: ${info.energy}<br>`;
    }
    if (info.water) {
      tooltipContent += `Water Usage: ${info.water}<br>`;
    }

    // Add rating description
    const ratingDescriptions = {
      0: 'Very High Impact',
      1: 'High Impact',
      2: 'Medium-High Impact',
      3: 'Medium Impact',
      4: 'Low Impact',
      5: 'Very Low Impact'
    };

    if (info.rating != null) {
      tooltipContent += `Impact: ${ratingDescriptions[info.rating]}<br>`;
    }
    tooltipContent += `<br><em>Click to contribute data</em>`;
  } else {
    tooltipContent += 'No environmental data available<br>';
    tooltipContent += `<br><em>Click to contribute data</em>`;
  }

  tooltip.innerHTML = tooltipContent;
  tooltip.style.display = 'block';

  // Position tooltip above the badge
  const badgeRect = badge.getBoundingClientRect();
  tooltip.style.left = (badgeRect.left - 100) + 'px';
  tooltip.style.bottom = (window.innerHeight - badgeRect.top + 10) + 'px';
}

function hideTooltip() {
  const tooltip = document.getElementById('green-score-tooltip');
  if (tooltip) {
    tooltip.style.display = 'none';
  }
}

function showBadge(info) {
  let badge = document.getElementById('green-score-badge');
  if (!badge) {
    badge = document.createElement('div');
    badge.id = 'green-score-badge';
    badge.style.position = 'fixed';
    badge.style.bottom = '20px';
    badge.style.right = '20px';
    badge.style.zIndex = '9999';
    badge.style.padding = '8px 12px';
    badge.style.borderRadius = '20px';
    badge.style.color = 'white';
    badge.style.fontSize = '14px';
    badge.style.fontWeight = 'bold';
    badge.style.fontFamily = 'sans-serif';
    badge.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
    badge.style.cursor = 'pointer';
    badge.style.transition = 'background 0.2s ease';
    badge.innerText = `🌱 GreenScore: ?`;
    document.body.appendChild(badge);

    badge.addEventListener('mouseenter', (event) => {
      badge.style.opacity = '0.9';
      showTooltip(badge, info, event);
    });

    badge.addEventListener('mouseleave', () => {
      badge.style.opacity = '1';
      hideTooltip();
    });

    badge.addEventListener('click', () => {
      window.open('https://github.com/moralesk/greenScore_extension/issues/new?template=add_model.yml', '_blank');
    });
  }

  if (info?.rating != null) {
    const score = info.rating;
    badge.textContent = `🌱 GreenScore: ${score}`;
    badge.style.backgroundColor = getBadgeColor(score);
  } else {
    badge.textContent = '🌱 GreenScore: ?';
    badge.style.backgroundColor = '#9e9e9e';
  }
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
