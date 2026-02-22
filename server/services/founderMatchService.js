const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were',
  'your', 'their', 'will', 'they', 'them', 'his', 'her', 'she', 'him', 'its',
  'our', 'but', 'not', 'into', 'about', 'can', 'could', 'would', 'should',
  'have', 'has', 'had', 'you', 'yours', 'we', 'us', 'a', 'an', 'of', 'to',
  'in', 'on', 'at', 'by', 'be', 'is', 'it', 'as', 'or', 'if', 'than', 'then',
  'so', 'such', 'via', 'per', 'new', 'startup', 'project', 'idea'
]);

const normalizeValue = (value) => {
  if (!value) return '';
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
};

const normalizeEmail = (value) => {
  if (!value) return '';
  return String(value).trim().toLowerCase();
};

const tokenize = (value) => {
  if (!value) return [];
  const normalized = normalizeValue(value);
  if (!normalized) return [];
  return normalized
    .split(/\s+/)
    .filter((token) => {
      if (!token) return false;
      if (STOP_WORDS.has(token)) return false;
      if (token.length < 2) return false;
      if (token.length < 3 && token !== 'ai') return false;
      return true;
    });
};

const toFrequencyMap = (tokens) => {
  const map = new Map();
  tokens.forEach((token) => {
    map.set(token, (map.get(token) || 0) + 1);
  });
  return map;
};

const cosineSimilarity = (tokensA, tokensB) => {
  if (!tokensA.length || !tokensB.length) return 0;
  const freqA = toFrequencyMap(tokensA);
  const freqB = toFrequencyMap(tokensB);
  let dot = 0;
  let normA = 0;
  let normB = 0;

  freqA.forEach((countA, token) => {
    const countB = freqB.get(token) || 0;
    dot += countA * countB;
    normA += countA * countA;
  });
  freqB.forEach((countB) => {
    normB += countB * countB;
  });

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const jaccardSimilarity = (tokensA, tokensB) => {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  setA.forEach((token) => {
    if (setB.has(token)) intersection += 1;
  });
  const union = setA.size + setB.size - intersection;
  if (union === 0) return 0;
  return intersection / union;
};

const buildIdeaProfile = (idea = {}) => {
  const title = idea.ideaTitle || '';
  const description = idea.ideaDescription || '';
  const meta = [idea.targetMarket, idea.businessModel, idea.industry].filter(Boolean).join(' ');

  return {
    textTokens: tokenize(`${title} ${description}`),
    metaTokens: tokenize(meta),
    industry: normalizeValue(idea.industry),
    businessModel: normalizeValue(idea.businessModel),
    targetMarket: normalizeValue(idea.targetMarket)
  };
};

const extractOverlapTokens = (tokensA, tokensB, limit = 4) => {
  if (!tokensA.length || !tokensB.length) return [];
  const freqA = toFrequencyMap(tokensA);
  const freqB = toFrequencyMap(tokensB);
  const overlap = [];

  freqA.forEach((countA, token) => {
    const countB = freqB.get(token) || 0;
    if (countB > 0) {
      overlap.push({ token, score: countA + countB });
    }
  });

  overlap.sort((a, b) => b.score - a.score || a.token.localeCompare(b.token));
  return overlap.slice(0, limit).map((entry) => entry.token);
};

const computeMatchScore = (baseIdea = {}, candidateIdea = {}) => {
  const baseProfile = buildIdeaProfile(baseIdea);
  const candidateProfile = buildIdeaProfile(candidateIdea);

  const textSimilarity = cosineSimilarity(baseProfile.textTokens, candidateProfile.textTokens);
  const metaSimilarity = jaccardSimilarity(baseProfile.metaTokens, candidateProfile.metaTokens);

  const textWeight = (baseProfile.textTokens.length || candidateProfile.textTokens.length) ? 0.7 : 0;
  const metaWeight = (baseProfile.metaTokens.length || candidateProfile.metaTokens.length) ? 0.3 : 0;
  const weightSum = textWeight + metaWeight || 1;

  const baseScore = ((textSimilarity * textWeight) + (metaSimilarity * metaWeight)) / weightSum;

  let bonus = 0;
  if (baseProfile.industry && baseProfile.industry === candidateProfile.industry) bonus += 0.05;
  if (baseProfile.businessModel && baseProfile.businessModel === candidateProfile.businessModel) bonus += 0.03;
  if (baseProfile.targetMarket && baseProfile.targetMarket === candidateProfile.targetMarket) bonus += 0.02;

  const finalScore = Math.min(baseScore + bonus, 1);
  const matchScore = Math.round(finalScore * 100);

  const matchReasons = [];
  if (baseProfile.industry && baseProfile.industry === candidateProfile.industry && candidateIdea.industry) {
    matchReasons.push(`Industry: ${candidateIdea.industry}`);
  }
  if (baseProfile.businessModel && baseProfile.businessModel === candidateProfile.businessModel && candidateIdea.businessModel) {
    matchReasons.push(`Model: ${candidateIdea.businessModel}`);
  }
  if (baseProfile.targetMarket && baseProfile.targetMarket === candidateProfile.targetMarket && candidateIdea.targetMarket) {
    matchReasons.push(`Target: ${candidateIdea.targetMarket}`);
  }

  const overlapTokens = extractOverlapTokens(baseProfile.textTokens, candidateProfile.textTokens, 3);
  if (overlapTokens.length) {
    matchReasons.push(`Shared keywords: ${overlapTokens.join(', ')}`);
  }

  return { matchScore, matchReasons };
};

const findFounderMatches = ({ idea, posts = [], userId, userEmail, minScore = 35, maxResults = 5 }) => {
  const normalizedEmail = normalizeEmail(userEmail);
  const minScoreValue = Number.isFinite(Number(minScore)) ? Math.max(0, Math.min(100, Number(minScore))) : 35;
  const maxResultsValue = Number.isFinite(Number(maxResults))
    ? Math.max(1, Math.min(10, Number(maxResults)))
    : 5;

  return posts
    .filter((post) => post && post.idea && post.idea.ideaTitle && post.idea.ideaDescription)
    .filter((post) => post.author && post.author.email)
    .filter((post) => {
      if (!userId) return true;
      return post.author?.id !== userId;
    })
    .filter((post) => {
      if (!normalizedEmail) return true;
      return normalizeEmail(post.author?.email) !== normalizedEmail;
    })
    .map((post) => {
      const { matchScore, matchReasons } = computeMatchScore(idea, post.idea);
      return {
        id: post.id,
        analysisId: post.analysisId || null,
        createdAt: post.createdAt,
        idea: post.idea,
        author: post.author,
        matchScore,
        matchReasons
      };
    })
    .filter((match) => match.matchScore >= minScoreValue)
    .sort((a, b) => b.matchScore - a.matchScore || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, maxResultsValue);
};

module.exports = {
  findFounderMatches
};
