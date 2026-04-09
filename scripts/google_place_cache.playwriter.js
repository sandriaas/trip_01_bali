const fs = require('node:fs');
const path = require('node:path');

const rootDir = typeof TRIP_ROOT === 'string' ? TRIP_ROOT : process.cwd();
const refreshAll = !!TRIP_REFRESH;
const limit = Number.isFinite(TRIP_LIMIT) ? TRIP_LIMIT : 0;
const itemsPath = path.join(rootDir, 'data', 'trip_items_live.json');
const cachePath = path.join(rootDir, 'data', 'google_place_cache.json');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function readJsonIfExists(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function shouldRefresh(entry) {
  if (!entry) return true;
  if (!entry.googlePlaceName) return true;
  if (!entry.googlePlaceUrl) return true;
  if (entry.googleReviewCount == null && !entry.unresolvedReason) return true;
  return false;
}

const items = readJsonIfExists(itemsPath, []).map((item) => ({
  id: item.id,
  title: item.title,
  rawLocation: item.rawLocation,
  regionLabel: item.regionLabel,
  city: item.city,
  kecamatan: item.kecamatan,
  kelurahan: item.kelurahan,
  island: item.island,
  categories: item.categories || [],
  primaryCategory: item.primaryCategory || '',
  typeKey: item.typeKey,
  mapsUrl: item.mapsUrl,
}));

const existingCache = Object.fromEntries(
  readJsonIfExists(cachePath, []).map((entry) => [entry.id, entry]),
);

const queue = items.filter((item) => refreshAll || shouldRefresh(existingCache[item.id]));
const selected = limit > 0 ? queue.slice(0, limit) : queue;

if (!state.page || state.page.isClosed()) {
  state.page = context.pages().find((page) => page.url() === 'about:blank') ?? (await context.newPage());
}

state.page.removeAllListeners();
await state.page.setViewportSize({ width: 1280, height: 960 });

function compactText(text) {
  return String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

for (let index = 0; index < selected.length; index += 1) {
  const item = selected[index];
  console.log(`[${index + 1}/${selected.length}] ${item.title}`);

  try {
    await state.page.goto(item.mapsUrl, { waitUntil: 'domcontentloaded' });
    await waitForPageLoad({ page: state.page, timeout: 9000 });
    await sleep(700);

    const extracted = await state.page.evaluate((currentItem) => {
      const normalize = (value) =>
        String(value || '')
          .toLowerCase()
          .replace(/&/g, ' and ')
          .replace(/[^a-z0-9]+/g, ' ')
          .trim();

      const tokenSet = (value) => new Set(normalize(value).split(/\s+/).filter(Boolean));

      const similarity = (left, right) => {
        const leftTokens = tokenSet(left);
        const rightTokens = tokenSet(right);
        if (!leftTokens.size || !rightTokens.size) return 0;
        let overlap = 0;
        leftTokens.forEach((token) => {
          if (rightTokens.has(token)) {
            overlap += 1;
          }
        });
        return overlap / Math.max(leftTokens.size, rightTokens.size);
      };

      const parseCount = (value) => {
        const match = String(value || '').match(/[\d.,]+/);
        if (!match) return null;
        return Number(match[0].replace(/\./g, '').replace(/,/g, ''));
      };

      const parseRating = (value) => {
        const match = String(value || '').match(/([0-5]\.\d)/);
        return match ? Number(match[1]) : null;
      };

      const cleanLines = (text) =>
        String(text || '')
          .replace(/\u00a0/g, ' ')
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean);

      const compactText = (text) =>
        String(text || '')
          .replace(/\u00a0/g, ' ')
          .replace(/[ \t]+\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      const extractRegexMatch = (text, regex) => {
        const match = String(text || '').match(regex);
        return match ? match[1] : '';
      };

      const bodyText = compactText(document.body.innerText || '');
      const pageUrl = location.href;
      const isPlacePage = /\/maps\/place\//.test(pageUrl);
      const main = document.querySelector('[role="main"]');
      const feed = document.querySelector('[role="feed"]');
      const pageTitle = document.title.replace(/\s*-\s*Google Maps$/, '').trim();
      const placeName = main?.querySelector('h1')?.textContent?.trim() || pageTitle;
      const mainText = compactText(main?.innerText || bodyText);
      const lines = cleanLines(mainText);
      const quotedReviewSnippets = Array.from(mainText.matchAll(/"([^"]{18,180})"/g))
        .map((match) => match[1].trim())
        .slice(0, 3);
      const reviewAria = Array.from(document.querySelectorAll('[aria-label]'))
        .map((element) => element.getAttribute('aria-label') || '')
        .find((value) => /reviews?/i.test(value));
      const accessibilityFlags = Array.from(document.querySelectorAll('[aria-label*="wheelchair" i], [aria-label*="accessible" i]'))
        .map((element) => (element.getAttribute('aria-label') || '').trim())
        .filter(Boolean);
      const aboutRegion = Array.from(document.querySelectorAll('[role="region"][aria-label]'))
        .find((element) => /about /i.test(element.getAttribute('aria-label') || ''));
      const aboutText = compactText(aboutRegion?.innerText || '');
      const addressElement = document.querySelector('[data-item-id="address"]');
      const address =
        (addressElement?.getAttribute('aria-label') || '').replace(/^Address:\s*/i, '').trim() ||
        compactText(addressElement?.textContent || '');

      const primaryTypeMatch = mainText.match(/\n(?:\([\d.,]+\)\n)?([A-Za-z][^\n·]{2,40})(?:·|$)/);
      const primaryType = primaryTypeMatch ? primaryTypeMatch[1].trim() : '';

      let rating = null;
      let reviewCount = null;

      if (isPlacePage) {
        const titleIndex = lines.indexOf(placeName);
        const headerSlice = titleIndex === -1 ? lines.slice(0, 18) : lines.slice(titleIndex, titleIndex + 18);
        rating = parseRating(headerSlice.find((line) => /^([0-5]\.\d)$/.test(line)) || mainText.match(/\n([0-5]\.\d)\n/)?.[1]);
        reviewCount =
          parseCount(headerSlice.find((line) => /^\([\d.,]+\)$/.test(line)) || reviewAria) ||
          parseCount(mainText.match(/\n\(([\d.,]+)\)\n/)?.[1]);
      }

      const resultCards = Array.from(feed?.querySelectorAll('article') || []).map((article) => {
        const text = compactText(article.innerText || '');
        const lines = cleanLines(text);
        const placeLink = article.querySelector('a[href*="/maps/place/"]');
        const titleLink = placeLink || article.querySelector('a[href]');
        const name =
          compactText(placeLink?.textContent || '') ||
          compactText(article.querySelector('h3, h2, [role="heading"]')?.textContent || '') ||
          lines[0] ||
          '';
        const combined = lines.join(' · ');
        const descriptorLine = lines.find((line) => /·/.test(line) && !/[0-5]\.\d\(/.test(line)) || '';
        const hoursLine = lines.find((line) => /(Open|Closes|hours)/i.test(line)) || '';
        const websiteLink = article.querySelector('a[aria-label^="Visit"]');
        const accessibility = Array.from(article.querySelectorAll('[aria-label]'))
          .map((element) => element.getAttribute('aria-label') || '')
          .filter((value) => /wheelchair|accessible/i.test(value));
        return {
          name,
          url: titleLink?.href || '',
          rating: parseRating(combined),
          reviewCount: parseCount(combined.match(/\(([\d.,]+)\)/)?.[1]),
          descriptor: descriptorLine,
          hoursLine,
          accessibility,
          website: websiteLink?.href || '',
          sponsored: /Sponsored/i.test(lines[0] || ''),
          similarity: similarity(
            `${currentItem.title} ${currentItem.rawLocation} ${currentItem.city} ${currentItem.primaryCategory}`,
            `${name} ${combined}`,
          ),
        };
      });

      const fallbackCards = [];
      if (resultCards.length === 0) {
        const bodyLines = cleanLines(bodyText);
        for (let index = 1; index < bodyLines.length; index += 1) {
          if (!/^[0-5]\.\d\([\d.,]+\)$/.test(bodyLines[index])) continue;
          const name = bodyLines[index - 1] || '';
          if (!name || /^(Results|Sponsored|Share|Website|Directions|About pricing|Update results when map moves)$/i.test(name)) {
            continue;
          }
          fallbackCards.push({
            name,
            url: pageUrl,
            rating: parseRating(bodyLines[index]),
            reviewCount: parseCount(bodyLines[index].match(/\(([\d.,]+)\)/)?.[1]),
            descriptor: bodyLines[index + 1] || '',
            hoursLine: bodyLines[index + 2] || '',
            accessibility: [],
            website: '',
            sponsored: false,
            similarity: similarity(
              `${currentItem.title} ${currentItem.rawLocation} ${currentItem.city} ${currentItem.primaryCategory}`,
              `${name} ${bodyLines[index + 1] || ''} ${bodyLines[index + 2] || ''}`,
            ),
          });
        }
      }

      const candidateCards = resultCards.length ? resultCards : fallbackCards;
      const chosenCard = candidateCards
        .slice()
        .sort((left, right) => {
          const similarityDelta = right.similarity - left.similarity;
          if (Math.abs(similarityDelta) > 0.001) return similarityDelta;
          if (left.sponsored !== right.sponsored) return left.sponsored ? 1 : -1;
          return (right.reviewCount || 0) - (left.reviewCount || 0);
        })[0];

      let googlePlaceMatchMode = 'area';
      if (isPlacePage) {
        googlePlaceMatchMode = similarity(currentItem.title, placeName) >= 0.76 ? 'exact' : 'heuristic';
      } else if (chosenCard) {
        googlePlaceMatchMode = chosenCard.similarity >= 0.76 ? 'exact' : chosenCard.similarity >= 0.42 ? 'heuristic' : 'area';
      }

      return {
        id: currentItem.id,
        sourceKind: isPlacePage ? 'place_page' : 'search_results',
        googlePlaceUrl: isPlacePage ? pageUrl : chosenCard?.url || currentItem.mapsUrl,
        googlePlaceName: isPlacePage ? placeName : chosenCard?.name || currentItem.rawLocation || currentItem.title,
        googlePlaceMatchMode,
        googleRating: isPlacePage ? rating : chosenCard?.rating ?? null,
        googleReviewCount: isPlacePage ? reviewCount : chosenCard?.reviewCount ?? null,
        googleReviewSnapshotDate: new Date().toISOString().slice(0, 10),
        googlePrimaryType: isPlacePage ? primaryType : extractRegexMatch(chosenCard?.descriptor || '', /^([^·]+)/),
        googleAddress: isPlacePage ? address : extractRegexMatch(chosenCard?.descriptor || '', /·\s*(.+)$/),
        googleAbout: aboutText || '',
        googleAccessFlags: isPlacePage ? accessibilityFlags : chosenCard?.accessibility || [],
        googleReviewQuotes: isPlacePage ? quotedReviewSnippets : [],
        googleSearchCandidates: candidateCards.slice(0, 3),
        googleBodySample: bodyText.slice(0, 2400),
        unresolvedReason: isPlacePage || chosenCard ? '' : 'No place card or search result could be parsed from Google Maps.',
        extractedAt: new Date().toISOString(),
      };
    }, item);

    existingCache[item.id] = {
      ...(existingCache[item.id] || {}),
      ...extracted,
    };

    const output = Object.values(existingCache).sort((left, right) =>
      String(left.id || '').localeCompare(String(right.id || '')),
    );
    fs.writeFileSync(cachePath, JSON.stringify(output, null, 2));

    console.log(
      ` -> ${extracted.googlePlaceMatchMode} | ${extracted.googlePlaceName || 'unresolved'} | ${extracted.googleRating ?? 'n/a'} | ${extracted.googleReviewCount ?? 'n/a'}`,
    );
  } catch (error) {
    existingCache[item.id] = {
      ...(existingCache[item.id] || {}),
      id: item.id,
      googlePlaceUrl: item.mapsUrl,
      googlePlaceName: item.rawLocation || item.title,
      googlePlaceMatchMode: 'area',
      googleRating: null,
      googleReviewCount: null,
      googleReviewSnapshotDate: new Date().toISOString().slice(0, 10),
      googlePrimaryType: '',
      googleAddress: '',
      googleAbout: '',
      googleAccessFlags: [],
      googleReviewQuotes: [],
      googleSearchCandidates: [],
      googleBodySample: '',
      unresolvedReason: String(error?.message || error || 'Unknown Google Maps extraction error'),
      extractedAt: new Date().toISOString(),
    };
    fs.writeFileSync(
      cachePath,
      JSON.stringify(
        Object.values(existingCache).sort((left, right) => String(left.id || '').localeCompare(String(right.id || ''))),
        null,
        2,
      ),
    );
    console.log(` -> failed | ${existingCache[item.id].unresolvedReason}`);
  }

  await sleep(700);
}

console.log(
  JSON.stringify(
    {
      rootDir,
      processed: selected.length,
      cached: Object.keys(existingCache).length,
      output: cachePath,
    },
    null,
    2,
  ),
);
