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
                    console.log(`\n📝 Saving request to user record (ID: ${req.user.id})`);
                    
                    const summary = {
                        id: analysisId,
                        input: {
                            ideaTitle: ideaData.ideaTitle,
                            ideaDescription: ideaData.ideaDescription,
                            targetMarket: ideaData.targetMarket || null,
                        },
                        analysis: analysisResult, // Save full analysis for persistence
                        createdAt: analysisResult.createdAt
                    };

                    // Push into user's requests array (create user record missing handling)
                    try {
                        const user = await User.findById(req.user.id);
                        if (user) {
                            console.log(`   ✅ User found. Adding request summary with full analysis...`);
                            await user.addRequest(summary);
                            console.log(`   ✅ Request saved. Total requests: ${user.requests.length}`);
                            console.log(`   📊 Saved analysis includes: overallScore, uniqueness, marketViability, competition, keyMetrics, recommendations, risks, opportunities`);
                        } else {
                            console.warn(`❌ Authenticated user not found in DB: ${req.user.id}`);
                        }
                    } catch (dbErr) {
                        console.warn('❌ Failed to save request to user in DB:', dbErr.message || dbErr);
                        console.error('Stack:', dbErr.stack);
                    }
                } else {
                    console.log('⚠️  Analysis not attached to user (not authenticated or no user ID)');
                }
            } catch (attachErr) {
                console.warn('❌ Failed to attach analysis to user record:', attachErr.message || attachErr);
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

            console.log(`\n${'='.repeat(60)}`);
            console.log(`📊 RETRIEVING ANALYSIS`);
            console.log(`Analysis ID: ${id}`);
            console.log(`${'='.repeat(60)}`);

            // First check in-memory storage
            let analysis = analysisStorage.get(id);
            
            if (analysis) {
                console.log(`✅ Analysis found in memory`);
                console.log(`${'='.repeat(60)}\n`);
                return res.status(200).json({
                    success: true,
                    data: analysis,
                    source: 'memory'
                });
            }

            // If not in memory, try to find in database from user's requests
            console.log(`⚠️  Analysis not in memory. Checking database...`);
            
            if (req.user && req.user.id) {
                const user = await User.findById(req.user.id).lean();
                if (user && user.requests) {
                    const request = user.requests.find(r => r.id === id);
                    if (request && request.analysis) {
                        console.log(`✅ Analysis found in user's database record`);
                        console.log(`${'='.repeat(60)}\n`);
                        return res.status(200).json({
                            success: true,
                            data: request.analysis,
                            source: 'database',
                            note: 'This is a stored copy of the analysis'
                        });
                    }
                }
            }

            console.error(`❌ Analysis not found anywhere`);
            console.log(`📌 Analysis ID: ${id}`);
            console.log(`📌 User ID: ${req.user?.id || 'Not authenticated'}`);
            console.log(`${'='.repeat(60)}\n`);
            
            return res.status(404).json({
                error: 'Analysis not found',
                message: `No analysis found with ID: ${id}. The analysis may have expired or not been saved.`,
                availableIds: Array.from(analysisStorage.keys()).slice(-5),
                hint: 'Try regenerating the analysis from the Analysis page'
            });

        } catch (error) {
            console.error('❌ Error retrieving analysis:', error);
            console.error(`${'='.repeat(60)}\n`);
            
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
