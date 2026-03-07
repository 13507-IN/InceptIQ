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
  "overallScore": [0-100 average of all scores],
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
      "marketSize": "Estimated market size and growth potential",
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

    async extractFormFieldsFromPdfText(pdfText) {
        const prompt = `
You are an expert at extracting structured information from documents. 
I have extracted text from a PDF about a startup idea. 
Please analyze this text and extract the following fields in JSON format:

**Extracted PDF Text:**
${pdfText}

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
            console.log('🔍 Extracting form fields from PDF text using Gemini...');
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const jsonText = response.text().trim();

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
                console.error('Failed to parse Gemini JSON response:', parseErr);
                console.log('Raw response:', jsonText);
                return {
                    success: false,
                    message: 'Failed to parse AI response',
                    rawResponse: jsonText
                };
            }

            console.log('✅ Form fields extracted successfully');
            return {
                success: true,
                data: parsed,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Form field extraction failed:', error);
            throw new Error(`Failed to extract form fields: ${error.message}`);
        }
    }
}

module.exports = new GeminiService();
