// Load the shared calculator
const script = document.createElement('script');
script.src = chrome.runtime.getURL('green-calculator.js');
document.head.appendChild(script);

// Wait for the calculator to load
let calculatorReady = false;
script.onload = () => {
  calculatorReady = true;
};

// Color function for AI detection badges (0-5 scale)
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

// Enhanced badge showing function that uses environmental calculator when available
async function showBadgeWithEnvironmentalData(staticInfo, detectedInfo) {
  // If calculator is ready, use environmental data with AI detection
  if (calculatorReady && typeof GreenCalculator !== 'undefined') {
    try {
      // Get page content for AI detection
      const pageContent = document.body.innerText || '';
      const envData = await GreenCalculator.calculateEnvironmentalImpact(window.location.href, pageContent);

      const environmentalInfo = {
        rating: envData.letterGrade,
        model: envData.aiDetected ? envData.aiModel : 'Environmental Impact',
        energy: envData.aiDetected ? `${envData.baseCO2Display} + ${envData.aiCO2Display} AI` : envData.co2Display,
        water: envData.isGreen ? 'Green hosting' : 'Standard hosting',
        environmentalData: envData,
        aiDetected: envData.aiDetected,
        letterGrade: envData.letterGrade,
        score: envData.score,
        color: envData.color,
        aiBreakdown: envData.aiDetected ? {
          baseImpact: envData.baseCO2Display,
          aiImpact: envData.aiCO2Display,
          totalImpact: envData.co2Display,
          aiModel: envData.aiModel
        } : null
      };

      showBadge(environmentalInfo);
      return;
    } catch (error) {
      console.log('Environmental calculation failed, falling back to AI detection:', error);
    }
  }

  // Fallback to original AI detection logic
  const info = staticInfo || detectedInfo;
  if (!info && (!detectedInfo || detectedInfo.confidence < 5)) {
    return;
  }

  showBadge(info);

  if (detectedInfo && detectedInfo.confidence > 0) {
    console.log('GreenScore AI Detection Results:', detectedInfo);
  }
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

  // Show letter grade if available, otherwise show old format
  const scoreDisplay = info?.letterGrade ? `${info.letterGrade}` : `${info?.rating || '?'}/5`;
  let tooltipContent = `<strong>GreenScore: ${scoreDisplay}</strong><br>`;

  if (info) {
    if (info.model) {
      tooltipContent += `AI Model: ${info.model}<br>`;
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

    // Show detection details if this was detected (not from static data)
    if (info.detectedSources && info.confidence) {
      tooltipContent += `<br><strong>AI Detection Details:</strong><br>`;

      // Add explanation based on detection type
      const detectionExplanations = {
        'primary_ai_service': 'This is a primary AI service website',
        'api_usage': 'Direct AI API calls detected on this page',
        'heavy_ai_content': 'Heavy AI-related content found',
        'partial_ai_features': 'Site has some AI features or mentions',
        'light_ai_content': 'Light AI-related content detected'
      };

      if (info.detectedSources.detectionType && detectionExplanations[info.detectedSources.detectionType]) {
        tooltipContent += `${detectionExplanations[info.detectedSources.detectionType]}<br>`;
      }

      tooltipContent += `Confidence: ${info.confidence}%<br>`;

      if (info.detectedSources.domain) {
        tooltipContent += `Primary AI Domain: ${info.detectedSources.domain}<br>`;
      }

      if (info.detectedSources.partialDomain) {
        tooltipContent += `Platform: ${info.detectedSources.partialDomain}<br>`;
      }

      if (info.detectedSources.keywords.length > 0) {
        tooltipContent += `AI Keywords: ${info.detectedSources.keywords.slice(0, 3).join(', ')}${info.detectedSources.keywords.length > 3 ? '...' : ''}<br>`;
      }

      if (info.detectedSources.elements.length > 0) {
        tooltipContent += `AI Elements: ${info.detectedSources.elements.length} found<br>`;
      }

      if (info.detectedSources.apis.length > 0) {
        tooltipContent += `AI APIs: ${info.detectedSources.apis.length} detected<br>`;
      }
    }

    tooltipContent += `<br><em>Click to see detailed breakdown</em>`;
  } else {
    tooltipContent += 'No environmental data available<br>';
    tooltipContent += `<br><em>Click to see detailed breakdown</em>`;
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

    badge.addEventListener('click', () => {
      // Open the extension popup
      chrome.runtime.sendMessage({ action: 'openPopup' });
    });
  }

  // Store the info object on the badge element so event handlers can access it
  badge._greenScoreInfo = info;

  // Remove old event listeners and add new ones with current info
  badge.removeEventListener('mouseenter', badge._mouseEnterHandler);
  badge.removeEventListener('mouseleave', badge._mouseLeaveHandler);

  badge._mouseEnterHandler = (event) => {
    badge.style.opacity = '0.9';
    showTooltip(badge, badge._greenScoreInfo, event);
  };

  badge._mouseLeaveHandler = () => {
    badge.style.opacity = '1';
    hideTooltip();
  };

  badge.addEventListener('mouseenter', badge._mouseEnterHandler);
  badge.addEventListener('mouseleave', badge._mouseLeaveHandler);

  if (info?.rating != null) {
    // Use letter grade if available, otherwise use the rating
    const displayScore = info?.letterGrade ? `${info.letterGrade}` : `${info?.rating || '?'}/5`;
    badge.textContent = `🌱 GreenScore: ${displayScore}`;

    // Use environmental color if available, otherwise use old color system
    if (info.color) {
      badge.style.backgroundColor = info.color;
    } else {
      badge.style.backgroundColor = getBadgeColor(info.rating);
    }
  } else {
    badge.textContent = '🌱 GreenScore: ?';
    badge.style.backgroundColor = '#9e9e9e';
  }
}

// AI detection patterns
const AI_PATTERNS = {
  // Common AI service domains and subdomains
  domains: [
    'openai.com', 'chatgpt.com', 'claude.ai', 'anthropic.com',
    'gemini.google.com', 'bard.google.com', 'cohere.ai',
    'huggingface.co', 'replicate.com', 'stability.ai',
    'midjourney.com', 'runwayml.com', 'character.ai',
    'perplexity.ai', 'you.com', 'poe.com', 'jasper.ai',
    'copy.ai', 'writesonic.com'
  ],

  // Domains that may have AI features but aren't primarily AI services
  partialAIDomains: [
    'notion.so', 'github.com', 'stackoverflow.com', 'reddit.com'
  ],

  // AI-related keywords to search for in page content
  keywords: [
    'gpt', 'chatgpt', 'claude', 'gemini', 'bard', 'llama', 'llama2', 'llama3',
    'artificial intelligence', 'machine learning', 'neural network',
    'deep learning', 'transformer', 'language model', 'ai model',
    'openai', 'anthropic', 'cohere', 'hugging face', 'huggingface',
    'ai-powered', 'ai assistant', 'chatbot', 'ai chat', 'generative ai',
    'large language model', 'llm', 'natural language processing', 'nlp',
    'computer vision', 'text generation', 'ai writing', 'ai content',
    'copilot', 'github copilot', 'ai code', 'ai programming',
    'stable diffusion', 'dall-e', 'midjourney', 'ai art', 'ai image'
  ],

  // API endpoints that might indicate AI usage
  apiPatterns: [
    /api\.openai\.com/i,
    /api\.anthropic\.com/i,
    /api\.cohere\.ai/i,
    /generativelanguage\.googleapis\.com/i,
    /api\.replicate\.com/i,
    /api\.stability\.ai/i,
    /api\.huggingface\.co/i,
    /inference\.huggingface\.co/i,
    /api\.together\.xyz/i,
    /api\.perplexity\.ai/i
  ],

  // HTML elements that might contain AI references
  selectors: [
    '[data-model]',
    '[data-ai]',
    '.ai-powered',
    '.gpt',
    '.claude',
    '.gemini',
    '.chatbot',
    '.ai-chat',
    '.ai-assistant',
    '[class*="ai"]',
    '[id*="ai"]',
    '[class*="gpt"]',
    '[id*="gpt"]',
    '[class*="chat"]',
    '[id*="chat"]',
    '[class*="bot"]',
    '[id*="bot"]'
  ]
};

// Function to detect AI sources on the current page
function detectAISources() {
  const detectedSources = {
    domain: null,
    partialDomain: null,
    keywords: [],
    elements: [],
    apis: [],
    confidence: 0,
    detectionType: 'none'
  };

  const hostname = window.location.hostname.replace("www.", "");

  // Check if current domain is a known AI service
  const matchedDomain = AI_PATTERNS.domains.find(domain =>
    hostname.includes(domain) || domain.includes(hostname)
  );

  if (matchedDomain) {
    detectedSources.domain = matchedDomain;
    detectedSources.confidence += 50;
    detectedSources.detectionType = 'primary_ai_service';
  }

  // Check if it's a partial AI domain (like GitHub, Notion)
  const matchedPartialDomain = AI_PATTERNS.partialAIDomains.find(domain =>
    hostname.includes(domain) || domain.includes(hostname)
  );

  if (matchedPartialDomain && !matchedDomain) {
    detectedSources.partialDomain = matchedPartialDomain;
    detectedSources.confidence += 10; // Lower confidence for partial domains
    detectedSources.detectionType = 'partial_ai_features';
  }

  // Search for AI keywords in page text
  const pageText = document.body.innerText.toLowerCase();
  const foundKeywords = [];
  AI_PATTERNS.keywords.forEach(keyword => {
    if (pageText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
      detectedSources.confidence += 3; // Reduced from 5 to be less aggressive
    }
  });
  detectedSources.keywords = foundKeywords;

  // Search for AI-related HTML elements
  AI_PATTERNS.selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        detectedSources.elements.push({
          selector: selector,
          count: elements.length,
          elements: Array.from(elements).slice(0, 3).map(el => ({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            text: el.innerText?.substring(0, 100) || ''
          }))
        });
        detectedSources.confidence += Math.min(elements.length * 2, 10); // Cap element contribution
      }
    } catch (e) {
      // Ignore invalid selectors
    }
  });

  // Monitor network requests for AI API calls
  if (window.performance && window.performance.getEntriesByType) {
    const networkEntries = window.performance.getEntriesByType('resource');
    networkEntries.forEach(entry => {
      AI_PATTERNS.apiPatterns.forEach(pattern => {
        if (pattern.test(entry.name)) {
          detectedSources.apis.push({
            url: entry.name,
            type: entry.initiatorType,
            duration: entry.duration
          });
          detectedSources.confidence += 25; // Higher confidence for API calls
          detectedSources.detectionType = 'api_usage';
        }
      });
    });
  }

  // Adjust detection type based on what we found
  if (detectedSources.keywords.length > 5 && detectedSources.elements.length > 3) {
    detectedSources.detectionType = 'heavy_ai_content';
  } else if (detectedSources.keywords.length > 0 || detectedSources.elements.length > 0) {
    if (detectedSources.detectionType === 'none') {
      detectedSources.detectionType = 'light_ai_content';
    }
  }

  // Cap confidence at 100
  detectedSources.confidence = Math.min(detectedSources.confidence, 100);

  return detectedSources;
}

// Function to estimate environmental impact based on detected AI usage
function estimateEnvironmentalImpact(detectedSources) {
  let rating = 5; // Start with best rating
  let model = 'Unknown AI';
  let energy = 'unknown';
  let water = 'unknown';

  // Handle different detection types with more nuanced scoring
  switch (detectedSources.detectionType) {
    case 'primary_ai_service':
      rating = 2; // High impact for primary AI services
      energy = 'high';
      water = 'high';
      break;
    case 'api_usage':
      rating = 2; // High impact for direct API usage
      energy = 'high';
      water = 'high';
      break;
    case 'heavy_ai_content':
      rating = 3; // Medium impact for heavy AI content
      energy = 'medium';
      water = 'medium';
      break;
    case 'partial_ai_features':
      rating = 4; // Low impact for sites with some AI features
      energy = 'low';
      water = 'low';
      break;
    case 'light_ai_content':
      rating = 4; // Low impact for light AI mentions
      energy = 'low';
      water = 'low';
      break;
    default:
      rating = 5; // No impact if no AI detected
      break;
  }

  // Try to identify specific AI model
  if (detectedSources.domain) {
    if (detectedSources.domain.includes('chatgpt') || detectedSources.domain.includes('openai')) {
      model = 'GPT-4';
      rating = Math.min(rating, 2);
    } else if (detectedSources.domain.includes('claude') || detectedSources.domain.includes('anthropic')) {
      model = 'Claude';
      rating = Math.min(rating, 3);
    } else if (detectedSources.domain.includes('gemini') || detectedSources.domain.includes('bard')) {
      model = 'Gemini';
      rating = Math.min(rating, 2);
    }
  }

  // Handle partial domains more intelligently
  if (detectedSources.partialDomain) {
    if (detectedSources.partialDomain.includes('github.com')) {
      // GitHub might have Copilot or AI-related repos
      if (detectedSources.keywords.some(k => k.includes('copilot') || k.includes('ai'))) {
        model = 'GitHub Copilot/AI Features';
        rating = 3; // Medium impact
      } else {
        model = 'Potential AI Features';
        rating = 4; // Low impact - just mentions
      }
    } else if (detectedSources.partialDomain.includes('notion.so')) {
      model = 'Notion AI';
      rating = 3; // Medium impact
    }
  }

  // Check keywords for model identification
  const keywordText = detectedSources.keywords.join(' ').toLowerCase();
  if (keywordText.includes('gpt-4') || keywordText.includes('chatgpt')) {
    model = 'GPT-4';
    rating = Math.min(rating, 2);
  } else if (keywordText.includes('claude')) {
    model = 'Claude';
    rating = Math.min(rating, 3);
  } else if (keywordText.includes('gemini')) {
    model = 'Gemini';
    rating = Math.min(rating, 2);
  } else if (keywordText.includes('copilot')) {
    model = 'GitHub Copilot';
    rating = Math.min(rating, 3);
  }

  return {
    model,
    energy,
    water,
    rating,
    detectedSources,
    confidence: detectedSources.confidence
  };
}

// Enhanced badge showing function with AI detection
function showBadgeWithDetection(staticInfo, detectedInfo) {
  // Prefer static data over detected data, but show detected if no static data
  const info = staticInfo || detectedInfo;

  if (!info && (!detectedInfo || detectedInfo.confidence < 5)) {
    return; // Don't show badge if confidence is too low
  }

  showBadge(info);

  // Log detection results for debugging
  if (detectedInfo && detectedInfo.confidence > 0) {
    console.log('GreenScore AI Detection Results:', detectedInfo);
  }
}

// Load external data and perform AI detection
Promise.all([
  fetch("https://raw.githubusercontent.com/moralesk/greenScore_extension/main/data/site-models.json")
    .then(res => res.json())
    .catch(err => {
      console.error("Failed to load GreenScore data:", err);
      return {};
    }),

  // Perform AI detection
  new Promise(resolve => {
    // Wait a bit for page to load completely
    setTimeout(() => {
      const detectedSources = detectAISources();
      const estimatedImpact = estimateEnvironmentalImpact(detectedSources);
      resolve(estimatedImpact);
    }, 1000);
  })
]).then(([staticData, detectedData]) => {
  const hostname = window.location.hostname.replace("www.", "");
  const staticInfo = staticData[hostname];

  showBadgeWithEnvironmentalData(staticInfo, detectedData);
});

// Re-run detection when page content changes (for SPAs)
let detectionTimeout;
const observer = new MutationObserver(() => {
  clearTimeout(detectionTimeout);
  detectionTimeout = setTimeout(() => {
    const detectedSources = detectAISources();
    const estimatedImpact = estimateEnvironmentalImpact(detectedSources);

    // Only update if we have reasonable confidence
    if (estimatedImpact.confidence > 5) {
      fetch("https://raw.githubusercontent.com/moralesk/greenScore_extension/main/data/site-models.json")
        .then(res => res.json())
        .then(staticData => {
          const hostname = window.location.hostname.replace("www.", "");
          const staticInfo = staticData[hostname];
          showBadgeWithDetection(staticInfo, estimatedImpact);
        })
        .catch(() => {
          showBadgeWithDetection(null, estimatedImpact);
        });
    }
  }, 2000);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
});
