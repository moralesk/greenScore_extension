# 🌱 GreenScore Extension

**Real-time environmental impact assessment for websites and AI tools**

GreenScore automatically calculates the environmental footprint of websites you visit, with special focus on AI-powered services that have significantly higher energy consumption.

## ✨ Features

### 🔍 **Automatic Detection**
- **Real-time CO2 calculations** based on page size and data transfer
- **AI model detection** for ChatGPT, Claude, Gemini, and other AI services
- **Green hosting verification** via the Green Web Foundation API
- **Dynamic impact multipliers** based on AI processing requirements

### 📊 **Smart Scoring**
- **Letter grades (A+ to F)** for quick environmental assessment
- **Detailed breakdowns** showing base website vs. AI processing impact
- **CO2 and water usage tracking** for complete environmental picture
- **Color-coded indicators** for immediate visual feedback
- **Contextual tooltips** with calculation methodology

### 🤖 **AI Impact Analysis**
- **3-3.5x multipliers** for primary AI services (ChatGPT, Claude, Gemini)
- **1.5-1.8x multipliers** for AI features (GitHub Copilot, Notion AI)
- **Separate tracking** of base website vs. AI processing emissions
- **Model-specific detection** with tailored environmental impact scores

## 🚀 Installation

1. **Download** the extension files
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select the `extension` folder
5. **Pin the extension** to your toolbar for easy access

## 📱 How to Use

### **Browser Badge**
- Shows letter grade (A+ to F) in your toolbar
- **Hover** for detailed environmental breakdown
- **Click** to open full popup with comprehensive data

### **On-Page Badge**
- Appears on websites with environmental impact data
- **Hover** for tooltip with AI and environmental sections
- **Click** to open extension popup

### **Popup Interface**
- **Letter grade** with color coding
- **AI Processing section** (when detected) showing model and additional impact
- **Environmental Impact section** with CO2, page size, and green hosting status
- **Donation links** to environmental charities

## 🌍 Environmental Data

### **What We Calculate**
- **CO2 emissions per visit** based on data transfer and energy usage
- **Water usage per visit** for data center cooling and processing
- **Page size impact** measured in real-time
- **Green hosting bonus** for renewable energy-powered websites
- **AI processing overhead** with model-specific multipliers for both CO2 and water

### **Data Sources**
- **[Green Web Foundation API](https://www.thegreenwebfoundation.org/)** - Renewable energy hosting verification
- **Real-time page analysis** - Actual data transfer measurements
- **Built-in AI detection** - Pattern matching for AI services and content

## 🤝 Contributing

### **When to Report Missing Data**
We automatically calculate most environmental data, but you can help by reporting:

- 🤖 **Missing AI detection** - AI-powered sites we haven't identified
- 🌐 **Incorrect green hosting** - Wrong renewable energy status
- 📊 **Unusual environmental impact** - Significantly different than calculated

### **How to Contribute**
[**Report Missing Data**](https://github.com/moralesk/greenScore_extension/issues/new?template=missing-data.yml) - Use our structured form to report detection issues

For detailed guidelines, see [CONTRIBUTING.md](CONTRIBUTING.md)

## 🔧 Technical Details

### **Architecture**
- **Single source of truth** - `green-calculator.js` handles all environmental calculations
- **Real-time APIs** - Live data from Green Web Foundation and page analysis
- **Fallback systems** - Graceful degradation when APIs are unavailable
- **CSP compliance** - Works on all websites including those with strict security policies

### **Scoring Algorithm**
```
Base Score (0-100):
- <1g CO2: 90-100 (A+/A)
- 1-2g CO2: 80-89 (A)  
- 2-5g CO2: 70-79 (B)
- 5-10g CO2: 60-69 (C)
- 10-20g CO2: 40-59 (D)
- >20g CO2: 0-39 (F)

AI Multipliers (CO2 & Water):
- ChatGPT/GPT-4: 3.5x
- Gemini: 3.2x  
- Claude: 3.0x
- GitHub Copilot: 1.8x
- Notion AI: 1.6x

Water Usage Factors:
- Base: 1.8L per kWh
- AI Processing: 2.5x multiplier (cooling)
- Green Hosting: 30% reduction

Green Hosting Bonus: +10 points
```

## 📈 Impact

Help users make informed decisions about their digital environmental footprint by providing:
- **Transparency** into website and AI service energy consumption
- **Actionable insights** for choosing more sustainable alternatives  
- **Environmental awareness** integrated into daily browsing
- **Support channels** for environmental organizations

## 📄 License

This project is open source. See the repository for license details.

---

💡 **Found missing data?** [Report it here](https://github.com/moralesk/greenScore_extension/issues/new?template=missing-data.yml) | 🌍 **Support environmental action** through the donation links in the extension
