const pdfService = require('../services/pdfService');
const fs = require('fs');
const path = require('path');
const User = require('../models/user');

// Import analysis storage - will be shared between controllers
// In production, this should be replaced with a proper database
const analysisStorage = require('../utils/storage').analysisStorage;

const getAnalysisRecord = async (id, req) => {
    let analysis = analysisStorage.get(id);
    if (analysis) return { analysis, source: 'memory' };

    if (req?.user?.id) {
        const user = await User.findById(req.user.id).lean();
        if (user?.requests) {
            const request = user.requests.find(r => r.id === id);
            if (request?.analysis) {
                return { analysis: request.analysis, source: 'database' };
            }
        }
    }

    return { analysis: null, source: 'none' };
};

const reportsController = {
    async downloadReport(req, res) {
        const startTime = Date.now();
        const requestId = Math.random().toString(36).substring(7);
        
        try {
            const { id } = req.params;

            console.log(`\n${'='.repeat(60)}`);
            console.log(`📥 PDF Download Request [${requestId}] - Analysis ID: ${id}`);
            console.log(`${'='.repeat(60)}`);

            if (!id) {
                console.warn(`❌ [${requestId}] Missing analysis ID in request`);
                return res.status(400).json({
                    error: 'Missing analysis ID',
                    message: 'Analysis ID is required to generate report',
                    requestId
                });
            }

            console.log(`🔍 [${requestId}] Checking if analysis exists in storage/database...`);

            // Check if analysis exists in storage or database (if authenticated)
            const { analysis, source } = await getAnalysisRecord(id, req);
            
            // If analysis is missing but a PDF file already exists on disk, allow download
            if (!analysis) {
                console.log(`⚠️  [${requestId}] Analysis not in memory. Checking disk for existing PDF...`);
                
                if (pdfService.reportExists(id)) {
                    console.log(`✅ [${requestId}] Existing PDF found on disk. Serving existing file...`);

                    const filePath = pdfService.getReportPath(id);
                    const fileName = `startup-analysis-${id}.pdf`;

                    try {
                        const fileStats = fs.statSync(filePath);
                        console.log(`📊 [${requestId}] PDF File Info - Size: ${fileStats.size} bytes, Modified: ${fileStats.mtime}`);
                    } catch (statsErr) {
                        console.warn(`⚠️  [${requestId}] Could not get file stats:`, statsErr.message);
                    }

                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                    res.setHeader('Cache-Control', 'no-cache');

                    // Ensure the file has an EOF marker to avoid corrupt PDF errors in readers
                    try {
                        const content = fs.readFileSync(filePath, { encoding: 'latin1' });
                        if (!content.includes('%%EOF')) {
                            console.log(`🔧 [${requestId}] Adding missing EOF marker to PDF...`);
                            fs.appendFileSync(filePath, '\n%%EOF\n', { encoding: 'latin1' });
                        }
                    } catch (err) {
                        console.warn(`⚠️  [${requestId}] Could not verify/repair existing PDF EOF marker:`, err.message);
                    }

                    const fileStream = fs.createReadStream(filePath);
                    
                    fileStream.on('error', (error) => {
                        console.error(`❌ [${requestId}] Error streaming existing PDF file:`, error.message);
                        console.error(`   Stack: ${error.stack}`);
                        if (!res.headersSent) {
                            res.status(500).json({
                                error: 'Failed to stream PDF file',
                                message: error.message,
                                requestId
                            });
                        }
                    });

                    fileStream.on('end', () => {
                        const duration = Date.now() - startTime;
                        console.log(`✅ [${requestId}] PDF stream completed successfully (${duration}ms)`);
                        console.log(`${'='.repeat(60)}\n`);
                    });

                    return fileStream.pipe(res);
                }

                console.error(`❌ [${requestId}] Analysis not found in storage/database and no PDF exists on disk`);
                console.log(`${'='.repeat(60)}\n`);
                
                return res.status(404).json({
                    error: 'Analysis not found',
                    message: `No analysis found with ID: ${id}. No existing PDF found either.`,
                    requestId
                });
            }

            console.log(`✅ [${requestId}] Analysis found in ${source}. Starting PDF process...`);
            console.log(`   Input: ${analysis.input?.ideaTitle || 'N/A'}`);
            console.log(`   Created: ${analysis.createdAt}`);

            try {
                // Check if PDF already exists
                if (!pdfService.reportExists(id)) {
                    console.log(`📝 [${requestId}] PDF does not exist. Generating new PDF report...`);
                    const genStartTime = Date.now();
                    
                    await pdfService.generateAnalysisReport(analysis, id);
                    
                    const genDuration = Date.now() - genStartTime;
                    console.log(`✅ [${requestId}] PDF report generated successfully (${genDuration}ms)`);
                } else {
                    console.log(`📋 [${requestId}] PDF already exists. Using existing PDF...`);
                }

                const filePath = pdfService.getReportPath(id);
                const fileName = `startup-analysis-${id}.pdf`;

                // Check if file exists
                if (!fs.existsSync(filePath)) {
                    throw new Error(`Generated PDF file not found at path: ${filePath}`);
                }

                const fileStats = fs.statSync(filePath);
                console.log(`📊 [${requestId}] Final PDF Info - Size: ${fileStats.size} bytes`);

                // Set headers for file download
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Content-Length', fileStats.size);

                // Stream the file
                const fileStream = fs.createReadStream(filePath);
                
                fileStream.on('error', (error) => {
                    console.error(`❌ [${requestId}] Error streaming PDF file:`, error.message);
                    console.error(`   Stack: ${error.stack}`);
                    if (!res.headersSent) {
                        res.status(500).json({
                            error: 'Failed to stream PDF file',
                            message: error.message,
                            requestId
                        });
                    }
                });

                fileStream.on('end', () => {
                    const duration = Date.now() - startTime;
                    console.log(`✅ [${requestId}] PDF stream completed successfully (${duration}ms)`);
                    console.log(`${'='.repeat(60)}\n`);
                });

                fileStream.pipe(res);

            } catch (pdfError) {
                console.error(`❌ [${requestId}] PDF generation/retrieval failed:`, pdfError.message);
                console.error(`   Stack: ${pdfError.stack}`);
                console.error(`   Full Error:`, pdfError);
                
                // Check if it's a validation error from PDF service
                const isValidationError = pdfError.message.includes('Validation Failed');
                
                console.log(`${'='.repeat(60)}\n`);
                
                res.status(500).json({
                    error: 'PDF generation failed',
                    message: pdfError.message,
                    details: isValidationError 
                        ? 'Analysis data is incomplete or malformed. Check the analysis data structure.'
                        : 'Unable to generate or retrieve the analysis report. Check server logs for details.',
                    requestId,
                    timestamp: new Date().toISOString()
                });
            }

        } catch (error) {
            console.error(`❌ [${requestId}] Report download request failed:`, error.message);
            console.error(`   Stack: ${error.stack}`);
            console.log(`${'='.repeat(60)}\n`);
            
            res.status(500).json({
                error: 'Report download failed',
                message: error.message,
                requestId,
                timestamp: new Date().toISOString()
            });
        }
    },

    async generateReport(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    error: 'Missing analysis ID',
                    message: 'Analysis ID is required to generate report'
                });
            }

            const { analysis } = await getAnalysisRecord(id, req);
            if (!analysis) {
                return res.status(404).json({
                    error: 'Analysis not found',
                    message: `No analysis found with ID: ${id}`
                });
            }

            console.log(`🔄 Force generating PDF report for analysis ID: ${id}`);

            const result = await pdfService.generateAnalysisReport(analysis, id);

            res.status(200).json({
                success: true,
                message: 'PDF report generated successfully',
                report: {
                    id,
                    fileName: result.fileName,
                    fileSize: result.fileSize,
                    downloadUrl: `/api/reports/${id}`
                },
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Report generation failed:', error);
            res.status(500).json({
                error: 'Report generation failed',
                message: error.message
            });
        }
    },

    async getReportInfo(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    error: 'Missing analysis ID'
                });
            }

            const { analysis } = await getAnalysisRecord(id, req);
            if (!analysis) {
                return res.status(404).json({
                    error: 'Analysis not found'
                });
            }

            const reportExists = pdfService.reportExists(id);
            let fileInfo = null;

            if (reportExists) {
                const filePath = pdfService.getReportPath(id);
                const stats = fs.statSync(filePath);
                fileInfo = {
                    exists: true,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            }

            res.status(200).json({
                success: true,
                analysis: {
                    id,
                    title: analysis.input.ideaTitle,
                    createdAt: analysis.createdAt,
                    overallScore: analysis.analysis?.overallScore
                },
                report: fileInfo || { exists: false },
                downloadUrl: reportExists ? `/api/reports/${id}` : null
            });

        } catch (error) {
            console.error('Error getting report info:', error);
            res.status(500).json({
                error: 'Failed to get report information',
                message: error.message
            });
        }
    },

    async deleteReport(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    error: 'Missing analysis ID'
                });
            }

            const deleted = pdfService.deleteReport(id);

            if (deleted) {
                res.status(200).json({
                    success: true,
                    message: `Report deleted successfully for analysis ID: ${id}`
                });
            } else {
                res.status(404).json({
                    error: 'Report not found',
                    message: `No report file found for analysis ID: ${id}`
                });
            }

        } catch (error) {
            console.error('Error deleting report:', error);
            res.status(500).json({
                error: 'Failed to delete report',
                message: error.message
            });
        }
    }
};

module.exports = reportsController;
