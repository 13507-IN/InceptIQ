const aiService = require('../services/aiService');
const { v4: uuidv4 } = require('uuid');
const { analysisStorage } = require('../utils/storage');
const User = require('../models/user');

const analysisController = {
    async analyzeIdea(req, res) {
        try {
            const ideaData = req.body;
            const analysisId = uuidv4();

            console.log(`🔄 Starting analysis for idea: "${ideaData.ideaTitle}" (ID: ${analysisId})`);

            // Get AI analysis
            const aiResult = await aiService.analyzeStartupIdea(ideaData);

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

            const insights = await aiService.getQuickInsights(ideaTitle, ideaDescription);

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

            if (pdfText.length < 50) {
                return res.status(400).json({
                    success: false,
                    error: 'PDF text too short',
                    message: 'The extracted PDF text is too short. Please upload a document with more content.'
                });
            }

            console.log('📄 Extracting form fields from PDF text...');
            console.log(`📊 PDF text size: ${pdfText.length} bytes`);
            
            const result = await aiService.extractFormFieldsFromPdfText(pdfText);

            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Extraction failed',
                    message: result.message || 'Failed to extract form fields',
                    rawResponse: result.rawResponse?.substring(0, 500)
                });
            }

            console.log('✅ PDF fields extracted and returned to client');
            res.status(200).json(result);

        } catch (error) {
            console.error('❌ PDF extraction error:', error.message);
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack
            });

            res.status(500).json({
                success: false,
                error: 'Server error',
                message: error.message || 'Failed to extract form fields from PDF',
                timestamp: new Date().toISOString()
            });
        }
    },

    // ─── Streaming endpoint ─────────────────────────────────────────────────
    // POST /api/analyze/stream
    // Uses SSE (Server-Sent Events) to push Gemini token chunks to the browser.
    // The client reads via fetch + ReadableStream.
    async analyzeIdeaStream(req, res) {
        const ideaData = req.body;
        const analysisId = uuidv4();

        console.log(`🔄 [STREAM] Starting streaming analysis for: "${ideaData.ideaTitle}" (${analysisId})`);

        // ── SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        // Helper: write one SSE event
        const send = (event, data) => {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        send('thinking', { message: 'AI is analyzing your idea...', analysisId });

        let charCount = 0;

        try {
            const aiResult = await aiService.analyzeStartupIdeaStream(ideaData, (chunkText) => {
                charCount += chunkText.length;
                send('chunk', { text: chunkText, chars: charCount });
            });

            const analysisResult = {
                id: analysisId,
                input: ideaData,
                ...aiResult,
                createdAt: new Date().toISOString()
            };

            analysisStorage.set(analysisId, analysisResult);

            if (req.user && req.user.id) {
                try {
                    const user = await User.findById(req.user.id);
                    if (user) {
                        const summary = {
                            id: analysisId,
                            input: {
                                ideaTitle: ideaData.ideaTitle,
                                ideaDescription: ideaData.ideaDescription,
                                targetMarket: ideaData.targetMarket || null,
                            },
                            analysis: analysisResult,
                            createdAt: analysisResult.createdAt
                        };
                        await user.addRequest(summary);
                        console.log(`   ✅ [STREAM] Saved analysis to user record`);
                    }
                } catch (dbErr) {
                    console.warn('[STREAM] Failed to save to user DB:', dbErr.message);
                }
            }

            send('done', {
                analysisId,
                overallScore: aiResult.analysis?.overallScore ?? null,
                message: 'Analysis complete!'
            });

            console.log(`✅ [STREAM] Analysis ${analysisId} complete (${charCount} chars)`);
            res.end();

        } catch (error) {
            console.error('❌ [STREAM] Failed:', error.message);
            send('error', { message: error.message || 'Analysis failed. Please try again.' });
            res.end();
        }
    },

    // DELETE /api/analyze/:id
    // Delete an analysis from user's profile
    async deleteAnalysis(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    error: 'Missing analysis ID',
                    message: 'Analysis ID is required'
                });
            }

            // Require authentication
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    error: 'Not authenticated',
                    message: 'Please log in to delete an analysis'
                });
            }

            console.log(`\n${'='.repeat(60)}`);
            console.log(`🗑️  DELETING ANALYSIS`);
            console.log(`Analysis ID: ${id}`);
            console.log(`User ID: ${req.user.id}`);
            console.log(`${'='.repeat(60)}`);

            // Find user and delete the request
            const user = await User.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    message: 'User record not found'
                });
            }

            // Check if analysis exists
            const analysisExists = user.requests.some(r => r.id === id);
            if (!analysisExists) {
                return res.status(404).json({
                    error: 'Analysis not found',
                    message: `No analysis found with ID: ${id}`
                });
            }

            // Delete the analysis
            await user.deleteRequest(id);

            // Also remove from in-memory storage if it exists
            analysisStorage.delete(id);

            console.log(`✅ Analysis ${id} deleted successfully`);
            console.log(`${'='.repeat(60)}\n`);

            res.status(200).json({
                success: true,
                message: 'Analysis deleted successfully',
                analysisId: id
            });

        } catch (error) {
            console.error('❌ Error deleting analysis:', error);
            console.error(`${'='.repeat(60)}\n`);

            res.status(500).json({
                error: 'Failed to delete analysis',
                message: error.message
            });
        }
    }
};

module.exports = analysisController;

