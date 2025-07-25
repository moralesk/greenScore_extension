# Contributing to GreenScore

Thank you for helping improve GreenScore! 🌱

## How GreenScore Works

GreenScore automatically calculates environmental impact using:
- **Real-time CO2 calculations** based on page size and data transfer
- **Green hosting detection** via the Green Web Foundation API  
- **Dynamic AI pattern system** that updates automatically from GitHub
- **Community-driven AI detection** for sites using ChatGPT, Claude, Gemini, etc.
- **Dynamic impact multipliers** based on AI processing requirements

## When to Contribute

You only need to contribute data if:

### 🤖 **Missing AI Detection**
Our system missed an AI-powered site or incorrectly identified the AI model

### 🌐 **Incorrect Green Hosting Status**  
You know a website uses renewable energy but we show it as standard hosting

### 📊 **Unusual Environmental Impact**
A site has significantly different CO2 or water usage than our calculations suggest

## How to Contribute

### Option 1: Quick GitHub Issue (Recommended)
[Create a new issue](https://github.com/moralesk/greenScore_extension/issues/new) with:
- **Website URL**
- **What's wrong/missing** (e.g., "Uses GPT-4 but not detected")
- **Correct information** (if known)

### Option 2: Direct AI Patterns Update (Advanced)
If you're comfortable with JSON, you can directly update [`data/ai-patterns.json`](data/ai-patterns.json):

```json
{
  "version": "1.1.0",
  "lastUpdated": "2025-01-25",
  "domains": [
    "newai.com"
  ],
  "multipliers": {
    "newai.com": 2.8
  }
}
```

**AI Multipliers:**
- `3.5` = Very High Impact (ChatGPT, GPT-4)
- `3.2` = High Impact (Gemini)
- `3.0` = High Impact (Claude)
- `1.8` = Medium Impact (GitHub Copilot)
- `1.6` = Medium Impact (Notion AI)
- `1.5` = Low Impact (Basic AI features)

## 🔄 Dynamic Update System

### **How It Works**
1. **AI patterns stored** in [`data/ai-patterns.json`](data/ai-patterns.json)
2. **Extension fetches** patterns from GitHub every 24 hours
3. **Your contributions** automatically reach all users
4. **Version controlled** - track changes and ensure quality

### **What Gets Updated Automatically**
- **New AI domains** - Add newly discovered AI services
- **Impact multipliers** - Adjust environmental impact factors
- **Detection keywords** - Improve AI content recognition
- **API patterns** - Detect new AI service endpoints

### **Contributing AI Patterns**
When reporting missing AI detection, include:
- **Domain name** (e.g., "newai.com")
- **AI model type** (e.g., "GPT-4", "Claude", "Custom LLM")
- **Service type** (Primary AI service vs. AI features)
- **Evidence** (screenshots, documentation links)

## What We Don't Need

❌ **Basic website data** - We calculate this automatically  
❌ **Standard AI sites** - ChatGPT, Claude, Gemini are already detected  
❌ **Page size estimates** - We measure this in real-time  
❌ **Generic hosting info** - We check this via API  

## Questions?

- Check existing [issues](https://github.com/moralesk/greenScore_extension/issues)
- Review our [detection patterns](https://github.com/moralesk/greenScore_extension/blob/main/extension/green-calculator.js#L150-L170)
- Open a [discussion](https://github.com/moralesk/greenScore_extension/discussions) for questions

Thanks for helping make the web more environmentally conscious! 🌍
