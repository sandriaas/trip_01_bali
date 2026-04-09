#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const RAW_CARDS_PATH = path.join(DATA_DIR, 'live_cards_raw.json');
const URL_MAP_PATH = path.join(DATA_DIR, 'live_url_map.json');
const SNAPSHOT_PATH = path.join(DATA_DIR, 'live_snapshot.json');
const SESSION_ID = process.argv[2] ?? '6';
const BATCH_SIZE = Number(process.argv[3] ?? '6');
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';

fs.mkdirSync(DATA_DIR, { recursive: true });

function runPlaywriter(code) {
  const result = spawnSync('playwriter', ['-s', SESSION_ID, '-e', code], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const details = [result.stdout, result.stderr].filter(Boolean).join('\n');
    throw new Error(`playwriter failed:\n${details}`);
  }

  return result.stdout;
}

function extractTaggedJson(stdout, tag = '__RESULT__') {
  const idx = stdout.lastIndexOf(tag);
  if (idx === -1) {
    throw new Error(`missing ${tag} in playwriter output:\n${stdout}`);
  }
  const payload = stdout.slice(idx + tag.length).trim();
  return JSON.parse(payload);
}

function toPlaywriterCode(lines) {
  return lines.join('\n');
}

function absoluteTravelokaUrl(raw) {
  if (!raw) return null;
  try {
    return new URL(raw, 'https://www.traveloka.com').toString();
  } catch {
    return null;
  }
}

function parseFunnelId(url) {
  try {
    return new URL(url).searchParams.get('funnel_id');
  } catch {
    return null;
  }
}

function chunk(list, size) {
  const groups = [];
  for (let index = 0; index < list.length; index += size) {
    groups.push(list.slice(index, index + size));
  }
  return groups;
}

function ensureSavedListReady() {
  let lastCount = 0;
  let stableSteps = 0;
  let reachedBottom = false;

  for (let step = 0; step < 60 && (!reachedBottom || stableSteps < 3); step += 1) {
    const code = toPlaywriterCode([
      "const page = context.pages().find((p) => p.url().includes('traveloka.com/en-id/user/saved/list'));",
      "if (!page) throw new Error('saved list page not found');",
      "const info = await page.evaluate(async () => {",
      "  const stepSize = Math.max(window.innerHeight * 1.45, 900);",
      "  window.scrollBy({ top: stepSize, behavior: 'instant' });",
      "  await new Promise((resolve) => setTimeout(resolve, 90));",
      "  return {",
      "    count: document.querySelectorAll('[data-testid^=\"card-\"]').length,",
      "    scrollY: window.scrollY,",
      "    viewport: window.innerHeight,",
      "    height: document.body.scrollHeight,",
      "  };",
      "});",
      "console.log('__RESULT__' + JSON.stringify(info));",
    ]);
    const info = extractTaggedJson(runPlaywriter(code));
    const count = info.count;
    reachedBottom = info.scrollY + info.viewport >= info.height - 8;
    if (count === lastCount) {
      stableSteps += 1;
    } else {
      lastCount = count;
      stableSteps = 0;
    }
    if (reachedBottom && stableSteps >= 3) {
      break;
    }
  }

  const finishCode = toPlaywriterCode([
    "const page = context.pages().find((p) => p.url().includes('traveloka.com/en-id/user/saved/list'));",
    "if (!page) throw new Error('saved list page not found');",
    "const testIds = await page.evaluate(async () => {",
    "  window.scrollTo({ top: 0, behavior: 'instant' });",
    "  await new Promise((resolve) => setTimeout(resolve, 120));",
    "  return Array.from(document.querySelectorAll('[data-testid^=\"card-\"]')).map((card) => card.getAttribute('data-testid')).filter(Boolean);",
      "});",
    "console.log('__RESULT__' + JSON.stringify({ count: testIds.length, testIds }));",
    ]);

  return extractTaggedJson(runPlaywriter(finishCode));
}

function extractCardBatch(testIds) {
  const batchJson = JSON.stringify(testIds);
  const code = toPlaywriterCode([
    `const batch = ${batchJson};`,
    "const page = context.pages().find((p) => p.url().includes('traveloka.com/en-id/user/saved/list'));",
    "if (!page) throw new Error('saved list page not found');",
    "const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));",
    "const readBestImage = (card) => {",
    "  const expandSrcset = (value) => (value || '').split(',').map((entry) => entry.trim().split(/\\s+/)[0]).filter(Boolean);",
    "  const makeAbsolute = (value) => {",
    "    if (!value) return null;",
    "    try { return new URL(value, location.origin).toString(); } catch { return value; }",
    "  };",
    "  const isDecorative = (value, width, height) => {",
    "    const lower = String(value || '').toLowerCase();",
    "    if (!lower) return true;",
    "    if (lower.endsWith('.svg')) return true;",
    "    if (lower.includes('/_next/static/')) return true;",
    "    if (lower.includes('/imageresource/')) return true;",
    "    if (width && width < 48 && height && height < 48) return true;",
    "    return false;",
    "  };",
    "  const candidates = [];",
    "  for (const img of card.querySelectorAll('img')) {",
    "    const width = Number(img.naturalWidth || img.width || img.getAttribute('width') || 0);",
    "    const height = Number(img.naturalHeight || img.height || img.getAttribute('height') || 0);",
    "    const area = Math.max(width, 1) * Math.max(height, 1);",
    "    const urls = [img.currentSrc, img.getAttribute('src'), img.getAttribute('data-src')]",
    "      .concat(expandSrcset(img.getAttribute('srcset')))",
    "      .concat(expandSrcset(img.getAttribute('data-srcset')))",
    "      .filter(Boolean);",
    "    for (const raw of urls) {",
    "      const url = makeAbsolute(raw);",
    "      if (!url || isDecorative(url, width, height)) continue;",
    "      candidates.push({ url, score: area + (width >= 80 && height >= 80 ? 100000 : 0) });",
    "    }",
    "  }",
    "  candidates.sort((left, right) => right.score - left.score);",
    "  return candidates[0]?.url || null;",
    "};",
    "const rows = [];",
    "for (const testId of batch) {",
    "  const locator = page.locator(`div[data-testid=\"${testId}\"]`).first();",
    "  await locator.scrollIntoViewIfNeeded();",
    "  await page.waitForTimeout(120);",
    "  const row = await locator.evaluate(async (card) => {",
    "    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));",
    "    card.scrollIntoView({ block: 'center' });",
    "    await wait(90);",
    "    const images = Array.from(card.querySelectorAll('img'));",
    "    await Promise.all(images.map(async (img) => {",
    "      try {",
    "        if (typeof img.decode === 'function' && !img.complete) await img.decode();",
    "      } catch {}",
    "    }));",
    "    await wait(60);",
    "    const readBestImage = " + String.raw`(cardNode => {
      const expandSrcset = (value) => (value || '').split(',').map((entry) => entry.trim().split(/\s+/)[0]).filter(Boolean);
      const makeAbsolute = (value) => {
        if (!value) return null;
        try { return new URL(value, location.origin).toString(); } catch { return value; }
      };
      const isDecorative = (value, width, height) => {
        const lower = String(value || '').toLowerCase();
        if (!lower) return true;
        if (lower.endsWith('.svg')) return true;
        if (lower.includes('/_next/static/')) return true;
        if (lower.includes('/imageresource/')) return true;
        if (width && width < 48 && height && height < 48) return true;
        return false;
      };
      const candidates = [];
      for (const img of cardNode.querySelectorAll('img')) {
        const width = Number(img.naturalWidth || img.width || img.getAttribute('width') || 0);
        const height = Number(img.naturalHeight || img.height || img.getAttribute('height') || 0);
        const area = Math.max(width, 1) * Math.max(height, 1);
        const urls = [img.currentSrc, img.getAttribute('src'), img.getAttribute('data-src')]
          .concat(expandSrcset(img.getAttribute('srcset')))
          .concat(expandSrcset(img.getAttribute('data-srcset')))
          .filter(Boolean);
        for (const raw of urls) {
          const url = makeAbsolute(raw);
          if (!url || isDecorative(url, width, height)) continue;
          candidates.push({ url, score: area + (width >= 80 && height >= 80 ? 100000 : 0) });
        }
      }
      candidates.sort((left, right) => right.score - left.score);
      return candidates[0]?.url || null;
    })` + ";",
    "    return {",
    "      id: (card.getAttribute('data-testid') || '').replace(/^card-/, ''),",
    "      testId: card.getAttribute('data-testid'),",
    "      title: card.querySelector('h3')?.textContent?.trim() || null,",
    "      imageUrl: readBestImage(card),",
    "      lines: (card.innerText || '').split('\\n').map((line) => line.trim()).filter(Boolean),",
    "    };",
    "  });",
    "  rows.push(row);",
    "}",
    "console.log('__RESULT__' + JSON.stringify(rows));",
  ]);

  return extractTaggedJson(runPlaywriter(code));
}

function extractRawCards(testIds) {
  const rows = [];
  for (const group of chunk(testIds, BATCH_SIZE)) {
    const batchRows = extractCardBatch(group);
    rows.push(...batchRows);
    process.stdout.write(`Extracted ${rows.length}/${testIds.length} cards\n`);
  }
  fs.writeFileSync(RAW_CARDS_PATH, JSON.stringify(rows, null, 2));
  return rows;
}

function captureUrlBatch(testIds) {
  const batchJson = JSON.stringify(testIds);
  const code = toPlaywriterCode([
    `const batch = ${batchJson};`,
    "const page = context.pages().find((p) => p.url().includes('traveloka.com/en-id/user/saved/list'));",
    "if (!page) throw new Error('saved list page not found');",
    "const resetCapture = async () => {",
    "  await page.evaluate(() => {",
    "    window.__capturedUrls = [];",
    "    window.open = function (...args) {",
    "      window.__capturedUrls.push(args[0] ?? null);",
    "      return null;",
    "    };",
    "  });",
    "};",
    "const results = [];",
    "for (const testId of batch) {",
    "  const cardId = String(testId).replace(/^card-/, '');",
    "  const selector = `div[data-testid=\"${testId}\"]`;",
    "  const attempts = [",
    "    `${selector} [tabindex=\"0\"]`,",
    "    `${selector} h3`,",
    "    `${selector} img`,",
    "    selector,",
    "  ];",
    "  const matchedUrls = [];",
    "  for (const attempt of attempts) {",
    "    await resetCapture();",
    "    try {",
    "      await page.locator(attempt).first().scrollIntoViewIfNeeded();",
    "      await page.locator(attempt).first().click({ noWaitAfter: true, timeout: 2200 });",
    "    } catch {",
    "      continue;",
    "    }",
    "    await page.waitForTimeout(220);",
    "    const urls = await page.evaluate(() => (window.__capturedUrls || []).slice());",
    "    const absolute = urls.map((value) => {",
    "      try { return new URL(value, 'https://www.traveloka.com').toString(); } catch { return null; }",
    "    }).filter(Boolean);",
    "    const match = absolute.find((value) => {",
    "      try { return new URL(value).searchParams.get('funnel_id') === cardId; } catch { return false; }",
    "    });",
    "    if (match) matchedUrls.push(match);",
    "    if (match) break;",
    "  }",
    "  results.push({ testId, url: matchedUrls[0] || null });",
    "}",
    "console.log('__RESULT__' + JSON.stringify(results));",
  ]);

  return extractTaggedJson(runPlaywriter(code));
}

function captureAllUrls(cards) {
  const urlMap = {};
  const pendingIds = cards.map((card) => card.testId);

  for (const group of chunk(pendingIds, BATCH_SIZE)) {
    const results = captureUrlBatch(group);
    for (const item of results) {
      urlMap[item.testId] = item.url;
    }
    process.stdout.write(`Captured URLs for ${Object.keys(urlMap).length}/${pendingIds.length} cards\n`);
  }

  const missing = pendingIds.filter((testId) => !urlMap[testId]);
  for (const testId of missing) {
    const [result] = captureUrlBatch([testId]);
    urlMap[testId] = result?.url ?? null;
    process.stdout.write(`Retried ${testId}: ${urlMap[testId] ? 'ok' : 'missing'}\n`);
  }

  fs.writeFileSync(URL_MAP_PATH, JSON.stringify(urlMap, null, 2));
  return urlMap;
}

async function fetchFallbackImage(url) {
  if (!url) return null;
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': USER_AGENT,
        'accept-language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    const html = await response.text();
    const patterns = [
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
      /"image":"(https?:\\\/\\\/[^"]+)"/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (!match?.[1]) continue;
      const value = match[1].replace(/\\\//g, '/').replace(/&amp;/g, '&');
      try {
        return new URL(value, response.url).toString();
      } catch {
        return value;
      }
    }
  } catch {}

  return null;
}

async function backfillImages(cards, urlMap) {
  const byTestId = new Map(cards.map((card) => [card.testId, card]));
  const missing = cards.filter((card) => !card.imageUrl && urlMap[card.testId]);

  for (const card of missing) {
    const fallback = await fetchFallbackImage(urlMap[card.testId]);
    if (fallback) {
      byTestId.get(card.testId).imageUrl = fallback;
      process.stdout.write(`Backfilled image for ${card.testId}\n`);
    } else {
      process.stdout.write(`Missing image for ${card.testId}\n`);
    }
  }

  const rows = cards.map((card) => byTestId.get(card.testId));
  fs.writeFileSync(RAW_CARDS_PATH, JSON.stringify(rows, null, 2));
  return rows;
}

function buildSnapshot(cards, urlMap) {
  const rows = cards.map((card) => {
    const travelokaUrl = absoluteTravelokaUrl(urlMap[card.testId]);
    return {
      ...card,
      travelokaUrl,
    };
  });

  const snapshot = {
    sourceUrl: 'https://www.traveloka.com/en-id/user/saved/list?entryPoint=HOMEPAGE_NAV_BAR&cur=IDR',
    extractedAt: new Date().toISOString(),
    itemCount: rows.length,
    rows,
  };

  fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
  return rows;
}

function validateSnapshot(rows) {
  const missingImages = rows.filter((row) => !row.imageUrl);
  const badUrls = rows.filter((row) => {
    if (!row.travelokaUrl) return true;
    return parseFunnelId(row.travelokaUrl) !== row.id;
  });

  return {
    missingImages: missingImages.length,
    badUrls: badUrls.length,
    missingImageIds: missingImages.map((row) => row.testId),
    badUrlIds: badUrls.map((row) => row.testId),
  };
}

const ready = ensureSavedListReady();
const cards = extractRawCards(ready.testIds);
const urlMap = captureAllUrls(cards);
const hydratedCards = await backfillImages(cards, urlMap);
const rows = buildSnapshot(hydratedCards, urlMap);
const validation = validateSnapshot(rows);

console.log(`Saved ${cards.length} live cards to ${RAW_CARDS_PATH}`);
console.log(`Saved URL map to ${URL_MAP_PATH}`);
console.log(`Saved merged snapshot to ${SNAPSHOT_PATH}`);
console.log(JSON.stringify(validation, null, 2));
