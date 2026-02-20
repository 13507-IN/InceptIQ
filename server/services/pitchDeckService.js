
const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');
const fetch = require('node-fetch');
const pdfService = require('./pdfService');

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

const FONTS = {
  title: 'Aptos Display',
  heading: 'Aptos',
  body: 'Calibri'
};

const FONT_SIZES = {
  coverTitle: 44,
  coverSubtitle: 18,
  h1: 32,
  h2: 24,
  h3: 16,
  body: 13,
  small: 11,
  micro: 9
};

const LAYOUT = {
  marginX: 0.7,
  marginY: 0.6,
  headerTitleY: 0.85,
  headerSubtitleY: 1.45,
  headerLineY: 1.95,
  contentTop: 2.2,
  footerLineY: 7.02,
  footerTextY: 7.1
};

const LIMITS = {
  title: 70,
  subtitle: 160,
  paragraph: 320,
  bullet: 90,
  bulletLong: 130,
  value: 40
};

const BUSINESS_MODEL_LABELS = {
  subscription: 'Subscription / SaaS',
  marketplace: 'Marketplace',
  ecommerce: 'E-commerce',
  freemium: 'Freemium',
  advertising: 'Advertising',
  transaction: 'Transaction-based',
  licensing: 'Licensing',
  other: 'Other'
};

const BUDGET_LABELS = {
  'under-10k': 'Under INR 10,000',
  '10k-50k': 'INR 10,000 - INR 50,000',
  '50k-100k': 'INR 50,000 - INR 100,000',
  '100k-500k': 'INR 100,000 - INR 500,000',
  '500k-1m': 'INR 500,000 - INR 1,000,000',
  'over-1m': 'Over INR 1,000,000'
};

const TIMELINE_LABELS = {
  '3-months': 'Within 3 months',
  '6-months': '3-6 months',
  '1-year': '6-12 months',
  'over-1-year': 'Over 1 year'
};

const HERO_SVG_AURORA = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#38BDF8"/>
      <stop offset="1" stop-color="#34D399"/>
    </linearGradient>
    <radialGradient id="g2" cx="0.2" cy="0.2" r="0.8">
      <stop offset="0" stop-color="#38BDF8" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#0B1020" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="900" height="560" rx="36" fill="#0B1020"/>
  <circle cx="170" cy="130" r="130" fill="url(#g2)"/>
  <rect x="70" y="320" width="760" height="170" rx="26" fill="#101827" stroke="#1F2A44"/>
  <rect x="110" y="350" width="220" height="110" rx="20" fill="#0F172A" stroke="#1F2A44"/>
  <rect x="350" y="350" width="200" height="110" rx="20" fill="url(#g1)"/>
  <rect x="570" y="350" width="220" height="110" rx="20" fill="#0F172A" stroke="#1F2A44"/>
  <path d="M140 270 L260 220 L380 250 L500 180 L640 230 L760 170" stroke="#38BDF8" stroke-width="8" fill="none" stroke-linecap="round"/>
</svg>
`;

const HERO_SVG_NOIR = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F8FAFC"/>
      <stop offset="1" stop-color="#94A3B8"/>
    </linearGradient>
  </defs>
  <rect width="900" height="560" rx="36" fill="#0B0B0D"/>
  <rect x="80" y="90" width="740" height="150" rx="26" fill="#15151A" stroke="#27272A"/>
  <rect x="80" y="270" width="740" height="210" rx="26" fill="#111318" stroke="#1F1F24"/>
  <circle cx="190" cy="165" r="55" stroke="#E2E8F0" stroke-width="3" fill="none"/>
  <circle cx="290" cy="165" r="55" stroke="#A1A1AA" stroke-width="2" fill="none"/>
  <path d="M130 380 L260 340 L400 365 L540 320 L690 350 L800 300" stroke="url(#g1)" stroke-width="6" fill="none" stroke-linecap="round"/>
</svg>
`;

const HERO_SVG_SUNRISE = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#F97316"/>
      <stop offset="1" stop-color="#FB7185"/>
    </linearGradient>
    <radialGradient id="g2" cx="0.25" cy="0.2" r="0.9">
      <stop offset="0" stop-color="#FDBA74" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#1B0B0A" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="900" height="560" rx="36" fill="#1B0B0A"/>
  <circle cx="180" cy="130" r="130" fill="url(#g2)"/>
  <rect x="70" y="320" width="760" height="170" rx="26" fill="#2A1412" stroke="#3F1C19"/>
  <rect x="110" y="350" width="220" height="110" rx="20" fill="#2F1B1A" stroke="#4A2521"/>
  <rect x="350" y="350" width="200" height="110" rx="20" fill="url(#g1)"/>
  <rect x="570" y="350" width="220" height="110" rx="20" fill="#2F1B1A" stroke="#4A2521"/>
  <path d="M140 270 L260 220 L380 250 L500 180 L640 230 L760 170" stroke="#FDBA74" stroke-width="8" fill="none" stroke-linecap="round"/>
</svg>
`;

const TEMPLATE_PRESETS = {
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    description: 'Cool blue + emerald with a tech gradient.',
    theme: {
      background: '0B1020',
      panel: '101827',
      panelAlt: '0F172A',
      border: '1F2A44',
      accent: '38BDF8',
      accentSoft: '7DD3FC',
      text: 'F8FAFC',
      muted: 'CBD5F5',
      subtle: '94A3B8',
      success: '34D399',
      warning: 'FBBF24',
      danger: 'FB7185'
    },
    heroSvg: HERO_SVG_AURORA
  },
  noir: {
    id: 'noir',
    name: 'Noir',
    description: 'Minimal black + slate with crisp contrast.',
    theme: {
      background: '0B0B0D',
      panel: '15151A',
      panelAlt: '111318',
      border: '27272A',
      accent: 'E2E8F0',
      accentSoft: '94A3B8',
      text: 'F8FAFC',
      muted: 'A1A1AA',
      subtle: '71717A',
      success: '22C55E',
      warning: 'F59E0B',
      danger: 'EF4444'
    },
    heroSvg: HERO_SVG_NOIR
  },
  sunrise: {
    id: 'sunrise',
    name: 'Sunrise',
    description: 'Warm orange + rose with bold energy.',
    theme: {
      background: '1B0B0A',
      panel: '2A1412',
      panelAlt: '241110',
      border: '3F1C19',
      accent: 'F97316',
      accentSoft: 'FDBA74',
      text: 'FFF7ED',
      muted: 'FED7AA',
      subtle: 'FEC89A',
      success: '34D399',
      warning: 'FBBF24',
      danger: 'FB7185'
    },
    heroSvg: HERO_SVG_SUNRISE
  }
};

const svgToDataUri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;

const normalizeTemplateId = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  return TEMPLATE_PRESETS[normalized] ? normalized : null;
};

const getTemplateOptions = () =>
  Object.values(TEMPLATE_PRESETS).map(({ id, name, description }) => ({
    id,
    name,
    description
  }));

const fetchImageData = async (url, timeoutMs = 8000) => {
  if (!url) return null;
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeoutId = setTimeout(() => controller?.abort(), timeoutMs);
  try {
    const response = await fetch(url, controller ? { signal: controller.signal } : undefined);
    if (!response.ok) return null;
    const buffer = await response.buffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    if (error?.name === 'AbortError') {
      console.warn('Pitch deck image fetch timed out:', url);
      return null;
    }
    console.warn('Pitch deck image fetch failed:', error.message || error);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
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

const truncateText = (value, maxChars) => {
  const text = safeText(value, '').trim();
  if (!text) return '';
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 3)).trim()}...`;
};

const labelFromMap = (value, map, fallback = 'Not specified') => {
  if (!value) return fallback;
  return map[value] || value;
};

const bulletLines = (items, fallback = 'Details coming soon', maxChars = LIMITS.bullet, count = 5) => {
  const list = take(items, count);
  if (list.length === 0) return `- ${fallback}`;
  return list
    .map((item) => `- ${truncateText(item, maxChars) || fallback}`)
    .join('\n');
};

const formatScore = (value) => (Number.isFinite(value) ? Math.round(value) : 'N/A');

const addPanel = (slide, theme, { x, y, w, h, fill }) => {
  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w,
    h,
    fill: { color: fill || theme.panel },
    line: { color: theme.border }
  });
};

const addSlideHeader = (slide, theme, title, subtitle) => {
  slide.background = { color: theme.background };

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: 0.4,
    fill: { color: theme.panelAlt },
    line: { color: theme.panelAlt }
  });

  slide.addText(truncateText(title, LIMITS.title), {
    x: LAYOUT.marginX,
    y: LAYOUT.headerTitleY,
    w: 12,
    h: 0.6,
    fontFace: FONTS.title,
    fontSize: FONT_SIZES.h1,
    bold: true,
    color: theme.text
  });

  if (subtitle) {
    slide.addText(truncateText(subtitle, LIMITS.subtitle), {
      x: LAYOUT.marginX,
      y: LAYOUT.headerSubtitleY,
      w: 12,
      h: 0.4,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.small,
      color: theme.subtle
    });
  }

  slide.addShape(pptx.ShapeType.rect, {
    x: LAYOUT.marginX,
    y: LAYOUT.headerLineY,
    w: 2.6,
    h: 0.06,
    fill: { color: theme.accent },
    line: { color: theme.accent }
  });
};

const addFooter = (slide, theme, index) => {
  slide.addShape(pptx.ShapeType.rect, {
    x: LAYOUT.marginX,
    y: LAYOUT.footerLineY,
    w: SLIDE_W - LAYOUT.marginX * 2,
    h: 0.02,
    fill: { color: theme.border },
    line: { color: theme.border }
  });

  slide.addText('inceptIQ', {
    x: LAYOUT.marginX,
    y: LAYOUT.footerTextY,
    w: 3,
    h: 0.25,
    fontFace: FONTS.body,
    fontSize: FONT_SIZES.micro,
    color: theme.subtle
  });

  slide.addText(`Slide ${index}`, {
    x: 10.8,
    y: LAYOUT.footerTextY,
    w: 2.2,
    h: 0.25,
    fontFace: FONTS.body,
    fontSize: FONT_SIZES.micro,
    color: theme.subtle,
    align: 'right'
  });
};

class PitchDeckService {
  constructor() {
    this.pitchDir = path.join(__dirname, '../reports/pitch-decks');
    if (!fs.existsSync(this.pitchDir)) {
      fs.mkdirSync(this.pitchDir, { recursive: true });
    }
  }

  getPitchDeckPath(analysisId, templateId) {
    const safeTemplate = normalizeTemplateId(templateId) || 'aurora';
    return path.join(this.pitchDir, `pitch-deck-${analysisId}-${safeTemplate}.pptx`);
  }

  getLegacyPitchDeckPath(analysisId) {
    return path.join(this.pitchDir, `pitch-deck-${analysisId}.pptx`);
  }

  pitchDeckExists(analysisId, templateId) {
    return fs.existsSync(this.getPitchDeckPath(analysisId, templateId));
  }

  pitchDeckExistsLegacy(analysisId) {
    return fs.existsSync(this.getLegacyPitchDeckPath(analysisId));
  }

  getTemplateOptions() {
    return getTemplateOptions();
  }

  resolveTemplateId(value) {
    return normalizeTemplateId(value);
  }

  getTemplate(templateId) {
    return TEMPLATE_PRESETS[templateId] || null;
  }

  async generatePitchDeck(analysisData, analysisId, templateId) {
    if (!analysisData) {
      throw new Error('Missing analysis data for pitch deck generation');
    }

    const resolvedTemplateId = normalizeTemplateId(templateId);
    if (!resolvedTemplateId) {
      throw new Error('Invalid pitch deck template');
    }

    const template = TEMPLATE_PRESETS[resolvedTemplateId];
    const theme = template.theme;

    const normalized = pdfService.normalizeAnalysisData(analysisData);
    const input = analysisData.input || {};

    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.author = 'inceptIQ';
    pptx.company = 'inceptIQ';
    pptx.subject = safeText(input.ideaTitle, 'Startup Pitch Deck');
    pptx.title = safeText(input.ideaTitle, 'Startup Pitch Deck');

    const heroImageData = svgToDataUri(template.heroSvg);
    const [logoImageData, coverImageData] = await Promise.all([
      fetchImageData(input.logoUrl),
      fetchImageData(input.coverImageUrl)
    ]);
    const logoCandidates = [
      path.join(__dirname, '../../client/public/logo-main.png'),
      path.join(__dirname, '../../client/public/react.png')
    ];
    const logoPath = logoCandidates.find(candidate => fs.existsSync(candidate));

    let slideNumber = 1;

    // 1. Cover
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: theme.background };

    titleSlide.addText('inceptIQ', {
      x: LAYOUT.marginX,
      y: 0.55,
      w: 2,
      h: 0.4,
      fontFace: FONTS.heading,
      fontSize: 14,
      color: theme.subtle
    });

    titleSlide.addText(truncateText(input.ideaTitle, LIMITS.title) || 'Startup Pitch Deck', {
      x: LAYOUT.marginX,
      y: 1.6,
      w: 7.3,
      h: 1.0,
      fontFace: FONTS.title,
      fontSize: FONT_SIZES.coverTitle,
      color: theme.text,
      bold: true
    });

    const coverTagline = truncateText(
      input.ideaDescription,
      LIMITS.paragraph
    ) || 'Investor overview';

    titleSlide.addText(coverTagline, {
      x: LAYOUT.marginX,
      y: 2.9,
      w: 7.0,
      h: 1.4,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.coverSubtitle,
      color: theme.muted
    });

    if (input.targetMarket) {
      titleSlide.addText(`Target: ${truncateText(input.targetMarket, 70)}`, {
        x: LAYOUT.marginX,
        y: 4.6,
        w: 6.8,
        h: 0.4,
        fontFace: FONTS.body,
        fontSize: FONT_SIZES.small,
        color: theme.subtle
      });
    }

    titleSlide.addImage({
      data: coverImageData || heroImageData,
      x: 7.6,
      y: 1.2,
      w: 5.2,
      h: 3.6,
      sizing: {
        type: 'cover',
        w: 5.2,
        h: 3.6
      }
    });

    if (logoImageData || logoPath) {
      const logoImageOptions = {
        x: 7.8,
        y: 4.95,
        w: 1.1,
        h: 1.1
      };
      if (logoImageData) {
        logoImageOptions.data = logoImageData;
      } else if (logoPath) {
        logoImageOptions.path = logoPath;
      }
      titleSlide.addImage(logoImageOptions);
    }

    titleSlide.addText(`Generated ${new Date().toLocaleDateString()}`, {
      x: LAYOUT.marginX,
      y: 6.6,
      w: 6,
      h: 0.3,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.micro,
      color: theme.subtle
    });

    // 2. Executive Summary
    const summarySlide = pptx.addSlide();
    addSlideHeader(summarySlide, theme, 'Executive Summary', 'Problem, solution, and assessment at a glance');

    const leftX = LAYOUT.marginX;
    const colW = 5.9;
    const rightX = 7.0;
    const panelH = 2.05;
    const panelGap = 0.35;

    addPanel(summarySlide, theme, { x: leftX, y: LAYOUT.contentTop, w: colW, h: panelH });
    summarySlide.addText('Problem', {
      x: leftX + 0.35,
      y: LAYOUT.contentTop + 0.2,
      w: colW - 0.7,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.accentSoft,
      bold: true
    });
    summarySlide.addText(truncateText(input.ideaDescription || normalized.uniqueness?.summary, LIMITS.paragraph), {
      x: leftX + 0.35,
      y: LAYOUT.contentTop + 0.6,
      w: colW - 0.7,
      h: 1.3,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text
    });

    const panel2Y = LAYOUT.contentTop + panelH + panelGap;
    addPanel(summarySlide, theme, { x: leftX, y: panel2Y, w: colW, h: panelH, fill: theme.panelAlt });
    summarySlide.addText('Solution', {
      x: leftX + 0.35,
      y: panel2Y + 0.2,
      w: colW - 0.7,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.success,
      bold: true
    });
    summarySlide.addText(truncateText(normalized.uniqueness?.summary, LIMITS.paragraph), {
      x: leftX + 0.35,
      y: panel2Y + 0.6,
      w: colW - 0.7,
      h: 1.3,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text
    });

    summarySlide.addText('InceptIQ Assessment', {
      x: rightX,
      y: LAYOUT.contentTop,
      w: 5.6,
      h: 0.4,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.subtle
    });

    const scoreCards = [
      { label: 'Overall', value: formatScore(normalized.overallScore), color: theme.accent },
      { label: 'Uniqueness', value: formatScore(normalized.uniquenessScore), color: theme.success },
      { label: 'Market', value: formatScore(normalized.marketViabilityScore), color: theme.warning },
      { label: 'Competition', value: formatScore(normalized.competitionScore), color: theme.accentSoft }
    ];

    scoreCards.forEach((card, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const cardW = 2.6;
      const cardH = 1.35;
      const cardX = rightX + col * (cardW + 0.4);
      const cardY = LAYOUT.contentTop + 0.5 + row * (cardH + 0.4);
      addPanel(summarySlide, theme, { x: cardX, y: cardY, w: cardW, h: cardH, fill: theme.panelAlt });
      summarySlide.addText(card.label, {
        x: cardX + 0.2,
        y: cardY + 0.2,
        w: cardW - 0.4,
        h: 0.3,
        fontFace: FONTS.body,
        fontSize: FONT_SIZES.micro,
        color: theme.subtle
      });
      summarySlide.addText(String(card.value), {
        x: cardX + 0.2,
        y: cardY + 0.55,
        w: cardW - 0.4,
        h: 0.6,
        fontFace: FONTS.heading,
        fontSize: 26,
        bold: true,
        color: card.color
      });
    });

    addFooter(summarySlide, theme, slideNumber++);

    // 3. Problem & Solution
    const problemSlide = pptx.addSlide();
    addSlideHeader(problemSlide, theme, 'Problem & Solution', 'What pain we solve and how');

    addPanel(problemSlide, theme, { x: leftX, y: LAYOUT.contentTop, w: colW, h: 4.5 });
    problemSlide.addText('Problem', {
      x: leftX + 0.35,
      y: LAYOUT.contentTop + 0.2,
      w: colW - 0.7,
      h: 0.4,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.accentSoft,
      bold: true
    });
    problemSlide.addText(truncateText(input.ideaDescription, LIMITS.paragraph), {
      x: leftX + 0.35,
      y: LAYOUT.contentTop + 0.7,
      w: colW - 0.7,
      h: 3.2,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text
    });

    addPanel(problemSlide, theme, { x: rightX, y: LAYOUT.contentTop, w: colW, h: 4.5, fill: theme.panelAlt });
    problemSlide.addText('Solution', {
      x: rightX + 0.35,
      y: LAYOUT.contentTop + 0.2,
      w: colW - 0.7,
      h: 0.4,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.success,
      bold: true
    });
    problemSlide.addText(truncateText(normalized.uniqueness?.summary, LIMITS.paragraph), {
      x: rightX + 0.35,
      y: LAYOUT.contentTop + 0.7,
      w: colW - 0.7,
      h: 3.2,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text
    });

    addFooter(problemSlide, theme, slideNumber++);

    // 4. Market Opportunity
    const marketSlide = pptx.addSlide();
    addSlideHeader(marketSlide, theme, 'Market Opportunity', 'Why now and where demand concentrates');

    addPanel(marketSlide, theme, { x: leftX, y: LAYOUT.contentTop, w: colW, h: 1.8 });
    marketSlide.addText('Market Size', {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 0.2,
      w: colW - 0.6,
      h: 0.3,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.micro,
      color: theme.subtle
    });
    marketSlide.addText(truncateText(normalized.marketViability?.marketSize, LIMITS.value), {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 0.6,
      w: colW - 0.6,
      h: 0.9,
      fontFace: FONTS.heading,
      fontSize: 22,
      bold: true,
      color: theme.text
    });

    addPanel(marketSlide, theme, { x: leftX, y: LAYOUT.contentTop + 2.1, w: colW, h: 1.8, fill: theme.panelAlt });
    marketSlide.addText('Target Audience', {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 2.3,
      w: colW - 0.6,
      h: 0.3,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.micro,
      color: theme.subtle
    });
    marketSlide.addText(truncateText(normalized.marketViability?.targetAudience || input.targetMarket, LIMITS.paragraph), {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 2.7,
      w: colW - 0.6,
      h: 1.2,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text
    });

    addPanel(marketSlide, theme, { x: rightX, y: LAYOUT.contentTop, w: colW, h: 4.5, fill: theme.panelAlt });
    marketSlide.addText('Key Trends', {
      x: rightX + 0.3,
      y: LAYOUT.contentTop + 0.2,
      w: colW - 0.6,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.subtle
    });
    marketSlide.addText(bulletLines(normalized.marketViability?.trends, 'Add market trend signals', LIMITS.bulletLong, 5), {
      x: rightX + 0.3,
      y: LAYOUT.contentTop + 0.7,
      w: colW - 0.6,
      h: 3.6,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text,
      lineSpacingMultiple: 1.2
    });

    addFooter(marketSlide, theme, slideNumber++);

    // 5. Product / Solution Overview
    const productSlide = pptx.addSlide();
    addSlideHeader(productSlide, theme, 'Product & Solution Overview', 'What you are building and why it matters');

    addPanel(productSlide, theme, { x: leftX, y: LAYOUT.contentTop, w: colW, h: 4.5 });
    productSlide.addText('Solution Summary', {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 0.2,
      w: colW - 0.6,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.accentSoft
    });
    productSlide.addText(truncateText(normalized.uniqueness?.summary, LIMITS.paragraph), {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 0.65,
      w: colW - 0.6,
      h: 1.4,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text
    });
    productSlide.addText('Key Capabilities', {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 2.3,
      w: colW - 0.6,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.subtle
    });
    productSlide.addText(bulletLines(normalized.uniqueness?.strengths, 'Highlight core capabilities', LIMITS.bullet, 5), {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 2.8,
      w: colW - 0.6,
      h: 1.6,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text,
      lineSpacingMultiple: 1.2
    });

    productSlide.addImage({
      data: coverImageData || heroImageData,
      x: rightX,
      y: LAYOUT.contentTop,
      w: colW,
      h: 4.5,
      sizing: {
        type: 'cover',
        w: colW,
        h: 4.5
      }
    });

    addFooter(productSlide, theme, slideNumber++);

    // 6. Business Model & GTM
    const modelSlide = pptx.addSlide();
    addSlideHeader(modelSlide, theme, 'Business Model & GTM', 'How you monetize and reach customers');

    addPanel(modelSlide, theme, { x: leftX, y: LAYOUT.contentTop, w: colW, h: 4.5 });
    modelSlide.addText('Business Model', {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 0.2,
      w: colW - 0.6,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.subtle
    });
    modelSlide.addText(truncateText(labelFromMap(input.businessModel, BUSINESS_MODEL_LABELS, 'Define pricing and revenue streams'), LIMITS.paragraph), {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 0.65,
      w: colW - 0.6,
      h: 1.2,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text
    });
    modelSlide.addText('Primary Target', {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 2.1,
      w: colW - 0.6,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.subtle
    });
    modelSlide.addText(truncateText(input.targetMarket || normalized.marketViability?.targetAudience, LIMITS.paragraph), {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 2.6,
      w: colW - 0.6,
      h: 1.5,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text
    });

    const recommendationLines = take(normalized.recommendations, 4).map((rec) =>
      `${safeText(rec.category, 'Recommendation')}: ${safeText(rec.action, 'Define next step')}`
    );

    addPanel(modelSlide, theme, { x: rightX, y: LAYOUT.contentTop, w: colW, h: 4.5, fill: theme.panelAlt });
    modelSlide.addText('GTM Priorities', {
      x: rightX + 0.3,
      y: LAYOUT.contentTop + 0.2,
      w: colW - 0.6,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.subtle
    });
    modelSlide.addText(bulletLines(recommendationLines, 'Outline your first GTM moves', LIMITS.bulletLong, 5), {
      x: rightX + 0.3,
      y: LAYOUT.contentTop + 0.75,
      w: colW - 0.6,
      h: 3.4,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text,
      lineSpacingMultiple: 1.2
    });

    addFooter(modelSlide, theme, slideNumber++);

    // 7. Competitive Landscape
    const competitionSlide = pptx.addSlide();
    addSlideHeader(competitionSlide, theme, 'Competitive Landscape', 'Who else is in the space');

    addPanel(competitionSlide, theme, { x: leftX, y: LAYOUT.contentTop, w: colW, h: 3.1 });
    competitionSlide.addText('Direct Competitors', {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 0.2,
      w: colW - 0.6,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.subtle
    });
    competitionSlide.addText(bulletLines(normalized.competition?.directCompetitors, 'List direct competitors', LIMITS.bullet, 4), {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 0.75,
      w: colW - 0.6,
      h: 2.1,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text,
      lineSpacingMultiple: 1.2
    });

    addPanel(competitionSlide, theme, { x: rightX, y: LAYOUT.contentTop, w: colW, h: 3.1, fill: theme.panelAlt });
    competitionSlide.addText('Indirect Competitors', {
      x: rightX + 0.3,
      y: LAYOUT.contentTop + 0.2,
      w: colW - 0.6,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.subtle
    });
    competitionSlide.addText(bulletLines(normalized.competition?.indirectCompetitors, 'List indirect competitors', LIMITS.bullet, 4), {
      x: rightX + 0.3,
      y: LAYOUT.contentTop + 0.75,
      w: colW - 0.6,
      h: 2.1,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text,
      lineSpacingMultiple: 1.2
    });

    addPanel(competitionSlide, theme, { x: leftX, y: LAYOUT.contentTop + 3.45, w: 12.0, h: 1.2, fill: theme.panelAlt });
    competitionSlide.addText('Competitive Advantage', {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 3.6,
      w: 11.4,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.success
    });
    competitionSlide.addText(truncateText(normalized.competition?.competitiveAdvantage, LIMITS.paragraph), {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 3.95,
      w: 11.4,
      h: 0.7,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text
    });

    addFooter(competitionSlide, theme, slideNumber++);

    // 8. Progress & Key Metrics
    const metricsSlide = pptx.addSlide();
    addSlideHeader(metricsSlide, theme, 'Progress & Key Metrics', 'Signals that de-risk the opportunity');

    const metrics = normalized.keyMetrics || {};
    const metricItems = [
      { label: 'Funding Required', value: metrics.fundingRequired || 'Not specified', color: theme.accent },
      { label: 'Time to Market', value: metrics.timeToMarket || 'Not specified', color: theme.success },
      { label: 'Break-even Point', value: metrics.breakEvenPoint || 'Not specified', color: theme.warning },
      { label: 'Scalability Rating', value: metrics.scalabilityRating || 'Not rated', color: theme.accentSoft }
    ];

    metricItems.forEach((metric, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const cardW = 5.7;
      const cardH = 1.4;
      const cardX = leftX + col * (cardW + 0.6);
      const cardY = LAYOUT.contentTop + row * (cardH + 0.4);
      addPanel(metricsSlide, theme, { x: cardX, y: cardY, w: cardW, h: cardH });
      metricsSlide.addText(metric.label, {
        x: cardX + 0.3,
        y: cardY + 0.2,
        w: cardW - 0.6,
        h: 0.3,
        fontFace: FONTS.body,
        fontSize: FONT_SIZES.micro,
        color: theme.subtle
      });
      metricsSlide.addText(truncateText(String(metric.value), LIMITS.value), {
        x: cardX + 0.3,
        y: cardY + 0.6,
        w: cardW - 0.6,
        h: 0.6,
        fontFace: FONTS.heading,
        fontSize: 20,
        bold: true,
        color: metric.color
      });
    });

    addPanel(metricsSlide, theme, { x: leftX, y: LAYOUT.contentTop + 3.2, w: 12.0, h: 1.5, fill: theme.panelAlt });
    metricsSlide.addText('Progress Cues', {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 3.35,
      w: 5.4,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.subtle
    });

    const progressLines = [
      'Stage: MVP / early pilots',
      `Timeline: ${labelFromMap(input.timeline, TIMELINE_LABELS, 'Not specified')}`,
      `Budget: ${labelFromMap(input.budget, BUDGET_LABELS, 'Not specified')}`
    ];

    metricsSlide.addText(bulletLines(progressLines, 'Add timeline and budget cues', LIMITS.bulletLong, 4), {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 3.8,
      w: 11.4,
      h: 1.0,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text,
      lineSpacingMultiple: 1.2
    });

    addFooter(metricsSlide, theme, slideNumber++);

    // 9. Risks & Mitigation
    const risksSlide = pptx.addSlide();
    addSlideHeader(risksSlide, theme, 'Risks & Mitigation', 'Key risks to de-risk early');

    const risks = take(normalized.risks, 4);
    addPanel(risksSlide, theme, { x: leftX, y: LAYOUT.contentTop, w: 12.0, h: 4.5, fill: theme.panelAlt });
    risksSlide.addText(bulletLines(risks.map((risk) => {
      const label = safeText(risk.category, 'Risk');
      const mitigation = safeText(risk.mitigation, safeText(risk.description, 'Mitigation plan'));
      return `${label}: ${mitigation}`;
    }), 'Add top risks + mitigations', LIMITS.bulletLong, 5), {
      x: leftX + 0.4,
      y: LAYOUT.contentTop + 0.4,
      w: 11.2,
      h: 3.6,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text,
      lineSpacingMultiple: 1.2
    });

    addFooter(risksSlide, theme, slideNumber++);

    // 10. Fundraising Ask
    const askSlide = pptx.addSlide();
    addSlideHeader(askSlide, theme, 'Fundraising Ask', 'What you need to raise and deliver');

    addPanel(askSlide, theme, { x: leftX, y: LAYOUT.contentTop, w: colW, h: 4.5 });
    askSlide.addText('Funding Target', {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 0.2,
      w: colW - 0.6,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.subtle
    });
    askSlide.addText(truncateText(metrics.fundingRequired || 'Define your raise', LIMITS.value), {
      x: leftX + 0.3,
      y: LAYOUT.contentTop + 0.7,
      w: colW - 0.6,
      h: 1.0,
      fontFace: FONTS.heading,
      fontSize: 28,
      bold: true,
      color: theme.text
    });

    const opportunityLines = take(normalized.opportunities, 4).map((opp) =>
      `${safeText(opp.category, 'Milestone')}: ${safeText(opp.description, 'Define milestone')}`
    );

    addPanel(askSlide, theme, { x: rightX, y: LAYOUT.contentTop, w: colW, h: 4.5, fill: theme.panelAlt });
    askSlide.addText('Use of Funds & Milestones', {
      x: rightX + 0.3,
      y: LAYOUT.contentTop + 0.2,
      w: colW - 0.6,
      h: 0.3,
      fontFace: FONTS.heading,
      fontSize: FONT_SIZES.h3,
      color: theme.subtle
    });
    askSlide.addText(bulletLines(opportunityLines, 'Outline your next milestones', LIMITS.bulletLong, 5), {
      x: rightX + 0.3,
      y: LAYOUT.contentTop + 0.75,
      w: colW - 0.6,
      h: 3.4,
      fontFace: FONTS.body,
      fontSize: FONT_SIZES.body,
      color: theme.text,
      lineSpacingMultiple: 1.2
    });

    addFooter(askSlide, theme, slideNumber++);

    const filePath = this.getPitchDeckPath(analysisId, resolvedTemplateId);
    await pptx.writeFile({ fileName: filePath });

    return {
      fileName: path.basename(filePath),
      filePath
    };
  }
}

module.exports = new PitchDeckService();
