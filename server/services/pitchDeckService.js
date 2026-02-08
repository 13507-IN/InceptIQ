const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const pdfService = require('./pdfService');

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

const THEME = {
  background: '0B1020',
  panel: '101827',
  accent: '38BDF8',
  accentSoft: '7DD3FC',
  text: 'F8FAFC',
  muted: 'CBD5F5',
  subtle: '94A3B8',
  success: '34D399',
  warning: 'FBBF24',
  danger: 'FB7185'
};

const safeText = (value, fallback = 'Not specified') => {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
};

const toArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [value].filter(Boolean);
};

const take = (items, count) => toArray(items).slice(0, count);

const bulletLines = (items, fallback = 'Details coming soon') => {
  const list = take(items, 5);
  if (list.length === 0) return `- ${fallback}`;
  return list.map((item) => `- ${safeText(item, fallback)}`).join('\n');
};

class PitchDeckService {
  constructor() {
    this.pitchDir = path.join(__dirname, '../reports/pitch-decks');
    if (!fs.existsSync(this.pitchDir)) {
      fs.mkdirSync(this.pitchDir, { recursive: true });
    }
  }

  getPitchDeckPath(analysisId) {
    return path.join(this.pitchDir, `pitch-deck-${analysisId}.pptx`);
  }

  pitchDeckExists(analysisId) {
    return fs.existsSync(this.getPitchDeckPath(analysisId));
  }

  async generatePitchDeck(analysisData, analysisId) {
    if (!analysisData) {
      throw new Error('Missing analysis data for pitch deck generation');
    }

    const normalized = pdfService.normalizeAnalysisData(analysisData);
    const input = analysisData.input || {};

    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'inceptIQ';
    pptx.company = 'inceptIQ';
    pptx.subject = safeText(input.ideaTitle, 'Startup Pitch Deck');
    pptx.title = safeText(input.ideaTitle, 'Startup Pitch Deck');

    const addSlideHeader = (slide, title, subtitle) => {
      slide.background = { color: THEME.background };

      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: SLIDE_W,
        h: 0.6,
        fill: { color: THEME.panel },
        line: { color: THEME.panel }
      });

      slide.addText(title, {
        x: 0.7,
        y: 0.9,
        w: 12,
        h: 0.6,
        fontSize: 30,
        bold: true,
        color: THEME.text
      });

      if (subtitle) {
        slide.addText(subtitle, {
          x: 0.7,
          y: 1.55,
          w: 12,
          h: 0.5,
          fontSize: 14,
          color: THEME.subtle
        });
      }

      slide.addShape(pptx.ShapeType.rect, {
        x: 0.7,
        y: 2.1,
        w: 2.4,
        h: 0.06,
        fill: { color: THEME.accent },
        line: { color: THEME.accent }
      });
    };

    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: THEME.background };
    titleSlide.addText(safeText(input.ideaTitle, 'Startup Pitch Deck'), {
      x: 0.9,
      y: 2.4,
      w: 12,
      h: 0.8,
      fontSize: 44,
      color: THEME.text,
      bold: true
    });
    titleSlide.addText(safeText(input.ideaDescription, 'Investor presentation'), {
      x: 0.9,
      y: 3.4,
      w: 11.6,
      h: 1.3,
      fontSize: 18,
      color: THEME.muted
    });
    titleSlide.addText(`Generated ${new Date().toLocaleDateString()}`, {
      x: 0.9,
      y: 6.4,
      w: 11,
      h: 0.4,
      fontSize: 12,
      color: THEME.subtle
    });

    const problemSlide = pptx.addSlide();
    addSlideHeader(problemSlide, 'Problem & Solution', 'What pain are we solving and how?');
    problemSlide.addShape(pptx.ShapeType.rect, {
      x: 0.7,
      y: 2.5,
      w: 5.8,
      h: 4.5,
      fill: { color: THEME.panel },
      line: { color: THEME.panel }
    });
    problemSlide.addShape(pptx.ShapeType.rect, {
      x: 6.9,
      y: 2.5,
      w: 5.8,
      h: 4.5,
      fill: { color: '111C3D' },
      line: { color: '111C3D' }
    });
    problemSlide.addText('Problem', {
      x: 1.1,
      y: 2.7,
      w: 5,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: THEME.accentSoft
    });
    problemSlide.addText(safeText(input.ideaDescription, normalized.uniqueness?.summary || 'Problem definition'), {
      x: 1.1,
      y: 3.2,
      w: 5,
      h: 3.4,
      fontSize: 14,
      color: THEME.text
    });
    problemSlide.addText('Solution', {
      x: 7.3,
      y: 2.7,
      w: 5,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: THEME.success
    });
    problemSlide.addText(safeText(normalized.uniqueness?.summary, 'Solution narrative'), {
      x: 7.3,
      y: 3.2,
      w: 5,
      h: 3.4,
      fontSize: 14,
      color: THEME.text
    });

    const marketSlide = pptx.addSlide();
    addSlideHeader(marketSlide, 'Market Opportunity', 'Why now and why this market?');
    marketSlide.addText('Market Size', {
      x: 0.8,
      y: 2.6,
      w: 4,
      h: 0.4,
      fontSize: 14,
      color: THEME.subtle
    });
    marketSlide.addText(safeText(normalized.marketViability?.marketSize, 'TAM/SAM/SOM not provided'), {
      x: 0.8,
      y: 3.0,
      w: 4.5,
      h: 1.2,
      fontSize: 20,
      color: THEME.text,
      bold: true
    });
    marketSlide.addText('Target Audience', {
      x: 6.2,
      y: 2.6,
      w: 5.6,
      h: 0.4,
      fontSize: 14,
      color: THEME.subtle
    });
    marketSlide.addText(safeText(normalized.marketViability?.targetAudience, 'Audience details not provided'), {
      x: 6.2,
      y: 3.0,
      w: 5.6,
      h: 1.2,
      fontSize: 16,
      color: THEME.text
    });
    marketSlide.addText('Key Trends', {
      x: 0.8,
      y: 4.6,
      w: 11.5,
      h: 0.4,
      fontSize: 14,
      color: THEME.subtle
    });
    marketSlide.addText(bulletLines(normalized.marketViability?.trends, 'Add market trend signals'), {
      x: 0.8,
      y: 5.1,
      w: 11.5,
      h: 2.0,
      fontSize: 13,
      color: THEME.text
    });

    const differentiationSlide = pptx.addSlide();
    addSlideHeader(differentiationSlide, 'Differentiation', 'Why we win');
    differentiationSlide.addText('Strengths', {
      x: 0.8,
      y: 2.6,
      w: 5.4,
      h: 0.4,
      fontSize: 14,
      color: THEME.subtle
    });
    differentiationSlide.addText(bulletLines(normalized.uniqueness?.strengths, 'Highlight key strengths'), {
      x: 0.8,
      y: 3.1,
      w: 5.4,
      h: 3.6,
      fontSize: 13,
      color: THEME.text
    });
    differentiationSlide.addText('Competitive Advantage', {
      x: 6.6,
      y: 2.6,
      w: 5.8,
      h: 0.4,
      fontSize: 14,
      color: THEME.subtle
    });
    differentiationSlide.addText(safeText(normalized.competition?.competitiveAdvantage, 'Describe how you stay ahead'), {
      x: 6.6,
      y: 3.1,
      w: 5.8,
      h: 3.6,
      fontSize: 13,
      color: THEME.text
    });

    const competitionSlide = pptx.addSlide();
    addSlideHeader(competitionSlide, 'Competitive Landscape', 'Who else is in the space?');
    competitionSlide.addText('Direct Competitors', {
      x: 0.8,
      y: 2.6,
      w: 5.6,
      h: 0.4,
      fontSize: 14,
      color: THEME.subtle
    });
    competitionSlide.addText(bulletLines(normalized.competition?.directCompetitors, 'List direct competitors'), {
      x: 0.8,
      y: 3.1,
      w: 5.6,
      h: 3.6,
      fontSize: 13,
      color: THEME.text
    });
    competitionSlide.addText('Indirect Competitors', {
      x: 6.6,
      y: 2.6,
      w: 5.6,
      h: 0.4,
      fontSize: 14,
      color: THEME.subtle
    });
    competitionSlide.addText(bulletLines(normalized.competition?.indirectCompetitors, 'List indirect competitors'), {
      x: 6.6,
      y: 3.1,
      w: 5.6,
      h: 3.6,
      fontSize: 13,
      color: THEME.text
    });

    const modelSlide = pptx.addSlide();
    addSlideHeader(modelSlide, 'Business Model & GTM', 'How you reach and monetize customers');
    const recommendationLines = take(normalized.recommendations, 4).map((rec) =>
      `${safeText(rec.category, 'Recommendation')}: ${safeText(rec.action, 'Define next step')}`
    );
    modelSlide.addText('Business Model', {
      x: 0.8,
      y: 2.6,
      w: 5.4,
      h: 0.4,
      fontSize: 14,
      color: THEME.subtle
    });
    modelSlide.addText(safeText(input.businessModel, 'Define pricing and revenue streams'), {
      x: 0.8,
      y: 3.1,
      w: 5.4,
      h: 1.8,
      fontSize: 13,
      color: THEME.text
    });
    modelSlide.addText('Go-to-Market', {
      x: 6.6,
      y: 2.6,
      w: 5.6,
      h: 0.4,
      fontSize: 14,
      color: THEME.subtle
    });
    modelSlide.addText(bulletLines(recommendationLines, 'Outline your first GTM moves'), {
      x: 6.6,
      y: 3.1,
      w: 5.6,
      h: 3.6,
      fontSize: 13,
      color: THEME.text
    });

    const metricsSlide = pptx.addSlide();
    addSlideHeader(metricsSlide, 'Key Metrics', 'Fundraising and execution markers');
    const metrics = normalized.keyMetrics || {};
    const metricsList = [
      { label: 'Funding Required', value: metrics.fundingRequired || 'Not specified', color: THEME.accent },
      { label: 'Time to Market', value: metrics.timeToMarket || 'Not specified', color: THEME.success },
      { label: 'Break-even Point', value: metrics.breakEvenPoint || 'Not specified', color: THEME.warning },
      { label: 'Scalability Rating', value: metrics.scalabilityRating || 'Not specified', color: THEME.accentSoft }
    ];

    metricsList.forEach((metric, index) => {
      const x = 0.9 + (index % 2) * 6.2;
      const y = 2.6 + Math.floor(index / 2) * 2.0;
      metricsSlide.addShape(pptx.ShapeType.rect, {
        x,
        y,
        w: 5.6,
        h: 1.6,
        fill: { color: THEME.panel },
        line: { color: THEME.panel }
      });
      metricsSlide.addText(metric.label, {
        x: x + 0.3,
        y: y + 0.25,
        w: 5.0,
        h: 0.3,
        fontSize: 12,
        color: THEME.subtle
      });
      metricsSlide.addText(String(metric.value), {
        x: x + 0.3,
        y: y + 0.65,
        w: 5.0,
        h: 0.7,
        fontSize: 20,
        bold: true,
        color: metric.color
      });
    });

    const risksSlide = pptx.addSlide();
    addSlideHeader(risksSlide, 'Risks & Mitigation', 'Where you need to de-risk');
    const risks = take(normalized.risks, 4);
    risksSlide.addText(bulletLines(risks.map((risk) => `${safeText(risk.category, 'Risk')}: ${safeText(risk.mitigation, safeText(risk.description, 'Mitigation plan'))}`), 'Add top risks + mitigations'), {
      x: 0.8,
      y: 2.6,
      w: 11.8,
      h: 4.6,
      fontSize: 13,
      color: THEME.text
    });

    const askSlide = pptx.addSlide();
    addSlideHeader(askSlide, 'Fundraising Ask', 'What you need to raise and why');
    const opportunityLines = take(normalized.opportunities, 4).map((opp) =>
      `${safeText(opp.category, 'Opportunity')}: ${safeText(opp.description, 'Define milestone')}`
    );
    askSlide.addText('Funding target', {
      x: 0.8,
      y: 2.6,
      w: 5.6,
      h: 0.4,
      fontSize: 14,
      color: THEME.subtle
    });
    askSlide.addText(safeText(metrics.fundingRequired, 'Define your raise'), {
      x: 0.8,
      y: 3.1,
      w: 5.6,
      h: 1.0,
      fontSize: 24,
      bold: true,
      color: THEME.text
    });
    askSlide.addText('Use of funds & milestones', {
      x: 6.6,
      y: 2.6,
      w: 5.6,
      h: 0.4,
      fontSize: 14,
      color: THEME.subtle
    });
    askSlide.addText(bulletLines(opportunityLines, 'Outline your next milestones'), {
      x: 6.6,
      y: 3.1,
      w: 5.6,
      h: 3.6,
      fontSize: 13,
      color: THEME.text
    });

    const filePath = this.getPitchDeckPath(analysisId);
    await pptx.writeFile({ fileName: filePath });

    return {
      fileName: path.basename(filePath),
      filePath
    };
  }
}

module.exports = new PitchDeckService();
