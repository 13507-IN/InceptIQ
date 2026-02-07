const investors = require('../data/investors');

const normalizeValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim().toLowerCase();
};

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(normalizeValue).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => normalizeValue(item))
      .filter(Boolean);
  }
  return [normalizeValue(value)].filter(Boolean);
};

const includesNormalized = (list, value) => {
  const target = normalizeValue(value);
  if (!target) return false;
  return normalizeArray(list).includes(target);
};

const intersects = (list, values) => {
  const set = new Set(normalizeArray(list));
  return normalizeArray(values).some((value) => set.has(value));
};

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const cleaned = String(value).replace(/[^0-9.]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const tokenizeKeywords = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap((item) => tokenizeKeywords(item));
  }
  return String(value)
    .split(/[,\\s]+/)
    .map((item) => normalizeValue(item))
    .filter(Boolean);
};

const formatCurrencyShort = (value) => {
  if (!Number.isFinite(value)) return '';
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1).replace(/\.0$/, '')}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}k`;
  return `${Math.round(value)}`;
};

const formatCheckRange = (min, max) => {
  const minVal = Number.isFinite(min) ? min : null;
  const maxVal = Number.isFinite(max) ? max : null;
  if (!minVal && !maxVal) return 'Flexible';
  if (!minVal) return `Up to $${formatCurrencyShort(maxVal)}`;
  if (!maxVal) return `From $${formatCurrencyShort(minVal)}`;
  return `$${formatCurrencyShort(minVal)}-$${formatCurrencyShort(maxVal)}`;
};

const withinTicketRange = (investor, ticketSize) => {
  if (!ticketSize) return false;
  const min = Number.isFinite(investor.ticketMin) ? investor.ticketMin : 0;
  const max = Number.isFinite(investor.ticketMax) ? investor.ticketMax : Number.POSITIVE_INFINITY;
  return ticketSize >= min && ticketSize <= max;
};

const matchesQuery = (investor, query) => {
  const q = normalizeValue(query);
  if (!q) return true;
  const haystack = [
    investor.name,
    investor.type,
    investor.thesis,
    ...(investor.industries || []),
    ...(investor.geography || []),
    ...(investor.stages || []),
    ...(investor.preferredModels || []),
    ...(investor.thesisKeywords || [])
  ]
    .map((value) => normalizeValue(value))
    .join(' ');
  return haystack.includes(q);
};

const enrichInvestor = (investor) => ({
  ...investor,
  checkRange: formatCheckRange(investor.ticketMin, investor.ticketMax)
});

const listInvestors = (filters = {}) => {
  const { q, industry, stage, geography, type, minCheck, maxCheck } = filters;
  const minCheckVal = parseNumber(minCheck);
  const maxCheckVal = parseNumber(maxCheck);

  return investors
    .filter((investor) => matchesQuery(investor, q))
    .filter((investor) => (!industry ? true : intersects(investor.industries, industry)))
    .filter((investor) => (!stage ? true : intersects(investor.stages, stage)))
    .filter((investor) => (!geography ? true : intersects(investor.geography, geography)))
    .filter((investor) => (!type ? true : includesNormalized(investor.type, type)))
    .filter((investor) => {
      if (!minCheckVal && !maxCheckVal) return true;
      const min = Number.isFinite(investor.ticketMin) ? investor.ticketMin : 0;
      const max = Number.isFinite(investor.ticketMax) ? investor.ticketMax : Number.POSITIVE_INFINITY;
      if (minCheckVal && max < minCheckVal) return false;
      if (maxCheckVal && min > maxCheckVal) return false;
      return true;
    })
    .map(enrichInvestor);
};

const matchInvestors = (criteria = {}) => {
  const industry = normalizeValue(criteria.industry || criteria.sector);
  const stage = normalizeValue(criteria.stage);
  const geography = normalizeValue(criteria.geography || criteria.location || criteria.region);
  const model = normalizeValue(criteria.model || criteria.businessModel);
  const ticketSize = parseNumber(criteria.ticketSize || criteria.checkSize || criteria.fundingAsk);
  const keywords = tokenizeKeywords(criteria.keywords || criteria.keyword || '');
  const minScore = parseNumber(criteria.minScore);

  const weights = {
    industry: 25,
    stage: 25,
    geography: 15,
    ticket: 20,
    keywords: 10,
    model: 5
  };

  const activeWeights = {
    industry: industry ? weights.industry : 0,
    stage: stage ? weights.stage : 0,
    geography: geography ? weights.geography : 0,
    ticket: ticketSize ? weights.ticket : 0,
    keywords: keywords.length > 0 ? weights.keywords : 0,
    model: model ? weights.model : 0
  };

  const totalWeight = Object.values(activeWeights).reduce((sum, value) => sum + value, 0);

  const results = investors.map((investor) => {
    let score = 0;
    const reasons = [];

    if (industry && intersects(investor.industries, industry)) {
      score += weights.industry;
      reasons.push(`Industry match: ${investor.industries.join(', ')}`);
    }

    if (stage && intersects(investor.stages, stage)) {
      score += weights.stage;
      reasons.push(`Stage focus includes ${investor.stages.join(', ')}`);
    }

    if (geography && intersects(investor.geography, geography)) {
      score += weights.geography;
      reasons.push(`Region alignment: ${investor.geography.join(', ')}`);
    }

    if (ticketSize && withinTicketRange(investor, ticketSize)) {
      score += weights.ticket;
      reasons.push(`Check size aligns with ${formatCheckRange(investor.ticketMin, investor.ticketMax)}`);
    }

    if (model && intersects(investor.preferredModels, model)) {
      score += weights.model;
      reasons.push(`Business model fit: ${investor.preferredModels.join(', ')}`);
    }

    if (keywords.length > 0) {
      const keywordHaystack = new Set([
        ...(investor.thesisKeywords || []),
        ...(investor.industries || []),
        ...(investor.thesis ? investor.thesis.split(' ') : [])
      ].map((value) => normalizeValue(value)));

      const matchedKeywords = keywords.filter((keyword) => keywordHaystack.has(keyword));
      if (matchedKeywords.length > 0) {
        score += weights.keywords;
        reasons.push(`Theme overlap: ${matchedKeywords.join(', ')}`);
      }
    }

    const normalizedScore = totalWeight > 0 ? Math.round((score / totalWeight) * 100) : 0;

    if (totalWeight === 0) {
      reasons.push('Add criteria to refine matches.');
    }

    return {
      ...enrichInvestor(investor),
      matchScore: normalizedScore,
      matchReasons: reasons
    };
  });

  const sorted = results.sort((a, b) => b.matchScore - a.matchScore || a.name.localeCompare(b.name));

  if (Number.isFinite(minScore)) {
    return sorted.filter((investor) => investor.matchScore >= minScore);
  }

  return sorted;
};

module.exports = {
  listInvestors,
  matchInvestors,
  formatCheckRange
};
