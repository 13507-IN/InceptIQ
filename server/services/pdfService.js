const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
    constructor() {
        // Ensure reports directory exists
        this.reportsDir = path.join(__dirname, '../reports');
        if (!fs.existsSync(this.reportsDir)) {
            fs.mkdirSync(this.reportsDir, { recursive: true });
        }
    }

    async generateAnalysisReport(analysisData, analysisId) {
        return new Promise((resolve, reject) => {
            try {
                const { input, analysis, timestamp } = analysisData;
                const fileName = `analysis-report-${analysisId}.pdf`;
                const filePath = path.join(this.reportsDir, fileName);

                // Create PDF document
                const doc = new PDFDocument({
                    size: 'A4',
                    margins: { top: 50, bottom: 50, left: 50, right: 50 }
                });

                // Pipe to file
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // Header
                this.addHeader(doc, input.ideaTitle);

                // Executive Summary
                this.addExecutiveSummary(doc, analysis);

                // Detailed Analysis Sections
                this.addDetailedAnalysis(doc, analysis);

                // Charts and Metrics
                this.addMetricsSection(doc, analysis);

                // Recommendations
                this.addRecommendations(doc, analysis);

                // Risks and Opportunities
                this.addRisksAndOpportunities(doc, analysis);

                // Footer
                this.addFooter(doc, timestamp, analysisId);

                // Finalize the PDF
                doc.end();

                stream.on('finish', () => {
                    try {
                        // Ensure the PDF ends with the required EOF marker. Some readers
                        // fail when it's missing. Check in latin1 to avoid multi-byte issues.
                        const content = fs.readFileSync(filePath, { encoding: 'latin1' });
                        if (!content.includes('%%EOF')) {
                            fs.appendFileSync(filePath, '\n%%EOF\n', { encoding: 'latin1' });
                        }
                    } catch (err) {
                        // Log but don't fail the generation for this safety check
                        console.warn('Warning: could not verify/append PDF EOF marker:', err.message);
                    }

                    resolve({
                        success: true,
                        fileName,
                        filePath,
                        fileSize: fs.statSync(filePath).size
                    });
                });

                stream.on('error', (error) => {
                    reject(error);
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    addHeader(doc, ideaTitle) {
        // Title
        doc.fontSize(24)
           .fillColor('#1e40af')
           .text('AI STARTUP VALIDATOR', 50, 50, { align: 'center' });

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

    addExecutiveSummary(doc, analysis) {
        doc.fontSize(16)
           .fillColor('#1f2937')
           .text('Executive Summary', 50, doc.y);

        doc.y += 25;

        // Overall Score Box
        const scoreBoxY = doc.y;
        doc.rect(50, scoreBoxY, 495, 80)
           .fillAndStroke('#f3f4f6', '#d1d5db');

        doc.fontSize(14)
           .fillColor('#374151')
           .text('Overall Viability Score', 70, scoreBoxY + 15);

        doc.fontSize(32)
           .fillColor('#059669')
           .text(`${analysis.overallScore}/100`, 70, scoreBoxY + 35);

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
            
            doc.fontSize(18)
               .fillColor('#374151')
               .text(`${score.value}`, xPos, scoreBoxY + 30);

            xPos += 80;
        });

        doc.y = scoreBoxY + 100;
    }

    addDetailedAnalysis(doc, analysis) {
          // Uniqueness Analysis
          this.addSectionHeader(doc, 'Uniqueness Analysis');
          doc.fontSize(11)
              .fillColor('#374151')
              .text(analysis.uniqueness.summary, 50, doc.y, { width: 495 });

          doc.y += 20;
          this.addBulletPoints(doc, 'Strengths:', analysis.uniqueness.strengths);
          this.addBulletPoints(doc, 'Concerns:', analysis.uniqueness.concerns);

          // Market Viability
          this.addSectionHeader(doc, 'Market Viability');
          doc.fontSize(11)
              .text(analysis.marketViability.summary, 50, doc.y, { width: 495 });

          doc.y += 15;
          doc.fontSize(10)
              .fillColor('#6b7280')
              .text('Market Size: ', 50, doc.y)
              .fillColor('#374151')
              .text(analysis.marketViability.marketSize, 120, doc.y);

          doc.y += 15;
          doc.fillColor('#6b7280')
              .text('Target Audience: ', 50, doc.y)
              .fillColor('#374151')
              .text(analysis.marketViability.targetAudience, 130, doc.y);

          // Competition Analysis
          this.addSectionHeader(doc, 'Competition Analysis');
          doc.fontSize(11)
              .fillColor('#374151')
              .text(analysis.competition.summary, 50, doc.y, { width: 495 });

          doc.y += 20;
          this.addBulletPoints(doc, 'Direct Competitors:', analysis.competition.directCompetitors);
          this.addBulletPoints(doc, 'Competitive Advantage:', [analysis.competition.competitiveAdvantage]);
    }

    addMetricsSection(doc, analysis) {
        this.addSectionHeader(doc, 'Key Metrics');

        const metrics = analysis.keyMetrics;
        const metricItems = [
            { label: 'Funding Required', value: metrics.fundingRequired },
            { label: 'Time to Market', value: metrics.timeToMarket },
            { label: 'Break-even Point', value: metrics.breakEvenPoint },
            { label: 'Scalability Rating', value: metrics.scalabilityRating }
        ];

        metricItems.forEach(metric => {
            doc.fontSize(10)
               .fillColor('#6b7280')
               .text(`${metric.label}: `, 50, doc.y)
               .fillColor('#374151')
               .text(metric.value, 150, doc.y);
            doc.y += 15;
        });

        doc.y += 10;
    }

    addRecommendations(doc, analysis) {
        this.addSectionHeader(doc, 'Recommendations');

        analysis.recommendations.forEach((rec, index) => {
            doc.fontSize(11)
               .fillColor('#1f2937')
               .text(`${index + 1}. ${rec.category}`, 50, doc.y);

            doc.y += 15;
            doc.fontSize(10)
               .fillColor('#374151')
               .text(rec.action, 70, doc.y, { width: 475 });

            doc.y += 12;
            doc.fillColor('#6b7280')
               .text(`Priority: ${rec.priority} | Timeline: ${rec.timeline}`, 70, doc.y);

            doc.y += 20;
        });
    }

    addRisksAndOpportunities(doc, analysis) {
    // Risks
    this.addSectionHeader(doc, 'Risk Assessment');
    analysis.risks.forEach(risk => {
            doc.fontSize(10)
               .fillColor('#dc2626')
               .text(`• ${risk.category} (${risk.severity}):`, 50, doc.y);
            
            doc.y += 12;
            doc.fontSize(9)
               .fillColor('#374151')
               .text(risk.description, 70, doc.y, { width: 475 });

            doc.y += 12;
            doc.fillColor('#6b7280')
               .text(`Mitigation: ${risk.mitigation}`, 70, doc.y, { width: 475 });

            doc.y += 20;
        });

    // Opportunities
    this.addSectionHeader(doc, 'Opportunities');
    analysis.opportunities.forEach(opp => {
            doc.fontSize(10)
               .fillColor('#059669')
               .text(`• ${opp.category} (${opp.impact} Impact):`, 50, doc.y);
            
            doc.y += 12;
            doc.fontSize(9)
               .fillColor('#374151')
               .text(opp.description, 70, doc.y, { width: 475 });

            doc.y += 20;
        });
    }

    addSectionHeader(doc, title) {
        // Check if we need a new page
        if (doc.y > 720) {
            doc.addPage();
        }

        doc.fontSize(14)
           .fillColor('#1f2937')
           .text(title, 50, doc.y);

        doc.y += 25;
    }

    addBulletPoints(doc, title, items) {
        doc.fontSize(10)
           .fillColor('#6b7280')
           .text(title, 50, doc.y);

        doc.y += 12;
        items.forEach(item => {
            doc.fontSize(9)
               .fillColor('#374151')
               .text(`• ${item}`, 70, doc.y, { width: 475 });
            doc.y += 12;
        });

        doc.y += 10;
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
               .text('Generated by AI Startup Validator', 50, 780)
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
