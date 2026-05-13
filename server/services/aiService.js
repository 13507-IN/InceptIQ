const geminiService = require('./geminiService');
const grokService = require('./grokService');

class AIService {
    async _tryGrok(method, ...args) {
        if (grokService.isAvailable()) {
            try {
                return await grokService[method](...args);
            } catch (error) {
                console.warn(`Grok ${method} failed, falling back to Gemini:`, error.message);
            }
        } else {
            console.log('Grok not configured (GROK_API_KEY not set). Using Gemini.');
        }
        return await geminiService[method](...args);
    }

    async analyzeStartupIdea(ideaData) {
        return this._tryGrok('analyzeStartupIdea', ideaData);
    }

    async analyzeStartupIdeaStream(ideaData, onChunk) {
        return this._tryGrok('analyzeStartupIdeaStream', ideaData, onChunk);
    }

    async getQuickInsights(ideaTitle, ideaDescription) {
        return this._tryGrok('getQuickInsights', ideaTitle, ideaDescription);
    }

    async extractFormFieldsFromPdfText(pdfText) {
        return this._tryGrok('extractFormFieldsFromPdfText', pdfText);
    }

    async generateCompetitorReport(competitor, userStartup) {
        return this._tryGrok('generateCompetitorReport', competitor, userStartup);
    }

    async generateIndustryBenchmark(industry, overallScore, ideaTitle) {
        return this._tryGrok('generateIndustryBenchmark', industry, overallScore, ideaTitle);
    }
}

module.exports = new AIService();
