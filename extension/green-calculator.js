// GreenScore Environmental Impact Calculator
// Single source of truth for all environmental calculations

const GreenCalculator = {
    // Constants based on CO2.js methodology
    CONSTANTS: {
        KWH_PER_BYTE: 0.000000006,
        GRID_INTENSITY: 519, // gCO2/kWh global average
        GREEN_HOSTING_FACTOR: 0.5,
        DEFAULT_PAGE_SIZE: 2000000, // 2MB fallback
        SPECIAL_PAGE_SIZE: 1000000, // 1MB for chrome:// etc
        API_TIMEOUT: 3000 // 3 seconds
    },

    // Core calculation function
    calculateCO2: function (bytes, isGreen = false) {
        const energy = bytes * this.CONSTANTS.KWH_PER_BYTE;
        const intensity = isGreen ?
            this.CONSTANTS.GRID_INTENSITY * this.CONSTANTS.GREEN_HOSTING_FACTOR :
            this.CONSTANTS.GRID_INTENSITY;
        return energy * intensity; // grams of CO2
    },

    // Convert CO2 grams to 0-100 score
    calculateGreenScore: function (co2Grams, isGreen = false) {
        let baseScore;

        if (co2Grams < 1) baseScore = 90;
        else if (co2Grams < 2) baseScore = 80;
        else if (co2Grams < 5) baseScore = 70;
        else if (co2Grams < 10) baseScore = 60;
        else if (co2Grams < 20) baseScore = 40;
        else baseScore = 20;

        // Bonus for green hosting
        if (isGreen) baseScore = Math.min(100, baseScore + 10);

        return Math.round(baseScore);
    },

    // Get color for score
    getScoreColor: function (score) {
        if (score >= 90) return '#388e3c'; // dark green
        if (score >= 80) return '#7cb342'; // light green
        if (score >= 70) return '#c0ca33'; // yellow-green
        if (score >= 60) return '#fbc02d'; // yellow
        if (score >= 40) return '#f57c00'; // orange
        return '#d32f2f'; // red
    },

    // Get rating text for score
    getScoreRating: function (score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        if (score >= 40) return 'Poor';
        return 'Very Poor';
    },

    // Get letter grade for score
    getLetterGrade: function (score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 40) return 'D';
        return 'F';
    },

    // Format CO2 display
    formatCO2: function (co2Grams) {
        return co2Grams < 1 ?
            `${(co2Grams * 1000).toFixed(0)}mg` :
            `${co2Grams.toFixed(1)}g`;
    },

    // Format page size display
    formatPageSize: function (bytes) {
        return bytes > 1000000 ?
            `${(bytes / 1000000).toFixed(1)}MB` :
            `${(bytes / 1000).toFixed(0)}KB`;
    },

    // Check if URL is a special page that can't be fetched
    isSpecialUrl: function (url) {
        return url.startsWith('chrome://') ||
            url.startsWith('chrome-extension://') ||
            url.startsWith('moz-extension://') ||
            url.startsWith('about:');
    },

    // Timeout wrapper for promises
    withTimeout: function (promise, timeoutMs = this.CONSTANTS.API_TIMEOUT) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
            )
        ]);
    },

    // Check green hosting via API
    checkGreenHosting: async function (domain) {
        try {
            const response = await this.withTimeout(
                fetch(`https://api.thegreenwebfoundation.org/greencheck/${domain}`, {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' },
                    mode: 'cors'
                })
            );

            if (!response.ok) {
                console.log('Green hosting API response not ok:', response.status);
                return false;
            }

            const data = await response.json();
            return data.green || false;
        } catch (error) {
            // Handle CSP and network errors gracefully
            if (error.message.includes('CSP') || error.message.includes('Content Security Policy')) {
                console.log('CSP restriction detected, using fallback for green hosting check');
            } else {
                console.log('Green hosting check failed:', error.message);
            }
            return false;
        }
    },

    // Get page size via HEAD request
    getPageSize: async function (url) {
        try {
            if (this.isSpecialUrl(url)) {
                return this.CONSTANTS.SPECIAL_PAGE_SIZE;
            }

            const response = await this.withTimeout(
                fetch(url, { method: 'HEAD', mode: 'cors' })
            );

            const contentLength = response.headers.get('content-length');
            if (contentLength) {
                return parseInt(contentLength);
            }

            return this.CONSTANTS.DEFAULT_PAGE_SIZE;
        } catch (error) {
            console.log('Page size check failed:', error);
            return this.CONSTANTS.DEFAULT_PAGE_SIZE;
        }
    },

    // AI detection patterns
    AI_PATTERNS: {
        domains: [
            'openai.com', 'chatgpt.com', 'claude.ai', 'anthropic.com',
            'gemini.google.com', 'bard.google.com', 'cohere.ai',
            'huggingface.co', 'replicate.com', 'stability.ai',
            'midjourney.com', 'runwayml.com', 'character.ai',
            'perplexity.ai', 'you.com', 'poe.com', 'jasper.ai',
            'copy.ai', 'writesonic.com'
        ],
        partialAIDomains: [
            'notion.so', 'github.com', 'stackoverflow.com', 'reddit.com'
        ],
        keywords: [
            'gpt', 'chatgpt', 'claude', 'gemini', 'bard', 'llama',
            'artificial intelligence', 'machine learning', 'neural network',
            'deep learning', 'transformer', 'language model', 'ai model',
            'openai', 'anthropic', 'cohere', 'hugging face',
            'ai-powered', 'ai assistant', 'chatbot', 'ai chat', 'generative ai',
            'large language model', 'llm', 'copilot', 'ai code'
        ]
    },

    // Detect AI usage on a page
    detectAIUsage: function (url, pageContent = '') {
        const domain = new URL(url).hostname.replace(/^www\./, '');
        let aiImpactMultiplier = 1.0;
        let aiDetected = false;
        let aiType = 'none';
        let aiModel = null;

        // Check for primary AI service domains
        const matchedDomain = this.AI_PATTERNS.domains.find(aiDomain =>
            domain.includes(aiDomain) || aiDomain.includes(domain)
        );

        if (matchedDomain) {
            aiDetected = true;
            aiType = 'primary_ai_service';
            aiImpactMultiplier = 3.0; // 3x environmental impact for AI services

            // Identify specific AI models
            if (matchedDomain.includes('chatgpt') || matchedDomain.includes('openai')) {
                aiModel = 'GPT-4';
                aiImpactMultiplier = 3.5;
            } else if (matchedDomain.includes('claude') || matchedDomain.includes('anthropic')) {
                aiModel = 'Claude';
                aiImpactMultiplier = 3.0;
            } else if (matchedDomain.includes('gemini') || matchedDomain.includes('bard')) {
                aiModel = 'Gemini';
                aiImpactMultiplier = 3.2;
            }
        }

        // Check for partial AI domains
        const matchedPartialDomain = this.AI_PATTERNS.partialAIDomains.find(aiDomain =>
            domain.includes(aiDomain) || aiDomain.includes(domain)
        );

        if (matchedPartialDomain && !matchedDomain) {
            // Check page content for AI keywords to determine if AI features are being used
            const keywordCount = this.AI_PATTERNS.keywords.filter(keyword =>
                pageContent.toLowerCase().includes(keyword.toLowerCase())
            ).length;

            if (keywordCount > 3) {
                aiDetected = true;
                aiType = 'ai_features';
                aiImpactMultiplier = 1.5; // 1.5x impact for sites with AI features

                if (matchedPartialDomain.includes('github.com') && pageContent.toLowerCase().includes('copilot')) {
                    aiModel = 'GitHub Copilot';
                    aiImpactMultiplier = 1.8;
                } else if (matchedPartialDomain.includes('notion.so')) {
                    aiModel = 'Notion AI';
                    aiImpactMultiplier = 1.6;
                }
            }
        }

        return {
            aiDetected,
            aiType,
            aiModel,
            aiImpactMultiplier,
            domain: matchedDomain || matchedPartialDomain
        };
    },

    // Main calculation function - returns complete environmental data with AI breakdown
    calculateEnvironmentalImpact: async function (url, pageContent = '') {
        try {
            const domain = new URL(url).hostname.replace(/^www\./, '');

            // Get environmental data
            const [pageSize, isGreen] = await Promise.all([
                this.getPageSize(url),
                this.checkGreenHosting(domain)
            ]);

            // Detect AI usage
            const aiAnalysis = this.detectAIUsage(url, pageContent);

            // Calculate base environmental impact
            const baseCO2 = this.calculateCO2(pageSize, isGreen);

            // Apply AI multiplier if AI is detected
            const totalCO2 = baseCO2 * aiAnalysis.aiImpactMultiplier;
            const aiCO2 = totalCO2 - baseCO2; // Additional CO2 from AI usage

            // Calculate scores
            const baseScore = this.calculateGreenScore(baseCO2, isGreen);
            const totalScore = this.calculateGreenScore(totalCO2, isGreen);

            return {
                success: true,
                // Overall metrics
                score: totalScore,
                letterGrade: this.getLetterGrade(totalScore),
                rating: this.getScoreRating(totalScore),
                color: this.getScoreColor(totalScore),
                co2Grams: totalCO2,
                co2Display: this.formatCO2(totalCO2),

                // Base website metrics
                baseCO2: baseCO2,
                baseCO2Display: this.formatCO2(baseCO2),
                baseScore: baseScore,

                // AI-specific metrics
                aiDetected: aiAnalysis.aiDetected,
                aiType: aiAnalysis.aiType,
                aiModel: aiAnalysis.aiModel,
                aiCO2: aiCO2,
                aiCO2Display: this.formatCO2(aiCO2),
                aiImpactMultiplier: aiAnalysis.aiImpactMultiplier,

                // Infrastructure metrics
                pageSize: pageSize,
                pageSizeDisplay: this.formatPageSize(pageSize),
                isGreen: isGreen,
                domain: domain,
                url: url,
                timestamp: Date.now()
            };
        } catch (error) {
            console.error('Environmental calculation failed:', error);

            // Return fallback data
            const fallbackPageSize = this.CONSTANTS.DEFAULT_PAGE_SIZE;
            const fallbackCO2 = this.calculateCO2(fallbackPageSize, false);
            const fallbackScore = this.calculateGreenScore(fallbackCO2, false);

            return {
                success: false,
                score: fallbackScore,
                letterGrade: this.getLetterGrade(fallbackScore),
                rating: this.getScoreRating(fallbackScore),
                color: this.getScoreColor(fallbackScore),
                co2Grams: fallbackCO2,
                co2Display: `~${this.formatCO2(fallbackCO2)}`,
                baseCO2: fallbackCO2,
                baseCO2Display: `~${this.formatCO2(fallbackCO2)}`,
                baseScore: fallbackScore,
                aiDetected: false,
                aiType: 'none',
                aiModel: null,
                aiCO2: 0,
                aiCO2Display: '0g',
                aiImpactMultiplier: 1.0,
                pageSize: fallbackPageSize,
                pageSizeDisplay: `~${this.formatPageSize(fallbackPageSize)}`,
                isGreen: null,
                domain: 'unknown',
                url: url,
                timestamp: Date.now(),
                error: error.message
            };
        }
    },

    // Generate detailed tooltip HTML with separate AI and environmental sections
    generateTooltip: function (data) {
        const statusText = data.success ? '' : ' (estimated)';
        const greenHostingText = data.isGreen === null ? '❓ Unknown' : (data.isGreen ? '✅ Yes' : '❌ No');

        let tooltipHTML = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.4;">`;
        tooltipHTML += `<div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; color: ${data.color};">GreenScore: ${data.letterGrade}</div>`;

        // AI Section
        tooltipHTML += `<div style="margin-bottom: 8px; padding: 6px; background-color: #fff3e0; border-left: 3px solid #ff6b35; border-radius: 3px;">`;
        tooltipHTML += `<strong style="color: #ff6b35;">🤖 AI PROCESSING</strong><br>`;
        tooltipHTML += `<div style="font-size: 12px; margin-top: 4px;">`;

        if (data.aiDetected && data.aiModel) {
            tooltipHTML += `• AI Model: ${data.aiModel}<br>`;
            tooltipHTML += `• Type: ${data.aiType}<br>`;
            tooltipHTML += `• Impact: ${data.aiCO2Display} additional CO2<br>`;
            tooltipHTML += `• Multiplier: ${data.aiImpactMultiplier}x`;
        } else {
            tooltipHTML += `<span style="color: #999; font-style: italic;">No AI processing detected</span>`;
        }
        tooltipHTML += `</div></div>`;

        // Environmental Section
        tooltipHTML += `<div style="margin-bottom: 8px; padding: 6px; background-color: #f1f8e9; border-left: 3px solid #4caf50; border-radius: 3px;">`;
        tooltipHTML += `<strong style="color: #4caf50;">🌍 ENVIRONMENTAL IMPACT</strong><br>`;
        tooltipHTML += `<div style="font-size: 12px; margin-top: 4px;">`;

        if (data.success || data.co2Display) {
            if (data.aiDetected) {
                tooltipHTML += `• Base website: ${data.baseCO2Display}<br>`;
                tooltipHTML += `• Total CO2: ${data.co2Display}${statusText}<br>`;
            } else {
                tooltipHTML += `• CO2 per visit: ${data.co2Display}${statusText}<br>`;
            }
            tooltipHTML += `• Page size: ${data.pageSizeDisplay}${statusText}<br>`;
            tooltipHTML += `• Green hosting: ${greenHostingText}<br>`;
            tooltipHTML += `• Rating: ${data.rating} ${this.getScoreEmoji(data.score)}${statusText}`;
        } else {
            tooltipHTML += `<span style="color: #999; font-style: italic;">Environmental data unavailable</span>`;
        }
        tooltipHTML += `</div></div>`;

        tooltipHTML += `</div>`;

        return tooltipHTML;
    },

    // Get emoji for score (matches popup format)
    getScoreEmoji: function (score) {
        if (score >= 90) return '🌟';
        if (score >= 80) return '🌱';
        if (score >= 70) return '👍';
        if (score >= 60) return '⚠️';
        if (score >= 40) return '😟';
        return '🚨';
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GreenCalculator;
}
