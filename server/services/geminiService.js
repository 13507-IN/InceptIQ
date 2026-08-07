const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is required but not found in environment variables');
        }

        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    }

    async analyzeStartupIdea(ideaData) {
        const { ideaTitle, ideaDescription, targetMarket, businessModel, industry, budget, timeline } = ideaData;

        const prompt = this.createAnalysisPrompt({
            ideaTitle,
            ideaDescription,
            targetMarket,
            businessModel,
            industry,
            budget,
            timeline
        });

        try {
            console.log('Sending request to Gemini AI for startup analysis...');
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const analysisText = response.text();

            // Parse the structured response
            const analysis = this.parseAnalysisResponse(analysisText);

            return {
                success: true,
                analysis,
                rawResponse: analysisText,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Gemini AI analysis failed:', error);
            throw new Error(`AI analysis failed: ${error.message}`);
        }
    }

    /**
     * Streaming version of analyzeStartupIdea.
     * Calls Gemini's generateContentStream and invokes onChunk(text) for every
     * incremental text delta, then returns the final parsed analysis.
     * 
     * @param {object} ideaData   - The startup idea form data
     * @param {function} onChunk  - Called with each raw text chunk as it arrives
     */
    async analyzeStartupIdeaStream(ideaData, onChunk) {
        const { ideaTitle, ideaDescription, targetMarket, businessModel, industry, budget, timeline } = ideaData;

        const prompt = this.createAnalysisPrompt({
            ideaTitle,
            ideaDescription,
            targetMarket,
            businessModel,
            industry,
            budget,
            timeline
        });

        try {
            console.log('🔄 Starting streaming Gemini AI analysis...');
            const streamResult = await this.model.generateContentStream(prompt);

            let fullText = '';
            for await (const chunk of streamResult.stream) {
                const chunkText = chunk.text();
                if (chunkText) {
                    fullText += chunkText;
                    if (typeof onChunk === 'function') {
                        onChunk(chunkText);
                    }
                }
            }

            console.log('✅ Streaming complete. Parsing final response...');
            const analysis = this.parseAnalysisResponse(fullText);

            return {
                success: true,
                analysis,
                rawResponse: fullText,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Gemini AI streaming analysis failed:', error);
            throw new Error(`AI streaming analysis failed: ${error.message}`);
        }
    }

    createAnalysisPrompt(ideaData) {
        return `
You are an expert startup analyst and business consultant. Analyze the following startup idea and provide a comprehensive evaluation in JSON format.

**Startup Idea Details:**
- Title: ${ideaData.ideaTitle}
- Description: ${ideaData.ideaDescription}
- Target Market: ${ideaData.targetMarket || 'Not specified'}
- Business Model: ${ideaData.businessModel || 'Not specified'}
- Industry: ${ideaData.industry || 'Not specified'}
- Budget: ${ideaData.budget || 'Not specified'}
- Timeline: ${ideaData.timeline || 'Not specified'}

Please provide your analysis in the following JSON structure:

{
  "uniquenessScore": [0-100 numeric score],
  "marketViabilityScore": [0-100 numeric score],
  "competitionScore": [0-100 numeric score where higher is better/less competition],
  "moatScore": [0-100 numeric score rating defensibility and barriers to entry],
  "overallScore": [0-100 weighted average score],
  "analysis": {
    "uniqueness": {
      "score": [0-100],
      "summary": "Brief assessment of idea's uniqueness",
      "strengths": ["strength 1", "strength 2"],
      "concerns": ["concern 1", "concern 2"]
    },
    "marketViability": {
      "score": [0-100],
      "summary": "Market potential assessment",
      "marketSize": "Estimated market size (TAM/SAM/SOM breakdown)",
      "targetAudience": "Key customer segments",
      "trends": ["relevant market trend 1", "trend 2"]
    },
    "competition": {
      "score": [0-100],
      "summary": "Competitive landscape overview",
      "directCompetitors": ["competitor 1", "competitor 2"],
      "indirectCompetitors": ["competitor 1", "competitor 2"],
      "competitiveAdvantage": "Your potential advantages"
    },
    "risks": [
      {
        "category": "risk category",
        "description": "detailed risk description",
        "severity": "High/Medium/Low",
        "mitigation": "suggested mitigation strategy"
      }
    ],
    "opportunities": [
      {
        "category": "opportunity category",
        "description": "detailed opportunity description",
        "impact": "High/Medium/Low"
      }
    ]
  },
  "recommendations": [
    {
      "category": "Next Steps/Market Research/Product Development/etc",
      "action": "specific actionable recommendation",
      "priority": "High/Medium/Low",
      "timeline": "suggested timeframe"
    }
  ],
  "financials": {
    "tam": "Total Addressable Market in USD (e.g. $12B)",
    "sam": "Serviceable Addressable Market in USD (e.g. $1.8B)",
    "som": "Serviceable Obtainable Market in USD (e.g. $150M)",
    "ltvCacRatio": "Target LTV:CAC ratio (e.g. 3.5:1)",
    "estimatedMargin": "Projected gross margin percentage (e.g. 75%)"
  },
  "goToMarket": {
    "primaryChannel": "Main customer acquisition channel",
    "strategySummary": "Actionable 90-day launch playbook",
    "targetCAC": "Estimated Cost per Acquisition"
  },
  "keyMetrics": {
    "fundingRequired": "estimated funding needed",
    "timeToMarket": "estimated time to launch",
    "breakEvenPoint": "estimated break-even timeline",
    "scalabilityRating": "High/Medium/Low"
  }
}

Provide only the JSON response without any additional text or markdown formatting.
`;
    }

    parseAnalysisResponse(responseText) {
        try {
            // Clean the response to extract JSON
            const cleanedResponse = responseText
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();

            const analysis = JSON.parse(cleanedResponse);

            // Validate required fields
            const requiredFields = ['uniquenessScore', 'marketViabilityScore', 'competitionScore', 'overallScore', 'analysis'];
            const missingFields = requiredFields.filter(field => !(field in analysis));

            if (missingFields.length > 0) {
                throw new Error(`Missing required fields in AI response: ${missingFields.join(', ')}`);
            }

            return analysis;
        } catch (error) {
            console.error('Failed to parse AI response:', error);
            console.log('Raw response:', responseText);

            // Return a fallback structure
            return {
                uniquenessScore: 50,
                marketViabilityScore: 50,
                competitionScore: 50,
                overallScore: 50,
                analysis: {
                    uniqueness: {
                        score: 50,
                        summary: "Analysis could not be completed. Please try again.",
                        strengths: ["Unable to determine"],
                        concerns: ["Analysis incomplete"]
                    },
                    marketViability: {
                        score: 50,
                        summary: "Market analysis unavailable",
                        marketSize: "Unable to determine",
                        targetAudience: "Analysis incomplete",
                        trends: ["Unable to determine"]
                    },
                    competition: {
                        score: 50,
                        summary: "Competition analysis unavailable",
                        directCompetitors: ["Unable to determine"],
                        indirectCompetitors: ["Unable to determine"],
                        competitiveAdvantage: "Analysis incomplete"
                    },
                    risks: [{
                        category: "Analysis Error",
                        description: "Could not complete full risk assessment",
                        severity: "Medium",
                        mitigation: "Please try submitting your idea again"
                    }],
                    opportunities: [{
                        category: "Analysis Error",
                        description: "Could not complete opportunity assessment",
                        impact: "Medium"
                    }]
                },
                recommendations: [{
                    category: "Next Steps",
                    action: "Please resubmit your idea for analysis",
                    priority: "High",
                    timeline: "Immediate"
                }],
                keyMetrics: {
                    fundingRequired: "Unable to determine",
                    timeToMarket: "Unable to determine",
                    breakEvenPoint: "Unable to determine",
                    scalabilityRating: "Unable to determine"
                },
                error: "Partial analysis failure - please try again"
            };
        }
    }

    async getQuickInsights(ideaTitle, ideaDescription) {
        const prompt = `
Provide a quick 3-sentence insight about this startup idea:
Title: ${ideaTitle}
Description: ${ideaDescription}

Focus on: uniqueness, market potential, and one key challenge.
`;

        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error('Quick insights generation failed:', error);
            return "Unable to generate insights at this time. Please try again.";
        }
    }

    sanitizePdfText(rawText) {
        if (!rawText) return '';
        return rawText
            .replace(/\u0000/g, '')
            .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ')
            .replace(/\r\n/g, '\n')
            .replace(/[ \t]+/g, ' ')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    truncatePdfText(text, maxChars) {
        if (!text) return { text: '', truncated: false };
        if (text.length <= maxChars) {
            return { text, truncated: false };
        }
        return { text: text.slice(0, maxChars), truncated: true };
    }

    isRetryableGeminiError(error) {
        const message = (error && error.message ? String(error.message) : '').toLowerCase();
        return (
            message.includes('resource_exhausted') ||
            message.includes('rate limit') ||
            message.includes('429') ||
            message.includes('503') ||
            message.includes('unavailable') ||
            message.includes('deadline') ||
            message.includes('timeout') ||
            message.includes('internal')
        );
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    extractFormFieldsHeuristically(rawText) {
        const text = rawText || '';
        const normalized = text.replace(/\s+/g, ' ').trim();

        const emailMatch = normalized.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        const urlMatch = normalized.match(/\bhttps?:\/\/[^\s)]+|\bwww\.[^\s)]+/i);

        const titleMatch = normalized.match(/\b(?:idea\s*title|startup\s*name|product\s*name|company\s*name|app\s*name|project\s*name)\s*[:-]\s*([^.;]{3,200})/i);
        const titleCandidate = titleMatch ? titleMatch[1].trim() : null;

        const descriptionMatch = normalized.match(/\b(?:description|overview|summary|about)\s*[:-]\s*([^]{20,2000})/i);
        const descriptionCandidate = descriptionMatch ? descriptionMatch[1].trim() : null;

        const founderMatch = normalized.match(/\b(?:founder|co-founder|cofounder|ceo|contact)\s*[:-]\s*([A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,3})/);

        const ideaTitle = this.guessIdeaTitle(normalized, titleCandidate);
        const ideaDescription = this.guessIdeaDescription(normalized, descriptionCandidate);

        const targetMarketMatch = normalized.match(/\b(?:target\s*market|target\s*customers|audience|ideal\s*customer|customer\s*segment)\s*[:-]\s*([^.;]{5,200})/i);

        return {
            ideaTitle: ideaTitle || null,
            ideaDescription: ideaDescription || null,
            targetMarket: targetMarketMatch ? targetMarketMatch[1].trim() : null,
            businessModel: this.detectBusinessModel(normalized),
            industry: this.detectIndustry(normalized),
            budget: this.detectBudget(normalized),
            timeline: this.detectTimeline(normalized),
            founderName: founderMatch ? founderMatch[1].trim() : null,
            contactEmail: emailMatch ? emailMatch[0] : null,
            website: urlMatch ? urlMatch[0].replace(/[).,]+$/, '') : null
        };
    }

    guessIdeaTitle(text, candidate) {
        if (candidate && candidate.length <= 200) {
            return candidate.replace(/\s+/g, ' ').trim();
        }

        const lineCandidate = text.split(/\n/).map(s => s.trim()).filter(Boolean)[0];
        if (lineCandidate && lineCandidate.length <= 200 && lineCandidate.split(/\s+/).length <= 12) {
            return lineCandidate;
        }

        const sentenceCandidate = text.split(/[.!?]\s+/)[0] || '';
        const cleanedSentence = sentenceCandidate.replace(/\s+/g, ' ').trim();
        if (cleanedSentence && cleanedSentence.length <= 200) {
            return cleanedSentence;
        }

        const words = text.split(/\s+/).filter(Boolean).slice(0, 12).join(' ');
        return words || null;
    }

    guessIdeaDescription(text, candidate) {
        const cleanCandidate = candidate ? candidate.replace(/\s+/g, ' ').trim() : '';
        if (cleanCandidate && cleanCandidate.length >= 20) {
            return cleanCandidate.slice(0, 5000);
        }

        if (!text) return null;
        const normalized = text.replace(/\s+/g, ' ').trim();
        if (!normalized) return null;
        return normalized.slice(0, 5000);
    }

    detectBusinessModel(text) {
        const lower = text.toLowerCase();
        if (/(subscription|saas|recurring)/.test(lower)) return 'subscription';
        if (/(marketplace|two-sided|platform)/.test(lower)) return 'marketplace';
        if (/(e-commerce|ecommerce|online store|shop|retail platform)/.test(lower)) return 'ecommerce';
        if (/freemium/.test(lower)) return 'freemium';
        if (/(advertising|ads-supported|ad-supported)/.test(lower)) return 'advertising';
        if (/(transaction|commission|take rate|payment per use)/.test(lower)) return 'transaction';
        if (/(licensing|license)/.test(lower)) return 'licensing';
        return null;
    }

    detectIndustry(text) {
        const lower = text.toLowerCase();
        if (/(healthcare|health care|medical|clinic|hospital|biotech)/.test(lower)) return 'healthcare';
        if (/(finance|fintech|banking|payments|insurance)/.test(lower)) return 'finance';
        if (/(education|edtech|learning|school|university)/.test(lower)) return 'education';
        if (/(retail|store|shopping|consumer goods)/.test(lower)) return 'retail';
        if (/(manufacturing|factory|supply chain|logistics)/.test(lower)) return 'manufacturing';
        if (/(services|consulting|agency|professional services)/.test(lower)) return 'services';
        if (/(entertainment|media|gaming|music|video)/.test(lower)) return 'entertainment';
        if (/(technology|software|ai|app|platform|cloud|data|iot)/.test(lower)) return 'technology';
        return null;
    }

    detectBudget(text) {
        const lower = text.toLowerCase();
        if (/(under|less than)\s*(\$|rs|inr)?\s*10k/.test(lower)) return 'under-10k';
        if (/(10k|10,000)\s*(to|-)\s*(50k|50,000)/.test(lower)) return '10k-50k';
        if (/(50k|50,000)\s*(to|-)\s*(100k|100,000)/.test(lower)) return '50k-100k';
        if (/(100k|100,000)\s*(to|-)\s*(500k|500,000)/.test(lower)) return '100k-500k';
        if (/(500k|500,000)\s*(to|-)\s*(1m|1,000,000)/.test(lower)) return '500k-1m';
        if (/(over|above|more than)\s*(\$|rs|inr)?\s*(1m|1,000,000)/.test(lower)) return 'over-1m';
        return null;
    }

    detectTimeline(text) {
        const lower = text.toLowerCase();
        if (/(within\s*)?3\s*months?/.test(lower)) return '3-months';
        if (/(3\s*-\s*6\s*months?|within\s*6\s*months?)/.test(lower)) return '6-months';
        if (/(6\s*-\s*12\s*months?|1\s*year|12\s*months?)/.test(lower)) return '1-year';
        if (/(over\s*1\s*year|18\s*months?|2\s*years?)/.test(lower)) return 'over-1-year';
        return null;
    }

    async extractFormFieldsFromPdfText(pdfText) {
        const sanitizedText = this.sanitizePdfText(pdfText);
        const { text: trimmedText, truncated } = this.truncatePdfText(sanitizedText, 12000);

        const prompt = `
You are an expert at extracting structured information from documents. 
I have extracted text from a PDF about a startup idea. 
Please analyze this text and extract the following fields in JSON format:

**Extracted PDF Text:**
${trimmedText}

Please respond ONLY with a valid JSON object (no markdown, no extra text) with these fields:
{
    "ideaTitle": "The main startup idea or product name (max 200 chars)",
    "ideaDescription": "A detailed description of the startup idea (max 5000 chars)",
    "targetMarket": "Who are the target customers/market?",
    "businessModel": "What is the business model? (choose from: subscription, marketplace, ecommerce, freemium, advertising, transaction, licensing, other)",
    "industry": "What industry? (choose from: technology, healthcare, finance, education, retail, manufacturing, services, entertainment, other)",
    "budget": "What is the budget range? (choose from: under-10k, 10k-50k, 50k-100k, 100k-500k, 500k-1m, over-1m)",
    "timeline": "Timeline to market? (choose from: 3-months, 6-months, 1-year, over-1-year)",
    "founderName": "(optional) Founder or contact name if present in the document",
    "contactEmail": "(optional) Any contact email found in the PDF",
    "website": "(optional) Website or URL mentioned in the document"
}

Be intelligent about inferring missing information from context. If a field cannot be determined, use null.
`;

        try {
            console.log('Extracting form fields from PDF text using Gemini...');
            console.log(`PDF text length: ${sanitizedText.length} characters${truncated ? ' (truncated for prompt)' : ''}`);

            if (!this.model) {
                throw new Error('Gemini model not initialized. Check GEMINI_API_KEY environment variable.');
            }

            let result = null;
            const maxAttempts = 3;
            let lastError = null;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    result = await this.model.generateContent(prompt);
                    break;
                } catch (err) {
                    lastError = err;
                    const retryable = this.isRetryableGeminiError(err);
                    if (!retryable || attempt === maxAttempts) {
                        break;
                    }
                    const delayMs = 500 * attempt;
                    console.warn(`Gemini request failed (attempt ${attempt}/${maxAttempts}). Retrying in ${delayMs}ms...`);
                    await this.delay(delayMs);
                }
            }

            if (!result) {
                throw lastError || new Error('No response received from Gemini API');
            }

            const response = await result.response;

            if (!response) {
                throw new Error('Invalid response object from Gemini API');
            }

            const jsonText = response.text().trim();

            console.log(`Gemini response received (${jsonText.length} chars)`);

            // Parse JSON response
            let parsed = null;
            try {
                // Extract JSON from response (in case there's markdown wrapping)
                const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                } else {
                    parsed = JSON.parse(jsonText);
                }
            } catch (parseErr) {
                console.error('Failed to parse Gemini JSON response:', parseErr.message);
                console.log('Raw response:', jsonText.substring(0, 500));

                const fallback = this.extractFormFieldsHeuristically(sanitizedText);
                return {
                    success: true,
                    data: fallback,
                    warning: 'AI response could not be parsed. Used heuristic extraction instead.',
                    rawResponse: jsonText.substring(0, 1000),
                    timestamp: new Date().toISOString()
                };
            }

            console.log('Form fields extracted successfully');
            return {
                success: true,
                data: parsed,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            const errorMessage = error && error.message ? String(error.message) : '';
            console.error('Form field extraction failed:', errorMessage || error);
            console.error('Error type:', error && error.constructor ? error.constructor.name : 'Unknown');
            console.error('Full error:', error);

            // Provide more specific error messages
            let userMessage = 'Failed to extract form fields from PDF';

            if (errorMessage.includes('API key')) {
                userMessage = 'API key not configured. Please contact support.';
            } else if (errorMessage.includes('INVALID_ARGUMENT')) {
                userMessage = 'Invalid request to AI service. The PDF might be too large or contain unsupported content.';
            } else if (errorMessage.includes('RESOURCE_EXHAUSTED')) {
                userMessage = 'AI service is currently busy. Please try again in a moment.';
            } else if (errorMessage.includes('PERMISSION_DENIED')) {
                userMessage = 'Not authorized to use AI service. Please check API key.';
            }

            const fallback = this.extractFormFieldsHeuristically(sanitizedText);
            return {
                success: true,
                data: fallback,
                warning: userMessage,
                timestamp: new Date().toISOString()
            };
        }
    }
    async generateCompetitorReport(competitor, userStartup) {
        const competitorName = competitor.name || 'Unknown';
        const competitorWebsite = competitor.website || 'Not specified';
        const competitorNotes = competitor.notes || 'None provided';

        const userIdeaTitle = userStartup?.ideaTitle || 'Unknown';
        const userIdeaDesc = userStartup?.ideaDescription || 'Not specified';
        const userIndustry = userStartup?.industry || 'Not specified';

        const prompt = `You are a competitive intelligence analyst. Compare the following startup with its competitor and provide a strategic analysis in JSON format.

User's Startup:
- Name: ${userIdeaTitle}
- Description: ${userIdeaDesc}
- Industry: ${userIndustry}

Competitor:
- Name: ${competitorName}
- Website: ${competitorWebsite}
- Notes: ${competitorNotes}

Provide a JSON object with:
{
  "competitorOverview": "Brief description of the competitor",
  "strengths": ["array of competitor strengths"],
  "weaknesses": ["array of competitor weaknesses"],
  "marketPosition": "How the competitor is positioned in the market",
  "threatLevel": "High/Medium/Low",
  "userAdvantages": ["array of user's advantages over this competitor"],
  "recommendedStrategies": ["array of actionable strategies to compete"],
  "keyDifferentiators": ["array of ways the user can differentiate"],
  "riskFactors": ["array of risks to consider"]
}`;

        try {
            console.log(`Generating competitor report for ${competitorName} via Gemini...`);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        } catch (error) {
            console.error('Competitor report generation failed:', error);
            throw new Error(`Failed to generate competitor report: ${error.message}`);
        }
    }

    async generateIndustryBenchmark(industry, overallScore, ideaTitle) {
        const score = overallScore || 'N/A';
        const title = ideaTitle || 'Unknown';

        const prompt = `You are an industry benchmarking expert. Analyze how a startup compares to industry standards and provide benchmark data in JSON format.

Startup:
- Name: ${title}
- Industry: ${industry}
- Overall Score: ${score}

Provide a JSON object with:
{
  "industry": "${industry}",
  "averageScore": "Average score for this industry",
  "userScore": ${score},
  "percentileRanking": "Estimated percentile ranking",
  "industryInsights": ["Key insights about the industry"],
  "strengthAreas": ["Areas where the startup scores above average"],
  "improvementAreas": ["Areas needing improvement vs industry standards"],
  "industryTrends": ["Current trends in this industry"],
  "recommendations": ["Actionable recommendations to improve standing"]
}`;

        try {
            console.log(`Generating industry benchmark for ${industry} via Gemini...`);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        } catch (error) {
            console.error('Industry benchmark generation failed:', error);
            throw new Error(`Failed to generate industry benchmark: ${error.message}`);
        }
    }

    async generateVentureFollowUp(ideaData, stage = 'mvp', progressNotes = '') {
        const title = ideaData?.ideaTitle || 'Startup';
        const desc = ideaData?.ideaDescription || 'Not specified';
        const industry = ideaData?.industry || 'Technology';

        const prompt = `You are a Y Combinator startup partner and growth advisor. A founder who previously validated their startup idea on our platform is returning after working on it. Provide stage-specific follow-up strategic advice, launch tactics, and an investor update draft in JSON format.

Startup Details:
- Title: ${title}
- Description: ${desc}
- Industry: ${industry}
- Current Venture Stage: ${stage.toUpperCase()} (options: MVP, PRELAUNCH, LAUNCH, GROWTH)
- Founder Progress Notes: ${progressNotes || 'Building & preparing for launch'}

Respond ONLY with a JSON object containing:
{
  "stage": "${stage}",
  "stageTitle": "A catchy executive title for this stage milestone",
  "milestoneSummary": "Summary of current position and launch readiness assessment",
  "priorities": ["top 3 priority focus areas for this milestone"],
  "betaAcquisitionTactics": ["3 actionable customer acquisition tactics tailored to this stage"],
  "launchChecklist": [
    { "task": "Specific task name", "category": "Product/Marketing/Operations", "timeframe": "Next 7-14 Days" },
    { "task": "Specific task name", "category": "Product/Marketing/Operations", "timeframe": "Next 14-30 Days" }
  ],
  "investorUpdateDraft": "Ready-to-send investor email draft with Subject, Key Highlights, Metrics, and Ask"
}`;

        try {
            console.log(`Generating venture follow-up for ${title} at stage ${stage} via Gemini...`);
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text().trim();
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleaned);
        } catch (error) {
            console.error('Venture follow-up generation failed:', error);
            throw new Error(`Failed to generate venture follow-up: ${error.message}`);
        }
    }
}

module.exports = new GeminiService();
