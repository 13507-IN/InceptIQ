const pdfService = require('../services/pdfService');
const fs = require('fs');
const path = require('path');

// Import analysis storage - will be shared between controllers
// In production, this should be replaced with a proper database
const analysisStorage = require('../utils/storage').analysisStorage;

const reportsController = {
    async downloadReport(req, res) {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    error: 'Missing analysis ID',
                    message: 'Analysis ID is required to generate report'
                });
            }

            // Check if analysis exists in storage
            const analysis = analysisStorage.get(id);
            // If analysis is missing but a PDF file already exists on disk, allow download
            if (!analysis) {
                if (pdfService.reportExists(id)) {
                    console.warn(`Analysis record missing for ID ${id} but PDF exists - serving existing file`);

                    const filePath = pdfService.getReportPath(id);
                    const fileName = `startup-analysis-${id}.pdf`;

                    res.setHeader('Content-Type', 'application/pdf');
                    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                    res.setHeader('Cache-Control', 'no-cache');

                    // Ensure the file has an EOF marker to avoid corrupt PDF errors in readers
                    try {
                        const content = fs.readFileSync(filePath, { encoding: 'latin1' });
                        if (!content.includes('%%EOF')) {
                            fs.appendFileSync(filePath, '\n%%EOF\n', { encoding: 'latin1' });
                        }
                    } catch (err) {
                        console.warn('Could not verify/repair existing PDF EOF marker:', err.message);
                    }

                    const fileStream = fs.createReadStream(filePath);
                    fileStream.on('error', (error) => {
                        console.error('Error streaming existing PDF file:', error);
                        if (!res.headersSent) {
                            res.status(500).json({
                                error: 'Failed to stream PDF file',
                                message: error.message
                            });
                        }
                    });

                    return fileStream.pipe(res);
                }

                return res.status(404).json({
                    error: 'Analysis not found',
                    message: `No analysis found with ID: ${id}`
                });
            }

            console.log(`📄 Generating PDF report for analysis ID: ${id}`);

            try {
                // Check if PDF already exists
                if (!pdfService.reportExists(id)) {
                    console.log('📝 Generating new PDF report...');
                    await pdfService.generateAnalysisReport(analysis, id);
                    console.log('✅ PDF report generated successfully');
                } else {
                    console.log('📋 Using existing PDF report');
                }

                const filePath = pdfService.getReportPath(id);
                const fileName = `startup-analysis-${id}.pdf`;

                // Check if file exists
                if (!fs.existsSync(filePath)) {
                    throw new Error('Generated PDF file not found');
                }

                // Set headers for file download
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.setHeader('Cache-Control', 'no-cache');

                // Stream the file
                const fileStream = fs.createReadStream(filePath);
                
                fileStream.on('error', (error) => {
                    console.error('Error streaming PDF file:', error);
                    if (!res.headersSent) {
                        res.status(500).json({
                            error: 'Failed to stream PDF file',
                            message: error.message
                        });
                    }
                });

                fileStream.pipe(res);

                console.log(`📤 PDF report sent successfully for ID: ${id}`);

            } catch (pdfError) {
                console.error('PDF generation/retrieval failed:', pdfError);
                res.status(500).json({
                    error: 'PDF generation failed',
                    message: pdfError.message,
                    details: 'Unable to generate or retrieve the analysis report'
                });
            }

        } catch (error) {
            console.error('Report download failed:', error);
            res.status(500).json({
                error: 'Report download failed',
                message: error.message
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

            const analysis = analysisStorage.get(id);
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

            const analysis = analysisStorage.get(id);
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
