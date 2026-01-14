const geminiService = require('../services/geminiService');
const { v4: uuidv4 } = require('uuid');
const { analysisStorage } = require('../utils/storage');
const User = require('../models/user');

const analysisController = {
    async analyzeIdea(req, res) {
        try {
            const ideaData = req.body;
            const analysisId = uuidv4();

            console.log(`🔄 Starting analysis for idea: "${ideaData.ideaTitle}" (ID: ${analysisId})`);

            // Get AI analysis from Gemini
            const aiResult = await geminiService.analyzeStartupIdea(ideaData);

            // Store the complete analysis result
            const analysisResult = {
                id: analysisId,
                input: ideaData,
                ...aiResult,
                createdAt: new Date().toISOString()
            };

            analysisStorage.set(analysisId, analysisResult);

            // If a user is authenticated, attach a brief request summary to their MongoDB record
            try {
                if (req.user && req.user.id) {
                    const summary = {
                        id: analysisId,
                        input: {
                            ideaTitle: ideaData.ideaTitle,
                            ideaDescription: ideaData.ideaDescription,
                            targetMarket: ideaData.targetMarket || null,
                        },
                        createdAt: analysisResult.createdAt
                    };

                    // Push into user's requests array (create user record missing handling)
                    try {
                        const user = await User.findById(req.user.id);
                        if (user) {
                            await user.addRequest(summary);
                        } else {
                            console.warn('Authenticated user not found in DB:', req.user.id);
                        }
                    } catch (dbErr) {
                        console.warn('Failed to save request to user in DB:', dbErr.message || dbErr);
                    }
                }
            } catch (attachErr) {
                console.warn('Failed to attach analysis to user record:', attachErr.message || attachErr);
            }

            console.log(`✅ Analysis completed for ID: ${analysisId}`);

            // Return the result with the ID for future reference
            res.status(200).json({
                analysisId,
                success: true,
                data: aiResult.analysis,
                timestamp: aiResult.timestamp
            });

        } catch (error) {
            console.error('❌ Analysis failed:', error.message);
            
            res.status(500).json({
                success: false,
                error: 'Analysis failed',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    },

    async getAnalysis(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    error: 'Missing analysis ID',
                    message: 'Analysis ID is required'
                });
            }

            const analysis = analysisStorage.get(id);

            if (!analysis) {
                return res.status(404).json({
                    error: 'Analysis not found',
                    message: `No analysis found with ID: ${id}`,
                    availableIds: Array.from(analysisStorage.keys()).slice(-5) // Return last 5 IDs for debugging
                });
            }

            res.status(200).json({
                success: true,
                data: analysis
            });

        } catch (error) {
            console.error('Error retrieving analysis:', error);
            
            res.status(500).json({
                error: 'Failed to retrieve analysis',
                message: error.message
            });
        }
    },

    // Utility method to get quick insights (lighter version)
    async getQuickInsights(req, res) {
        try {
            const { ideaTitle, ideaDescription } = req.body;

            if (!ideaTitle || !ideaDescription) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    message: 'Both ideaTitle and ideaDescription are required'
                });
            }

            const insights = await geminiService.getQuickInsights(ideaTitle, ideaDescription);

            res.status(200).json({
                success: true,
                insights,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Quick insights failed:', error);
            
            res.status(500).json({
                success: false,
                error: 'Failed to generate quick insights',
                message: error.message
            });
        }
    },

    // Get analysis statistics (for admin/debugging)
    getAnalyticsStats(req, res) {
        const stats = {
            totalAnalyses: analysisStorage.size,
            recentAnalyses: Array.from(analysisStorage.values())
                .slice(-10)
                .map(analysis => ({
                    id: analysis.id,
                    title: analysis.input.ideaTitle,
                    createdAt: analysis.createdAt,
                    overallScore: analysis.analysis?.overallScore || 'N/A'
                })),
            timestamp: new Date().toISOString()
        };

        res.status(200).json(stats);
    },

    // Extract form fields from PDF text using Gemini AI
    async extractFormFieldsFromPdf(req, res) {
        try {
            const { pdfText } = req.body;

            if (!pdfText || !pdfText.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing PDF text',
                    message: 'Please provide extracted PDF text'
                });
            }

            console.log('📄 Extracting form fields from PDF text...');
            const result = await geminiService.extractFormFieldsFromPdfText(pdfText);

            res.status(200).json(result);

        } catch (error) {
            console.error('❌ Form field extraction failed:', error.message);
            
            res.status(500).json({
                success: false,
                error: 'Failed to extract form fields',
                message: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }
};

module.exports = analysisController;
