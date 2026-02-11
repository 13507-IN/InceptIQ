const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

class PDFService {
    constructor() {
        // Ensure reports directory exists
        this.reportsDir = path.join(__dirname, '../reports');
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    async fetchImageBuffer(url) {
        if (!url) return null;
        try {
            const response = await fetch(url);
            if (!response.ok) return null;
            return await response.buffer();
        } catch (error) {
            console.warn('PDF image fetch failed:', error.message || error);
            return null;
        }
    }

    normalizeAnalysisData(analysisData) {
        const root = analysisData?.analysis ?? analysisData ?? {};
        const details = (root && typeof root === 'object' && root.analysis && typeof root.analysis === 'object')
            ? root.analysis
            : root;

        const asArray = (value) => {
            if (Array.isArray(value)) return value;
            if (value === undefined || value === null) return [];
            return [value];
        };

        const asObject = (value) => {
            if (value && typeof value === 'object' && !Array.isArray(value)) return value;
            return {};
        };

        const asText = (value, fallback) => {
            if (value === undefined || value === null || value === '') return fallback;
            return String(value);
        };

        const toNumber = (value) => {
            if (value === undefined || value === null || value === '') return null;
            const num = Number(value);
            return Number.isFinite(num) ? num : null;
        };

        const uniqueness = details.uniqueness ?? root.uniqueness ?? {};
        const marketViability = details.marketViability ?? root.marketViability ?? {};
        const competition = details.competition ?? root.competition ?? {};

        const uniquenessScore = toNumber(root.uniquenessScore ?? details.uniquenessScore ?? uniqueness.score);
        const marketViabilityScore = toNumber(root.marketViabilityScore ?? details.marketViabilityScore ?? marketViability.score);
        const competitionScore = toNumber(root.competitionScore ?? details.competitionScore ?? competition.score);

        const rawOverall = toNumber(root.overallScore ?? details.overallScore);
        const scoreValues = [uniquenessScore, marketViabilityScore, competitionScore].filter(v => typeof v === 'number');
        const overallScore = rawOverall ?? (scoreValues.length > 0
            ? Math.round(scoreValues.reduce((sum, v) => sum + v, 0) / scoreValues.length)
            : null);

        return {
            overallScore,
            uniquenessScore,
            marketViabilityScore,
            competitionScore,
            uniqueness: {
                score: uniquenessScore,
                summary: asText(uniqueness.summary, 'No summary available'),
                strengths: asArray(uniqueness.strengths),
                concerns: asArray(uniqueness.concerns)
            },
            marketViability: {
                score: marketViabilityScore,
                summary: asText(marketViability.summary, 'No summary available'),
                marketSize: asText(marketViability.marketSize, 'Not specified'),
                targetAudience: asText(marketViability.targetAudience, 'Not specified'),
                trends: asArray(marketViability.trends)
            },
            competition: {
                score: competitionScore,
                summary: asText(competition.summary, 'No summary available'),
                directCompetitors: asArray(competition.directCompetitors),
                indirectCompetitors: asArray(competition.indirectCompetitors),
                competitiveAdvantage: asText(competition.competitiveAdvantage, 'Not specified')
            },
            keyMetrics: asObject(root.keyMetrics ?? details.keyMetrics),
            recommendations: asArray(root.recommendations ?? details.recommendations),
            risks: asArray(root.risks ?? details.risks),
            opportunities: asArray(root.opportunities ?? details.opportunities)
        };
    }

    async generateAnalysisReport(analysisData, analysisId) {
        return new Promise(async (resolve, reject) => {
            try {
                if (!analysisData) {
                    const error = new Error('analysisData is null or undefined');
                    console.error('❌ PDF Generation Error - analysisData:', error.message);
                    console.error('Stack:', error.stack);
                    throw error;
                }

                const { input, timestamp } = analysisData;
                const analysisPayload = analysisData.analysis ?? analysisData;

                if (!analysisPayload || typeof analysisPayload !== 'object') {
                    const error = new Error(`Analysis data is missing or invalid. Received: ${JSON.stringify(analysisData).substring(0, 200)}`);
                    console.error('❌ PDF Generation Error - Missing analysis:', error.message);
                    console.error('Received data:', analysisData);
                    throw error;
                }

                const reportAnalysis = this.normalizeAnalysisData(analysisData);
                const fileName = `analysis-report-${analysisId}.pdf`;
                const filePath = path.join(this.reportsDir, fileName);

                // Comprehensive validation with detailed error messages
                console.log(`\n${'='.repeat(70)}`);
                console.log(`🔍 PDF GENERATION START`);
                console.log(`Analysis ID: ${analysisId}`);
                console.log(`Timestamp: ${new Date().toISOString()}`);
                console.log(`File Path: ${filePath}`);
                console.log(`${'='.repeat(70)}\n`);
                
                console.log(`🔍 PDF Generation: Starting validation for analysis ID: ${analysisId}`);
                
                // Validate each required field with specific error messages
                const validationErrors = [];
                const fieldChecks = [];

                // Check overallScore
                if (reportAnalysis.overallScore === undefined || reportAnalysis.overallScore === null) {
                    fieldChecks.push(`❌ overallScore: MISSING (undefined/null)`);
                    validationErrors.push('Missing overallScore');
                } else {
                    fieldChecks.push(`✅ overallScore: ${reportAnalysis.overallScore}`);
                }

// Check uniqueness
if (!reportAnalysis.uniqueness?.summary) {
    fieldChecks.push(`❌ uniqueness.summary: MISSING`);
    const uniquenessSafe = JSON.stringify(reportAnalysis.uniqueness ?? "undefined");
    validationErrors.push(`Missing uniqueness summary. Got: ${uniquenessSafe.substring(0, 100)}`);
} else {
    const summaryPreview = String(reportAnalysis.uniqueness.summary).substring(0, 50);
    fieldChecks.push(`✅ uniqueness.summary: ${summaryPreview}...`);
}

                // Check marketViability
                if (!reportAnalysis.marketViability?.summary) {
                    fieldChecks.push(`❌ marketViability.summary: MISSING`);
                    validationErrors.push(`Missing marketViability summary. Got: ${JSON.stringify(reportAnalysis.marketViability).substring(0, 100)}`);
                } else {
                    const summaryPreview = String(reportAnalysis.marketViability.summary).substring(0, 50);
                    fieldChecks.push(`✅ marketViability.summary: ${summaryPreview}...`);
                }

                // Check competition
                if (!reportAnalysis.competition?.summary) {
                    fieldChecks.push(`❌ competition.summary: MISSING`);
                    validationErrors.push(`Missing competition summary. Got: ${JSON.stringify(reportAnalysis.competition).substring(0, 100)}`);
                } else {
                    const summaryPreview = String(reportAnalysis.competition.summary).substring(0, 50);
                    fieldChecks.push(`✅ competition.summary: ${summaryPreview}...`);
                }

                // Check keyMetrics
                if (!reportAnalysis.keyMetrics) {
                    fieldChecks.push(`❌ keyMetrics: MISSING (not an object)`);
                    validationErrors.push('Missing keyMetrics object');
                } else {
                    fieldChecks.push(`✅ keyMetrics: ${Object.keys(reportAnalysis.keyMetrics).length} properties`);
                }

                // Check recommendations
                if (!Array.isArray(reportAnalysis.recommendations)) {
                    fieldChecks.push(`❌ recommendations: NOT AN ARRAY (got ${typeof reportAnalysis.recommendations})`);
                    validationErrors.push(`recommendations is not an array. Got: ${typeof reportAnalysis.recommendations}`);
                } else {
                    fieldChecks.push(`✅ recommendations: ${reportAnalysis.recommendations.length} items`);
                }

                // Check risks
                if (!Array.isArray(reportAnalysis.risks)) {
                    fieldChecks.push(`❌ risks: NOT AN ARRAY (got ${typeof reportAnalysis.risks})`);
                    validationErrors.push(`risks is not an array. Got: ${typeof reportAnalysis.risks}`);
                } else {
                    fieldChecks.push(`✅ risks: ${reportAnalysis.risks.length} items`);
                }

                // Check opportunities
                if (!Array.isArray(reportAnalysis.opportunities)) {
                    fieldChecks.push(`❌ opportunities: NOT AN ARRAY (got ${typeof reportAnalysis.opportunities})`);
                    validationErrors.push(`opportunities is not an array. Got: ${typeof reportAnalysis.opportunities}`);
                } else {
                    fieldChecks.push(`✅ opportunities: ${reportAnalysis.opportunities.length} items`);
                }

                // Log all field checks
                console.log('📋 Field Validation Results:');
                fieldChecks.forEach(check => console.log(`   ${check}`));

                if (validationErrors.length > 0) {
                    const error = new Error(`PDF Validation Failed:\n${validationErrors.join('\n')}`);
                    console.error('\n❌ VALIDATION FAILED');
                    console.error('Error Message:', error.message);
                    console.error('\nFull Analysis Data:');
                    console.error(JSON.stringify(reportAnalysis, null, 2));
                    throw error;
                }

                console.log('\n✅ PDF Generation: All validations passed. Creating document...');

                // Create PDF document
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 },
                    bufferPages: true
                });

                // Pipe to file
                const stream = fs.createWriteStream(filePath);
                
                doc.pipe(stream);

                console.log(`📝 PDF Generation: Adding content sections...`);
                console.log(`   - Adding header...`);

                const [logoBuffer, coverBuffer] = await Promise.all([
                    this.fetchImageBuffer(input?.logoUrl),
                    this.fetchImageBuffer(input?.coverImageUrl)
                ]);

                // Header
                this.addHeader(doc, input?.ideaTitle || 'Startup Analysis', { logoBuffer });

                // Executive Summary
                this.addExecutiveSummary(doc, reportAnalysis, { coverBuffer });
                console.log(`   ✅ Executive Summary added`);

                // Detailed Analysis Sections
                this.addDetailedAnalysis(doc, reportAnalysis);
                console.log(`   ✅ Detailed Analysis added`);

                // Charts and Metrics
                this.addMetricsSection(doc, reportAnalysis);
                console.log(`   ✅ Metrics Section added`);

                // Recommendations
                this.addRecommendations(doc, reportAnalysis);
                console.log(`   ✅ Recommendations added`);

                // Risks and Opportunities
                this.addRisksAndOpportunities(doc, reportAnalysis);
                console.log(`   ✅ Risks and Opportunities added`);

                // Footer
                this.addFooter(doc, timestamp || new Date().toISOString(), analysisId);
                console.log(`   ✅ Footer added`);

                console.log(`\n📋 PDF Generation: Finalizing document...`);

                // Finalize the PDF
                doc.end();

                stream.on('finish', () => {
                    try {
                        console.log(`✅ PDF Generation: Stream finished. Verifying file...`);
                        
                        // Check file exists
                        if (!fs.existsSync(filePath)) {
                            throw new Error(`PDF file was not created at path: ${filePath}`);
                        }

                        const stats = fs.statSync(filePath);
                        console.log(`📊 PDF Generation: File created successfully`);
                        console.log(`   - Size: ${stats.size} bytes`);
                        console.log(`   - Created: ${stats.birthtime}`);
                        console.log(`   - Modified: ${stats.mtime}`);

                        // Ensure the PDF ends with the required EOF marker
                        const content = fs.readFileSync(filePath, { encoding: 'latin1' });
                        if (!content.includes('%%EOF')) {
                            console.log(`🔧 PDF Generation: Adding EOF marker...`);
                            fs.appendFileSync(filePath, '\n%%EOF\n', { encoding: 'latin1' });
                            const newStats = fs.statSync(filePath);
                            console.log(`   ✅ EOF marker added. New size: ${newStats.size} bytes`);
                        } else {
                            console.log(`✅ PDF Generation: EOF marker verified`);
                        }

                        console.log(`\n🎉 PDF GENERATION COMPLETED SUCCESSFULLY`);
                        console.log(`${'='.repeat(70)}\n`);
                        
                        resolve({
                            success: true,
                            fileName,
                            filePath,
                            fileSize: fs.statSync(filePath).size
                        });
                    } catch (err) {
                        console.error('\n❌ ERROR IN STREAM FINISH HANDLER');
                        console.error('Error Message:', err.message);
                        console.error('Stack:', err.stack);
                        console.error(`${'='.repeat(70)}\n`);
                        reject(err);
                    }
                });

                stream.on('error', (error) => {
                    console.error('\n❌ PDF STREAM ERROR');
                    console.error('Error Message:', error.message);
                    console.error('Stack:', error.stack);
                    console.error(`${'='.repeat(70)}\n`);
                    reject(new Error(`Stream error during PDF generation: ${error.message}`));
                });

                doc.on('error', (error) => {
                    console.error('\n❌ PDFDocument ERROR');
                    console.error('Error Message:', error.message);
                    console.error('Stack:', error.stack);
                    console.error(`${'='.repeat(70)}\n`);
                    reject(new Error(`PDFDocument error: ${error.message}`));
                });

            } catch (error) {
                console.error('\n❌ FATAL PDF GENERATION ERROR');
                console.error('Error Message:', error.message);
                console.error('Stack:', error.stack);
                console.error(`${'='.repeat(70)}\n`);
                reject(error);
            }
        });
    }

    addHeader(doc, ideaTitle, assets = {}) {
        const logoCandidates = [
            path.join(__dirname, '../../client/public/Untitled design (1).png'),
            path.join(__dirname, '../../client/build/untitled design (1).png')
        ];

        const logoPath = logoCandidates.find(candidate => fs.existsSync(candidate));

        if (assets.logoBuffer) {
            try {
                doc.image(assets.logoBuffer, 50, 40, { width: 36, height: 36 });
            } catch (error) {
                console.warn('⚠️  PDF logo rendering failed:', error.message);
            }
        } else if (logoPath) {
            try {
                doc.image(logoPath, 50, 40, { width: 36, height: 36 });
            } catch (error) {
                console.warn('⚠️  PDF logo rendering failed:', error.message);
            }
        }

        // Title
        doc.fontSize(24)
           .fillColor('#1e40af')
           .text('inceptIQ', 50, 50, { align: 'center' });

        doc.fontSize(18)
           .fillColor('#374151')
           .text('Comprehensive Analysis Report', 50, 85, { align: 'center' });

        // Idea Title
        doc.fontSize(16)
           .fillColor('#111827')
           .text(`"${ideaTitle}"`, 50, 120, { align: 'center', width: 495 });

        // Separator line
        doc.moveTo(50, 160)
           .lineTo(545, 160)
           .strokeColor('#e5e7eb')
           .stroke();

        doc.y = 180;
    }

    addExecutiveSummary(doc, analysis, assets = {}) {
        doc.fontSize(16)
           .fillColor('#1f2937')
           .text('Executive Summary', 50, doc.y);

        doc.y += 25;

        if (assets.coverBuffer) {
            try {
                doc.image(assets.coverBuffer, 50, doc.y, {
                    fit: [495, 150],
                    align: 'center',
                    valign: 'center'
                });
                doc.y += 165;
            } catch (error) {
                console.warn('⚠️  PDF cover rendering failed:', error.message);
            }
        }

        // Overall Score Box
        const scoreBoxY = doc.y;
        doc.rect(50, scoreBoxY, 495, 80)
           .fillAndStroke('#f3f4f6', '#d1d5db');

        doc.fontSize(14)
           .fillColor('#374151')
           .text('Overall Viability Score', 70, scoreBoxY + 15);

        const overallDisplay = (analysis.overallScore === undefined || analysis.overallScore === null || analysis.overallScore === '')
            ? 'N/A'
            : `${analysis.overallScore}/100`;

        doc.fontSize(32)
           .fillColor('#059669')
           .text(overallDisplay, 70, scoreBoxY + 35);

        // Score breakdown
        const scores = [
            { label: 'Uniqueness', value: analysis.uniquenessScore },
            { label: 'Market Viability', value: analysis.marketViabilityScore },
            { label: 'Competition', value: analysis.competitionScore }
        ];

        let xPos = 250;
        scores.forEach(score => {
            doc.fontSize(10)
               .fillColor('#6b7280')
               .text(score.label, xPos, scoreBoxY + 15);
            
            const scoreDisplay = (score.value === undefined || score.value === null || score.value === '')
                ? 'N/A'
                : `${score.value}`;

            doc.fontSize(18)
               .fillColor('#374151')
               .text(scoreDisplay, xPos, scoreBoxY + 30);

            xPos += 80;
        });

        doc.y = scoreBoxY + 100;
    }

    addDetailedAnalysis(doc, analysis) {
          // Uniqueness Analysis
          this.addSectionHeader(doc, 'Uniqueness Analysis');
          doc.fontSize(11)
              .fillColor('#374151')
              .text(analysis.uniqueness?.summary || 'No summary available', 50, doc.y, { width: 495 });

          doc.moveDown(0.6);
          this.addBulletPoints(doc, 'Strengths:', analysis.uniqueness?.strengths || []);
          this.addBulletPoints(doc, 'Concerns:', analysis.uniqueness?.concerns || []);

          // Market Viability
          this.addSectionHeader(doc, 'Market Viability');
          doc.fontSize(11)
              .text(analysis.marketViability?.summary || 'No summary available', 50, doc.y, { width: 495 });

          doc.moveDown(0.4);
          doc.fontSize(10)
              .fillColor('#6b7280')
              .text('Market Size: ', 50, doc.y)
              .fillColor('#374151')
              .text(analysis.marketViability?.marketSize || 'Not specified', 120, doc.y);

          doc.moveDown(0.4);
          doc.fillColor('#6b7280')
              .text('Target Audience: ', 50, doc.y)
              .fillColor('#374151')
              .text(analysis.marketViability?.targetAudience || 'Not specified', 130, doc.y);

          // Competition Analysis
          this.addSectionHeader(doc, 'Competition Analysis');
          doc.fontSize(11)
              .fillColor('#374151')
              .text(analysis.competition?.summary || 'No summary available', 50, doc.y, { width: 495 });

          doc.moveDown(0.6);
          this.addBulletPoints(doc, 'Direct Competitors:', analysis.competition?.directCompetitors || []);
          this.addBulletPoints(doc, 'Competitive Advantage:', [analysis.competition?.competitiveAdvantage || 'Not specified']);
    }

    addMetricsSection(doc, analysis) {
        this.addSectionHeader(doc, 'Key Metrics');

        const metrics = analysis.keyMetrics || {};
        const metricItems = [
            { label: 'Funding Required', value: metrics.fundingRequired || 'Not specified' },
            { label: 'Time to Market', value: metrics.timeToMarket || 'Not specified' },
            { label: 'Break-even Point', value: metrics.breakEvenPoint || 'Not specified' },
            { label: 'Scalability Rating', value: metrics.scalabilityRating || 'Not rated' }
        ];

        metricItems.forEach(metric => {
            doc.fontSize(10)
               .fillColor('#6b7280')
               .text(`${metric.label}: `, 50, doc.y)
               .fillColor('#374151')
               .text(String(metric.value), 150, doc.y);
            doc.moveDown(0.3);
        });

        doc.moveDown(0.4);
    }

    addRecommendations(doc, analysis) {
        this.addSectionHeader(doc, 'Recommendations');

        const recommendations = analysis.recommendations || [];
        if (recommendations.length === 0) {
            doc.fontSize(10)
               .fillColor('#6b7280')
               .text('No recommendations available');
            return;
        }

        recommendations.forEach((rec, index) => {
            doc.fontSize(11)
               .fillColor('#1f2937')
               .text(`${index + 1}. ${rec.category || 'Recommendation'}`, 50, doc.y);

            doc.moveDown(0.4);
            doc.fontSize(10)
               .fillColor('#374151')
               .text(rec.action || 'No action specified', 70, doc.y, { width: 475 });

            doc.moveDown(0.2);
            doc.fillColor('#6b7280')
               .text(`Priority: ${rec.priority || 'N/A'} | Timeline: ${rec.timeline || 'N/A'}`, 70, doc.y);

            doc.moveDown(0.6);
        });
    }

    addRisksAndOpportunities(doc, analysis) {
        // Risks
        this.addSectionHeader(doc, 'Risk Assessment');
        const risks = analysis.risks || [];
        if (risks.length === 0) {
            doc.fontSize(10)
               .fillColor('#6b7280')
               .text('No risks identified');
            doc.moveDown(0.4);
        } else {
            risks.forEach(risk => {
                doc.fontSize(10)
                   .fillColor('#dc2626')
                   .text(`• ${risk.category || 'Risk'} (${risk.severity || 'N/A'}):`, 50, doc.y);
                
                doc.moveDown(0.2);
                doc.fontSize(9)
                   .fillColor('#374151')
                   .text(risk.description || 'No description', 70, doc.y, { width: 475 });

                doc.moveDown(0.2);
                doc.fillColor('#6b7280')
                   .text(`Mitigation: ${risk.mitigation || 'Not specified'}`, 70, doc.y, { width: 475 });

                doc.moveDown(0.6);
            });
        }

        // Opportunities
        this.addSectionHeader(doc, 'Opportunities');
        const opportunities = analysis.opportunities || [];
        if (opportunities.length === 0) {
            doc.fontSize(10)
               .fillColor('#6b7280')
               .text('No opportunities identified');
            doc.moveDown(0.4);
        } else {
            opportunities.forEach(opp => {
                doc.fontSize(10)
                   .fillColor('#059669')
                   .text(`• ${opp.category || 'Opportunity'} (${opp.impact || 'N/A'} Impact):`, 50, doc.y);
                
                doc.moveDown(0.2);
                doc.fontSize(9)
                   .fillColor('#374151')
                   .text(opp.description || 'No description', 70, doc.y, { width: 475 });

                doc.moveDown(0.6);
            });
        }
    }

    ensureSpace(doc, height = 0) {
        const bottom = doc.page.height - doc.page.margins.bottom;
        if (doc.y + height > bottom) {
            doc.addPage();
        }
    }

    addSectionHeader(doc, title) {
        // Check if we need a new page
        this.ensureSpace(doc, 60);

        doc.fontSize(14)
           .fillColor('#1f2937')
           .text(title, 50, doc.y);

        doc.moveDown(0.6);
    }

    addBulletPoints(doc, title, items) {
        doc.fontSize(10)
           .fillColor('#6b7280')
           .text(title, 50, doc.y);

        doc.moveDown(0.4);
        items.forEach(item => {
            this.ensureSpace(doc, 18);
            doc.fontSize(9)
               .fillColor('#374151')
               .text(`• ${item}`, 70, doc.y, { width: 475 });
            doc.moveDown(0.2);
        });

        doc.moveDown(0.4);
    }

    addFooter(doc, timestamp, analysisId) {
        const pageCount = doc.bufferedPageRange().count;
        
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            
            // Footer line
            doc.moveTo(50, 770)
               .lineTo(545, 770)
               .strokeColor('#e5e7eb')
               .stroke();

            // Footer text
            doc.fontSize(8)
               .fillColor('#6b7280')
               .text('Generated by inceptIQ', 50, 780)
               .text(`Report ID: ${analysisId}`, 50, 792)
               .text(`Generated: ${new Date(timestamp).toLocaleDateString()}`, 400, 780, { align: 'right' })
               .text(`Page ${i + 1} of ${pageCount}`, 400, 792, { align: 'right' });
        }
    }

    getReportPath(analysisId) {
        const fileName = `analysis-report-${analysisId}.pdf`;
        return path.join(this.reportsDir, fileName);
    }

    deleteReport(analysisId) {
        const filePath = this.getReportPath(analysisId);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        return false;
    }

    reportExists(analysisId) {
        const filePath = this.getReportPath(analysisId);
        return fs.existsSync(filePath);
    }
}

module.exports = new PDFService();
