# Contributing to GreenScore

Thank you for helping improve GreenScore! 🌱

## How GreenScore Works

GreenScore automatically calculates environmental impact using:
- **Real-time CO2 calculations** based on page size and data transfer
- **Green hosting detection** via the Green Web Foundation API  
- **AI model detection** for sites using ChatGPT, Claude, Gemini, etc.
- **Dynamic impact multipliers** based on AI processing requirements

## When to Contribute

You only need to contribute data if:

### 🤖 **Missing AI Detection**
Our system missed an AI-powered site or incorrectly identified the AI model

### 🌐 **Incorrect Green Hosting Status**  
You know a website uses renewable energy but we show it as standard hosting

### 📊 **Unusual Environmental Impact**
A site has significantly different environmental impact than our calculations suggest

## How to Contribute

### Option 1: Quick GitHub Issue (Recommended)
[Create a new issue](https://github.com/moralesk/greenScore_extension/issues/new) with:
- **Website URL**
- **What's wrong/missing** (e.g., "Uses GPT-4 but not detected")
- **Correct information** (if known)

### Option 2: Direct JSON Update (Advanced)
If you're comfortable with JSON, you can directly update `data/site-models.json`:

```json
{
  "example.com": {
    "model": "GPT-4",
    "rating": 2,
    "energy": "high",
    "water": "high",
    "notes": "Primary AI service with heavy processing"
  }
}
```

**Rating Scale:**
- `5` = Excellent (minimal environmental impact)
- `4` = Good (low impact)  
- `3` = Fair (moderate impact)
- `2` = Poor (high impact)
- `1` = Very Poor (very high impact)

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
