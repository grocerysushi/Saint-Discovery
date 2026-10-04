// Local editorial triage only. Reads the same merged catalog as public pages;
// performs no network requests and writes no files. Redirect stdout to save a run.
import { loadTs } from '../tests/load-ts.mjs';

const { getAllSaints } = loadTs('lib/saints.ts');
const { getBiographyReview } = loadTs('lib/saint-reviews.ts');
const { getSaintContribution } = loadTs('lib/saint-contributions.ts');
const { getSaintLearningGuide } = loadTs('lib/saint-learning-guides.ts');
const words = text => text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
const normalized = text => words(text.normalize('NFKC').toLowerCase()).join(' ');
const sentences = text => [...new Intl.Segmenter('en', { granularity: 'sentence' }).segment(text)].map(item => item.segment.trim());
const bucket = count => count < 150 ? 'under150' : count < 300 ? '150to299' : count < 600 ? '300to599' : '600plus';
const emptyBuckets = () => ({ under150: 0, '150to299': 0, '300to599': 0, '600plus': 0 });
const paragraphs = new Map();
const sentenceIndex = new Map();
const sourceHosts = new Map();
const withinProfileSimilarities = [];
const profiles = [];

function indexText(index, text, location) {
  if (words(text).length < 12) return;
  const key = normalized(text);
  if (!index.has(key)) index.set(key, { text, occurrences: [] });
  index.get(key).occurrences.push(location);
}

for (const saint of (await getAllSaints()).sort((a, b) => a.slug.localeCompare(b.slug, 'en'))) {
  const review = getBiographyReview(saint.slug);
  const contribution = getSaintContribution(saint.slug);
  const guide = getSaintLearningGuide(saint.slug);
  const biography = review?.biography ?? [];
  const contributionParagraphs = contribution?.paragraphs ?? [];
  const narrative = [
    ...biography.map((text, index) => ({ text, section: 'biography', paragraph: index + 1 })),
    ...contributionParagraphs.map((text, index) => ({ text, section: 'contribution', paragraph: index + 1 })),
  ];
  const allSentences = [];
  for (const item of narrative) {
    const location = { slug: saint.slug, section: item.section, paragraph: item.paragraph };
    indexText(paragraphs, item.text, location);
    sentences(item.text).forEach((text, index) => {
      const sentenceLocation = { ...location, sentence: index + 1 };
      indexText(sentenceIndex, text, sentenceLocation);
      if (words(text).length >= 12) allSentences.push({ text, location: sentenceLocation, tokens: new Set(words(normalized(text))) });
    });
  }
  // Token-set Jaccard catches close restatements without an external model.
  // Keep every candidate; no editorial judgment or deletion is automated.
  for (let left = 0; left < allSentences.length; left++) {
    for (let right = left + 1; right < allSentences.length; right++) {
      const a = allSentences[left];
      const b = allSentences[right];
      if (normalized(a.text) === normalized(b.text)) continue; // Exact matches are reported separately.
      const intersection = [...a.tokens].filter(token => b.tokens.has(token)).length;
      const score = intersection / (a.tokens.size + b.tokens.size - intersection);
      if (score >= 0.75) withinProfileSimilarities.push({ slug: saint.slug, similarity: Number(score.toFixed(3)), first: { text: a.text, ...a.location }, second: { text: b.text, ...b.location } });
    }
  }
  const biographyUrls = [...new Set((review?.sources ?? []).map(source => source.url))];
  const allUrls = [...new Set([
    ...biographyUrls,
    ...(contribution?.sources ?? []).map(source => source.url),
    ...(guide ? [guide.reading.url, ...guide.faqs.map(faq => faq.source.url)] : []),
  ])];
  for (const url of allUrls) {
    let host = '(invalid URL)';
    try { host = new URL(url).hostname; } catch { /* Surface malformed sources without hiding the rest of the audit. */ }
    sourceHosts.set(host, (sourceHosts.get(host) ?? 0) + 1);
  }
  profiles.push({
    slug: saint.slug,
    biographyWords: words(biography.join(' ')).length,
    narrativeWords: words(narrative.map(item => item.text).join(' ')).length,
    biographySourceCount: biographyUrls.length,
    allSectionSourceCount: allUrls.length,
    hasContribution: Boolean(contribution),
    hasTailoredLearningGuide: Boolean(guide),
    missingBiographyReview: !review,
    feastDateUnspecified: !review?.feast_day,
  });
}

function repeated(index) {
  return [...index.values()].filter(item => item.occurrences.length > 1)
    .map(item => ({ ...item, distinctProfiles: new Set(item.occurrences.map(location => location.slug)).size }))
    .sort((a, b) => b.occurrences.length - a.occurrences.length || a.text.localeCompare(b.text, 'en'));
}
const repeatedParagraphs = repeated(paragraphs);
const repeatedSentences = repeated(sentenceIndex);
const biographyWordBuckets = emptyBuckets();
const narrativeWordBuckets = emptyBuckets();
const biographySourceCounts = {};
for (const profile of profiles) {
  biographyWordBuckets[bucket(profile.biographyWords)]++;
  narrativeWordBuckets[bucket(profile.narrativeWords)]++;
  biographySourceCounts[profile.biographySourceCount] = (biographySourceCounts[profile.biographySourceCount] ?? 0) + 1;
}

console.log(JSON.stringify({
  methodology: {
    purpose: 'Editorial triage, not a Google threshold, quality score, historical fact check, or approval prediction.',
    corpus: 'Published canonical records returned by getAllSaints; merged biography reviews, contributions and tailored learning guides.',
    length: 'Unicode word counts. Narrative combines biography and contribution paragraphs; excludes headings, prayers, reflection and guide exercises.',
    sources: 'Distinct exact source URLs; counts do not establish independence, accessibility, authority or claim support.',
    repetition: 'Biography/contribution paragraphs and Intl.Segmenter English sentences of at least 12 words; case/punctuation/Unicode normalization. Repeated groups include within-page and cross-page occurrences.',
    similarity: 'Nonidentical sentences within one profile with token-set Jaccard >= 0.75. Human review required; relevant shared historical context can be legitimate.',
    limitations: 'No network checks, plagiarism search, semantic fact verification, current review-date certification, or quiz-content assessment. Record totals may include saint groups.',
  },
  summary: {
    publishedRecords: profiles.length,
    biographyWordBuckets,
    narrativeWordBuckets,
    biographySourceCounts,
    profilesWithContributions: profiles.filter(profile => profile.hasContribution).length,
    profilesWithTailoredLearningGuides: profiles.filter(profile => profile.hasTailoredLearningGuide).length,
    missingBiographyReviews: profiles.filter(profile => profile.missingBiographyReview).length,
    unspecifiedFeastDates: profiles.filter(profile => profile.feastDateUnspecified).length,
    repeatedParagraphGroups: repeatedParagraphs.length,
    repeatedSentenceGroups: repeatedSentences.length,
    profilesWithExactRepetition: new Set([...repeatedParagraphs, ...repeatedSentences].flatMap(item => item.occurrences.map(location => location.slug))).size,
    withinProfileSimilarSentencePairs: withinProfileSimilarities.length,
  },
  sourceHostUrlReferences: Object.fromEntries([...sourceHosts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'en'))),
  repeatedParagraphs,
  repeatedSentences,
  withinProfileSimilarities,
  profiles,
}, null, 2));
