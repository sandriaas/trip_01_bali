#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const SNAPSHOT_PATH = path.join(DATA_DIR, 'live_snapshot.json');
const METADATA_PATH = path.join(DATA_DIR, 'trip_metadata.json');
const ITEMS_PATH = path.join(DATA_DIR, 'trip_items_live.json');
const HTML_PATH = path.join(ROOT, 'trip-curated.html');
const SINGLEFILE_SNAPSHOT_PATH = path.join(ROOT, '8fd62a39-514e-472c-ad51-2f8d48898bd3.htm');
const STYLES_PATH = path.join(__dirname, 'trip_curated_styles.css');
const APP_PATH = path.join(__dirname, 'trip_curated_app.js');
const HTML2CANVAS_PATH = path.join(__dirname, 'vendor', 'html2canvas.min.js');
const JSPDF_PATH = path.join(__dirname, 'vendor', 'jspdf.umd.min.js');
const USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36';
const FETCH_DELAY_MS = 160;
const THUMB_WIDTH = 168;
const THUMB_HEIGHT = 196;
const PLACEHOLDER_IMAGE_PATTERNS = [
  /_next\/static\/v[\d.]+\/\d\/[a-f0-9]+\.svg/i,
  /imageResource\/2021\/11\/16\/1637058666270-29b7ebc060f33f5891820ceea42e18d5\.gif/i,
];

const REGION_ORDER = {
  north: 0,
  central: 1,
  west: 2,
  east: 3,
  south: 4,
  outside_island: 5,
  outside_bali: 6,
};

const LOCATION_OVERRIDES = {
  Abiansemal: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Abiansemal', kelurahan: '', island: 'Bali', city: 'Badung' },
  'Badung Regency, Bali': { regionKey: 'south', regionLabel: 'South', kecamatan: '', kelurahan: '', island: 'Bali', city: 'Badung' },
  Bangli: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Bangli', kelurahan: '', island: 'Bali', city: 'Bangli' },
  'Bangli, Bali': { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Bangli', kelurahan: '', island: 'Bali', city: 'Bangli' },
  Batubulan: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Sukawati', kelurahan: 'Batubulan', island: 'Bali', city: 'Gianyar' },
  Bedugul: { regionKey: 'north', regionLabel: 'North', kecamatan: 'Baturiti', kelurahan: 'Bedugul', island: 'Bali', city: 'Tabanan' },
  Besakih: { regionKey: 'east', regionLabel: 'East', kecamatan: 'Rendang', kelurahan: 'Besakih', island: 'Bali', city: 'Karangasem' },
  Bintaro: { regionKey: 'outside_bali', regionLabel: 'Outside Bali · Java', kecamatan: 'Pondok Aren', kelurahan: 'Bintaro', island: 'Java', city: 'South Tangerang' },
  Candidasa: { regionKey: 'east', regionLabel: 'East', kecamatan: 'Manggis', kelurahan: 'Candidasa', island: 'Bali', city: 'Karangasem' },
  Celuk: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Sukawati', kelurahan: 'Celuk', island: 'Bali', city: 'Gianyar' },
  'Central Jakarta, Jakarta': { regionKey: 'outside_bali', regionLabel: 'Outside Bali · Java', kecamatan: 'Tanah Abang', kelurahan: '', island: 'Java', city: 'Central Jakarta' },
  'Denpasar, Bali': { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Denpasar', kelurahan: '', island: 'Bali', city: 'Denpasar' },
  'Gili Trawangan': { regionKey: 'outside_island', regionLabel: 'Outside Island · Gili Trawangan', kecamatan: 'Pemenang', kelurahan: '', island: 'Gili Trawangan', city: 'North Lombok' },
  Jimbaran: { regionKey: 'south', regionLabel: 'South', kecamatan: 'South Kuta', kelurahan: 'Jimbaran', island: 'Bali', city: 'Badung' },
  Kedewatan: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Ubud', kelurahan: 'Kedewatan', island: 'Bali', city: 'Gianyar' },
  Keramas: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Blahbatuh', kelurahan: 'Keramas', island: 'Bali', city: 'Gianyar' },
  Kerobokan: { regionKey: 'west', regionLabel: 'West', kecamatan: 'North Kuta', kelurahan: 'Kerobokan', island: 'Bali', city: 'Badung' },
  Kintamani: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Kintamani', kelurahan: '', island: 'Bali', city: 'Bangli' },
  Komodo: { regionKey: 'outside_island', regionLabel: 'Outside Island · Komodo', kecamatan: 'Komodo', kelurahan: '', island: 'Komodo', city: 'West Manggarai' },
  Kuta: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Kuta', kelurahan: 'Kuta', island: 'Bali', city: 'Badung' },
  'Labuan Bajo': { regionKey: 'outside_bali', regionLabel: 'Outside Bali · Flores', kecamatan: 'Komodo', kelurahan: 'Labuan Bajo', island: 'Flores', city: 'West Manggarai' },
  Legian: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Kuta', kelurahan: 'Legian', island: 'Bali', city: 'Badung' },
  Lovina: { regionKey: 'north', regionLabel: 'North', kecamatan: 'Banjar', kelurahan: 'Lovina', island: 'Bali', city: 'Buleleng' },
  'Nusa Dua Beach': { regionKey: 'south', regionLabel: 'South', kecamatan: 'South Kuta', kelurahan: 'Nusa Dua', island: 'Bali', city: 'Badung' },
  'Nusa Lembongan': { regionKey: 'outside_island', regionLabel: 'Outside Island · Nusa Lembongan', kecamatan: 'Nusa Penida', kelurahan: '', island: 'Nusa Lembongan', city: 'Klungkung' },
  'Nusa Penida': { regionKey: 'outside_island', regionLabel: 'Outside Island · Nusa Penida', kecamatan: 'Nusa Penida', kelurahan: '', island: 'Nusa Penida', city: 'Klungkung' },
  Pecatu: { regionKey: 'south', regionLabel: 'South', kecamatan: 'South Kuta', kelurahan: 'Pecatu', island: 'Bali', city: 'Badung' },
  Sayan: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Ubud', kelurahan: 'Sayan', island: 'Bali', city: 'Gianyar' },
  Sidemen: { regionKey: 'east', regionLabel: 'East', kecamatan: 'Sidemen', kelurahan: '', island: 'Bali', city: 'Karangasem' },
  'South Denpasar': { regionKey: 'central', regionLabel: 'Central', kecamatan: 'South Denpasar', kelurahan: '', island: 'Bali', city: 'Denpasar' },
  'South Jakarta, Jakarta': { regionKey: 'outside_bali', regionLabel: 'Outside Bali · Java', kecamatan: 'Kebayoran Baru', kelurahan: '', island: 'Java', city: 'South Jakarta' },
  Sukasada: { regionKey: 'north', regionLabel: 'North', kecamatan: 'Sukasada', kelurahan: '', island: 'Bali', city: 'Buleleng' },
  Sukawati: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Sukawati', kelurahan: '', island: 'Bali', city: 'Gianyar' },
  Tampaksiring: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Tampaksiring', kelurahan: '', island: 'Bali', city: 'Gianyar' },
  'Tanah Lot': { regionKey: 'west', regionLabel: 'West', kecamatan: 'Kediri', kelurahan: 'Beraban', island: 'Bali', city: 'Tabanan' },
  'Tanjung Benoa': { regionKey: 'south', regionLabel: 'South', kecamatan: 'South Kuta', kelurahan: 'Tanjung Benoa', island: 'Bali', city: 'Badung' },
  Tembuku: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Tembuku', kelurahan: '', island: 'Bali', city: 'Bangli' },
  'Tirta Gangga': { regionKey: 'east', regionLabel: 'East', kecamatan: 'Abang', kelurahan: 'Ababi', island: 'Bali', city: 'Karangasem' },
  Ubud: { regionKey: 'central', regionLabel: 'Central', kecamatan: 'Ubud', kelurahan: 'Ubud', island: 'Bali', city: 'Gianyar' },
  'West Jakarta, Jakarta': { regionKey: 'outside_bali', regionLabel: 'Outside Bali · Java', kecamatan: 'Grogol Petamburan', kelurahan: '', island: 'Java', city: 'West Jakarta' },
  'Yogyakarta, Special Region of Yogyakarta': { regionKey: 'outside_bali', regionLabel: 'Outside Bali · Java', kecamatan: '', kelurahan: '', island: 'Java', city: 'Yogyakarta' },
};

const ITEM_LOCATION_OVERRIDES = {
  'Akatara Stay Jimbaran Bali': { regionKey: 'south', regionLabel: 'South', kecamatan: 'South Kuta', kelurahan: 'Jimbaran', island: 'Bali', city: 'Badung' },
  'Urbanview Hotel Rasa Sayang Inn Tanjung Benoa Bali': { regionKey: 'south', regionLabel: 'South', kecamatan: 'South Kuta', kelurahan: 'Tanjung Benoa', island: 'Bali', city: 'Badung' },
  'RedDoorz near Exit Toll Nusa Dua': { regionKey: 'south', regionLabel: 'South', kecamatan: 'South Kuta', kelurahan: 'Nusa Dua', island: 'Bali', city: 'Badung' },
  'MK House SCBD': { regionKey: 'outside_bali', regionLabel: 'Outside Bali · Java', kecamatan: 'Kebayoran Baru', kelurahan: 'Senayan', island: 'Java', city: 'South Jakarta' },
  'W Home Benhil': { regionKey: 'outside_bali', regionLabel: 'Outside Bali · Java', kecamatan: 'Tanah Abang', kelurahan: 'Bendungan Hilir', island: 'Java', city: 'Central Jakarta' },
  'apartemen Taman Anggrek Residence by UNIQROOM': { regionKey: 'outside_bali', regionLabel: 'Outside Bali · Java', kecamatan: 'Grogol Petamburan', kelurahan: 'Tanjung Duren Selatan', island: 'Java', city: 'West Jakarta' },
  'Taman Anggrek Residence By Gin': { regionKey: 'outside_bali', regionLabel: 'Outside Bali · Java', kecamatan: 'Grogol Petamburan', kelurahan: 'Tanjung Duren Selatan', island: 'Java', city: 'West Jakarta' },
};

const ITEM_CATEGORY_OVERRIDES = {
  'Labuan Bajo City Tour, Rangko Cave, Baku Peduli Weaving House, & Sylvia Hill': ['City Tour', 'Cave', 'Culture Village'],
  'Peniday: Nusa Penida Island Adventure': ['Island Tour', 'Boat'],
  'Bali Tour: Lempuyang – Tirta Gangga – Taman Ujung – Lahangan Sweet': ['Temple', 'Viewpoint'],
  'The Natural Beauty of Kintamani: Views of Mount Batur, Telaga Waja Rafting, and Tegalalang': ['Rafting', 'Viewpoint'],
  'Bali: Dirt Bike Motorcycle Tour to Black Beach': ['ATV', 'Viewpoint'],
  "After hiking a mountain in Kintamani, let's head to a Waterfall in Ubud": ['Waterfall', 'Viewpoint'],
  'Tenganan Village - Tirta Gangga Water Palace One Day Trip': ['Culture Village', 'Temple'],
  'Boat Rental and Guide Tour to Trunyan Village & Dewi Danu Statue': ['Boat', 'Culture Village'],
  'Tlaga Singha Tropical River Club': ['Cafe'],
  'Dusun Bedugul Asri': ['Cafe'],
  'Lunamoon Kintamani': ['Cafe'],
  'Uju Bali Private Tour Full Day Trip (Kintamani - Penglipuran Village - Ubud)': ['Culture Village', 'Viewpoint'],
  'Kecak & Fire Dance ticket Tanah Lot Bali': ['Temple', 'Performance'],
  'Devdan Show \'Treasure of the Archipelago\'': ['Performance', 'Culture'],
  'Bali Farm House Tickets': ['Farm', 'Cafe'],
  'Uluwatu Bali Sunset Kecak Fire Dance Tour': ['Temple', 'Performance'],
  'Kecak and Fire Dance Performance at Uluwatu Temple Tickets': ['Temple', 'Performance'],
  'Nusa Lembongan & Nusa Penida 3 spots snorkeling with Mangrove & Nusa Lembongan Tour': ['Snorkeling', 'Mangrove', 'Boat'],
  'Snorkeling Tour and Exploring 3 Gili Islands: Gili Trawangan, Gili Meno, & Gili Air': ['Snorkeling', 'Boat'],
  'BX Ice Skating Rink Tickets at Bintaro Jaya Xchange Mall South Tangerang': ['Ice Skating', 'Theme Park'],
};

const ITEM_TRAVELOKA_URL_OVERRIDES = {
  '1746428163011914083': 'https://www.traveloka.com/en-id/hotel/indonesia/grand-tjokro-yogyakarta-443756',
  '1861814233238358723': 'https://www.traveloka.com/en-id/activities/indonesia/product/bali-hidden-waterfalls-day-tour-tukad-cepung--tibumana--goa-rang-reng--tegenungan--dtukad-river-club--foot-massage-4214621182921',
  '1861814094391167683': 'https://www.traveloka.com/en-id/activities/indonesia/product/canyoning-in-gitgit-and-sambangan-with-adventure--spirit-bali-6174228855423',
  '1861814072338554533': 'https://www.traveloka.com/en-id/activities/indonesia/product/bali-rafting-telaga-waja-tour-package-ubud-8518983415436',
  '1861809193688779459': 'https://www.traveloka.com/en-id/activities/indonesia/product/arung-jeram-sobek-ayung-2-jam-2000303034022',
  '1861809046093307557': 'https://www.traveloka.com/en-id/activities/indonesia/product/ayung-river-rafting-by-bali-best-adventure-8651911741581',
  '1861808992467045059': 'https://www.traveloka.com/en-id/activities/indonesia/product/bali-safari-park-international-tourists-2000334014268',
  '1861808950275481253': 'https://www.traveloka.com/en-id/activities/indonesia/product/phinisi-cruise-sailor-dinner-cruise-tickets-7698999194342',
  '1861809546534592165': 'https://www.traveloka.com/en-id/activities/indonesia/product/voucher-sunset-dinner---kampoeng-seafood-jimbaran-5355575576150',
  '1861809521571154627': 'https://www.traveloka.com/en-id/activities/indonesia/product/telaga-waja-rafting-by-bali-best-adventure-9042475132833',
  '1861809419210214083': 'https://www.traveloka.com/en-id/activities/indonesia/product/mount-batur-black-lava-quad-bike-atv-adventure-kintamani-6128767420151',
  '1861809334361541315': 'https://www.traveloka.com/en-id/activities/indonesia/product/bali-sea-walker-underwater-experience-by-bali-best-adventure-4262729537997',
  '1861809097995733699': 'https://www.traveloka.com/en-id/activities/indonesia/product/lovina-dolphin-tour-by-bali-best-adventure-3483706007675',
  '1861808931062423205': 'https://www.traveloka.com/en-id/activities/indonesia/product/bali-watersport-by-dbalinusadua-2000323314124',
};

const ITEM_IMAGE_URL_OVERRIDES = {
  '1861814233238358723': 'https://ik.imagekit.io/tvlk/xpe-asset/AyJ40ZAo1DOyPyKLZ9c3RGQHTP2oT4ZXW+QmPVVkFQiXFSv42UaHGzSmaSzQ8DO5QIbWPZuF+VkYVRk6gh-Vg4ECbfuQRQ4pHjWJ5Rmbtkk=/4214621182921/Bali-Hidden-Waterfalls-Day-Tour-Tukad-Cepung-Tibumana-Goa-Rang-Reng-Tegenungan-D-Tukad-River-Club-Foot-Massage-78519b79-ae97-4dff-ab44-ffc1458acbed.jpeg?tr=q-60,c-at_max,w-1280,h-720&_src=imagekit',
  '1861814128413253285': 'https://ik.imagekit.io/tvlk/xpe-asset/AyJ40ZAo1DOyPyKLZ9c3RGQHTP2oT4ZXW+QmPVVkFQiXFSv42UaHGzSmaSzQ8DO5QIbWPZuF+VkYVRk6gh-Vg4ECbfuQRQ4pHjWJ5Rmbtkk=/7899286900113/Bali-3-4-Hours-Dirt-Bike-Adventure-in-Back-Lava-and-Black-Sand-Mount-Batur-Kintamani-Bali-d3445472-f62c-4ea8-a162-6b6cf4cd9202.jpeg?tr=q-60,c-at_max,w-1280,h-720&_src=imagekit',
  '1861814094391167683': 'https://ik.imagekit.io/tvlk/xpe-asset/AyJ40ZAo1DOyPyKLZ9c3RGQHTP2oT4ZXW+QmPVVkFQiXFSv42UaHGzSmaSzQ8DO5QIbWPZuF+VkYVRk6gh-Vg4ECbfuQRQ4pHjWJ5Rmbtkk=/6174228855423/Canyoning-di-Gitgit-dan-Sambangan-Bersama-Adventure-Spirit-Bali-96a4c200-a7a7-4d9a-a4be-9f5db2c2a3cc.jpeg?tr=q-60,c-at_max,w-1280,h-720&_src=imagekit',
  '1861814084897349285': 'https://ik.imagekit.io/tvlk/xpe-asset/AyJ40ZAo1DOyPyKLZ9c3RGQHTP2oT4ZXW+QmPVVkFQiXFSv42UaHGzSmaSzQ8DO5QIbWPZuF+VkYVRk6gh-Vg4ECbfuQRQ4pHjWJ5Rmbtkk=/6577345286426/Nusa-Penida-Tour-Barat-dari-Arvi-Tour-Jelajahi-Surga-Tropis-ccfe5fd2-6af9-4e37-8cd1-9a2452f72498.jpeg?tr=q-60,c-at_max,w-1280,h-720&_src=imagekit',
  '1861814072338554533': 'https://ik.imagekit.io/tvlk/xpe-asset/AyJ40ZAo1DOyPyKLZ9c3RGQHTP2oT4ZXW+QmPVVkFQiXFSv42UaHGzSmaSzQ8DO5QIbWPZuF+VkYVRk6gh-Vg4ECbfuQRQ4pHjWJ5Rmbtkk=/8518983415436/Paket-Tour-Bali-Rafting-Telaga-Waja---Ubud-7584c3b0-f489-4c7b-abf0-7c3bc326697c.jpeg?tr=q-60,c-at_max,w-1280,h-720&_src=imagekit',
};

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readTextIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
}

function parseNumber(text) {
  return Number(String(text).replace(/[^\d.]/g, ''));
}

function parseCard(card, extractedAt) {
  const lines = card.lines;
  const typeLabel = lines[0] ?? '';
  const title = lines[1] ?? '';
  const priceIndex = lines.findIndex((line, index) => index > 1 && line.startsWith('Rp '));
  const detailLines = (priceIndex === -1 ? lines.slice(2) : lines.slice(2, priceIndex)).filter(Boolean);
  const priceText = priceIndex === -1 ? '' : lines[priceIndex];
  const priceQualifier = priceIndex === -1 ? '' : lines.slice(priceIndex + 1).join(' ');
  const ratingValueLine = detailLines.find((line) => /^\d+(\.\d+)?$/.test(line));
  const reviewCountLine = detailLines.find((line) => /^\(\d[\d.,]*\)$/.test(line));
  const noRating = detailLines.includes('No ratings yet');
  const rawLocation =
    detailLines.find((line) => {
      if (line === '|' || line === 'No ratings yet' || /^\/ ?10$/.test(line) || /^\(\d[\d.,]*\)$/.test(line) || /^\d+(\.\d+)?$/.test(line)) {
        return false;
      }
      return true;
    }) ?? '';

  return {
    id: card.id,
    sourceId: card.testId,
    sourceDate: extractedAt.slice(0, 10),
    typeLabel,
    typeKey: typeLabel === 'Hotels' ? 'hotel' : 'things-to-do',
    title,
    rawLocation,
    ratingValue: noRating || !ratingValueLine ? null : parseNumber(ratingValueLine),
    reviewCount: reviewCountLine ? parseNumber(reviewCountLine) : null,
    ratingText: noRating ? 'No ratings yet' : [ratingValueLine, '/ 10', reviewCountLine].filter(Boolean).join(' '),
    noRating,
    priceText,
    priceValue: priceText ? parseNumber(priceText) : null,
    priceQualifier,
    imageUrl: card.imageUrl,
    travelokaUrl: card.travelokaUrl,
  };
}

function mergeLocationMeta(item) {
  return {
    ...(LOCATION_OVERRIDES[item.rawLocation] ?? {
      regionKey: 'outside_bali',
      regionLabel: 'Outside Bali · Unknown',
      kecamatan: '',
      kelurahan: '',
      island: '',
      city: item.rawLocation || '',
    }),
    ...(ITEM_LOCATION_OVERRIDES[item.title] ?? {}),
  };
}

function addCategory(list, value) {
  if (value && !list.includes(value)) {
    list.push(value);
  }
}

function inferCategories(item) {
  if (ITEM_CATEGORY_OVERRIDES[item.title]) {
    return ITEM_CATEGORY_OVERRIDES[item.title];
  }

  if (item.typeKey === 'hotel') {
    return ['Hotel'];
  }

  const text = `${item.title} ${item.rawLocation}`.toLowerCase();
  const categories = [];

  if (text.includes('snorkel')) addCategory(categories, 'Snorkeling');
  if (text.includes('mangrove')) addCategory(categories, 'Mangrove');
  if (/(canoe|kayak|sampan)/.test(text)) addCategory(categories, 'Kayak');
  if (/(jet ski|jetski)/.test(text)) addCategory(categories, 'Jetski');
  if (/(watersport|water sport|parasailing|ocean walker|sea walker|diving|fly fish)/.test(text)) addCategory(categories, 'Water Sport');
  if (/(utv|buggy)/.test(text)) addCategory(categories, 'UTV');
  if (/(atv|quad bike|dirt bike|motorcycle tour)/.test(text)) addCategory(categories, 'ATV');
  if (/(rafting|tubing)/.test(text)) addCategory(categories, 'Rafting');
  if (/(waterfall|tukad cepung)/.test(text)) addCategory(categories, 'Waterfall');
  if (/(cave|goa|canyon)/.test(text)) addCategory(categories, 'Cave');
  if (/(village|penglipuran|tenganan|weaving house)/.test(text)) addCategory(categories, 'Culture Village');
  if (/(temple|uluwatu|tanah lot|lempuyang)/.test(text)) addCategory(categories, 'Temple');
  if (/(kecak|dance|show|devdan)/.test(text)) addCategory(categories, 'Performance');
  if (/(zoo|bird park|reptile park|safari park)/.test(text)) addCategory(categories, 'Zoo');
  if (text.includes('farm house')) addCategory(categories, 'Farm');
  if (/(timezone|waterbom)/.test(text)) addCategory(categories, 'Theme Park');
  if (/(cruise|phinisi|bounty)/.test(text)) addCategory(categories, 'Cruise');
  if (/(dinner|seafood|river club|coffee|cafe)/.test(text)) addCategory(categories, 'Cafe');
  if (text.includes('swing')) addCategory(categories, 'Swing');
  if (text.includes('dolphin')) addCategory(categories, 'Dolphin');
  if (text.includes('surf')) addCategory(categories, 'Surf');
  if (text.includes('jeep')) addCategory(categories, 'Jeep');
  if (text.includes('boat')) addCategory(categories, 'Boat');
  if (text.includes('island adventure') || text.includes('tour barat') || text.includes('island tour')) addCategory(categories, 'Island Tour');
  if (text.includes('city tour')) addCategory(categories, 'City Tour');
  if (/(hot spring|air hangat)/.test(text)) addCategory(categories, 'Hot Spring');
  if (text.includes('view') || text.includes('sunset') || text.includes('sunrise')) addCategory(categories, 'Viewpoint');

  if (categories.length === 0) {
    addCategory(categories, 'Experience');
  }

  return categories;
}

function buildMapsUrl(item, meta) {
  const queryParts = [
    item.title,
    item.rawLocation,
    meta.kelurahan,
    meta.kecamatan,
    meta.city,
    meta.island,
    'Indonesia',
  ].filter(Boolean);

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryParts.join(', '))}`;
}

function regionSortValue(item) {
  return REGION_ORDER[item.regionKey] ?? 999;
}

function resolveTravelokaUrl(item) {
  return ITEM_TRAVELOKA_URL_OVERRIDES[item.id] ?? item.travelokaUrl;
}

const singleFileSnapshotHtml = readTextIfExists(SINGLEFILE_SNAPSHOT_PATH);
const singleFileCssImageMap = new Map();
const singleFileImageCache = new Map();
const embeddedImageCache = new Map();

for (const match of singleFileSnapshotHtml.matchAll(/--sf-img-(\d+):\s*url\(["']?(data:image\/(?:webp|jpeg|jpg|png|gif);base64,[^"')]+)["']?\)/gi)) {
  singleFileCssImageMap.set(match[1], match[2]);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeImageUrl(url) {
  return typeof url === 'string' ? url.trim().replace(/&amp;/g, '&') : '';
}

function hasUsableImage(url) {
  const value = normalizeImageUrl(url);
  if (!value) return false;
  return !PLACEHOLDER_IMAGE_PATTERNS.some((pattern) => pattern.test(value));
}

function normalizeTitleVariants(title) {
  const variants = new Set([title]);
  variants.add(title.replace(/[’]/g, "'"));
  variants.add(title.replace(/'/g, '’'));
  variants.add(title.replace(/[–]/g, '-'));
  variants.add(title.replace(/-/g, '–'));
  return [...variants].filter(Boolean);
}

function extractSingleFileImage(title) {
  if (!singleFileSnapshotHtml) return null;
  if (singleFileImageCache.has(title)) return singleFileImageCache.get(title);

  let result = null;
  for (const variant of normalizeTitleVariants(title)) {
    const idx = singleFileSnapshotHtml.indexOf(variant);
    if (idx === -1) continue;

    const cardStart = singleFileSnapshotHtml.lastIndexOf('data-testid=card-', idx);
    const nextCardStart = singleFileSnapshotHtml.indexOf('data-testid=card-', idx + variant.length);
    const chunkEnd = nextCardStart === -1 ? Math.min(singleFileSnapshotHtml.length, idx + 90000) : nextCardStart;
    const chunk = cardStart === -1
      ? singleFileSnapshotHtml.slice(Math.max(0, idx - 22000), idx + 22000)
      : singleFileSnapshotHtml.slice(cardStart, chunkEnd);

    const directMatches = [...chunk.matchAll(/src=(?:"|')?(data:image\/(?:webp|jpeg|jpg|png|gif);base64,[A-Za-z0-9+/=]+)(?:"|')?/gi)]
      .map((match) => match[1])
      .filter((value) => value.length > 5000);
    if (directMatches.length > 0) {
      result = directMatches[directMatches.length - 1];
      break;
    }

    const bgMatches = [...chunk.matchAll(/background-image:\s*url\((data:image\/(?:webp|jpeg|jpg|png|gif);base64,[A-Za-z0-9+/=]+)\)/gi)]
      .map((match) => match[1])
      .filter((value) => value.length > 5000);
    if (bgMatches.length > 0) {
      result = bgMatches[bgMatches.length - 1];
      break;
    }

    const varMatches = [...chunk.matchAll(/var\(--sf-img-(\d+)\)/g)].map((match) => match[1]).reverse();
    for (const varId of varMatches) {
      const value = singleFileCssImageMap.get(varId);
      if (value && value.length > 5000) {
        result = value;
        break;
      }
    }
    if (result) break;
  }

  singleFileImageCache.set(title, result);
  return result;
}

function decodeDataUrl(dataUrl) {
  const match = String(dataUrl).match(/^data:([^;,]+)(?:;charset=[^;,]+)?;base64,(.+)$/i);
  if (!match) return null;
  return {
    mime: match[1].toLowerCase(),
    buffer: Buffer.from(match[2], 'base64'),
  };
}

function coerceImageMime(value) {
  if (!value) return 'image/jpeg';
  const mime = String(value).split(';')[0].trim().toLowerCase();
  return mime.startsWith('image/') ? mime : 'image/jpeg';
}

function maybeTransformRemoteImageUrl(rawUrl) {
  const url = normalizeImageUrl(rawUrl);
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (parsed.host === 'ik.imagekit.io') {
      parsed.searchParams.set('tr', `w-${THUMB_WIDTH * 2},h-${THUMB_HEIGHT * 2},q-60`);
      parsed.searchParams.set('_src', 'imagekit');
      return parsed.toString();
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

async function fetchRemoteImageBuffer(rawUrl) {
  const cacheKey = `remote:${rawUrl}`;
  if (embeddedImageCache.has(cacheKey)) return embeddedImageCache.get(cacheKey);

  const url = maybeTransformRemoteImageUrl(rawUrl);
  if (!url) return null;

  let result = null;
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': USER_AGENT,
        accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        referer: 'https://www.traveloka.com/',
        'accept-language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (response.ok) {
      const contentType = coerceImageMime(response.headers.get('content-type'));
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > 0) {
        result = { buffer, mime: contentType };
      }
    }
  } catch {}

  embeddedImageCache.set(cacheKey, result);
  return result;
}

function rasterizeThumbnailBuffer(buffer) {
  const command = spawnSync(
    'magick',
    [
      '-',
      '-auto-orient',
      '-colorspace',
      'sRGB',
      '-thumbnail',
      `${THUMB_WIDTH}x${THUMB_HEIGHT}^`,
      '-gravity',
      'center',
      '-extent',
      `${THUMB_WIDTH}x${THUMB_HEIGHT}`,
      '-strip',
      '-quality',
      '72',
      'jpg:-',
    ],
    {
      input: buffer,
      encoding: null,
      maxBuffer: 32 * 1024 * 1024,
    },
  );

  if (command.status !== 0 || !command.stdout || command.stdout.length === 0) {
    return null;
  }

  return command.stdout;
}

function toDataUrl(buffer, mime) {
  return `data:${mime};base64,${buffer.toString('base64')}`;
}

function buildPlaceholderImage(title, typeLabel) {
  const initials = (title || typeLabel || 'Trip')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'TP';

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}" viewBox="0 0 ${THUMB_WIDTH} ${THUMB_HEIGHT}">`,
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">',
    '<stop offset="0%" stop-color="#d5c7b4"/><stop offset="100%" stop-color="#efe3d3"/>',
    '</linearGradient></defs>',
    `<rect width="${THUMB_WIDTH}" height="${THUMB_HEIGHT}" rx="18" fill="url(#g)"/>`,
    `<text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="46" font-weight="700" fill="#5a4c3f">${initials}</text>`,
    '</svg>',
  ].join('');
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function fetchFallbackImage(url) {
  if (!url) return null;
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': USER_AGENT,
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
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
      const value = normalizeImageUrl(match[1].replace(/\\\//g, '/'));
      if (!hasUsableImage(value)) continue;
      try {
        return new URL(value, response.url).toString();
      } catch {
        return value;
      }
    }
  } catch {}

  return null;
}

async function buildEmbeddedThumbnail(rawImage) {
  const cacheKey = `embedded:${rawImage}`;
  if (embeddedImageCache.has(cacheKey)) return embeddedImageCache.get(cacheKey);

  let source = null;
  if (String(rawImage).startsWith('data:image/')) {
    source = decodeDataUrl(rawImage);
  } else {
    source = await fetchRemoteImageBuffer(rawImage);
  }
  if (!source?.buffer) {
    embeddedImageCache.set(cacheKey, null);
    return null;
  }

  const jpgBuffer = rasterizeThumbnailBuffer(source.buffer);
  const result = jpgBuffer ? toDataUrl(jpgBuffer, 'image/jpeg') : null;
  embeddedImageCache.set(cacheKey, result);
  return result;
}

async function resolveImageAsset(item, travelokaUrl) {
  if (hasUsableImage(item.imageUrl)) {
    const embedded = await buildEmbeddedThumbnail(item.imageUrl);
    if (embedded) {
      return { imageUrl: embedded, imageSourceKind: 'live' };
    }
    await sleep(FETCH_DELAY_MS);
  }

  const singleFileImage = extractSingleFileImage(item.title);
  if (singleFileImage) {
    const embedded = await buildEmbeddedThumbnail(singleFileImage);
    if (embedded) {
      return { imageUrl: embedded, imageSourceKind: 'htm_snapshot' };
    }
  }

  const directOverrideImage = ITEM_IMAGE_URL_OVERRIDES[item.id];
  if (hasUsableImage(directOverrideImage)) {
    const embedded = await buildEmbeddedThumbnail(directOverrideImage);
    if (embedded) {
      return { imageUrl: embedded, imageSourceKind: 'traveloka_meta' };
    }
    await sleep(FETCH_DELAY_MS);
  }

  const candidateUrls = Array.from(new Set([travelokaUrl, item.travelokaUrl].filter(Boolean)));
  for (const candidateUrl of candidateUrls) {
    const fallbackImage = await fetchFallbackImage(candidateUrl);
    if (hasUsableImage(fallbackImage)) {
      const embedded = await buildEmbeddedThumbnail(fallbackImage);
      if (embedded) {
        return { imageUrl: embedded, imageSourceKind: 'traveloka_meta' };
      }
    }
    await sleep(FETCH_DELAY_MS);
  }

  return { imageUrl: buildPlaceholderImage(item.title, item.typeLabel), imageSourceKind: 'placeholder' };
}

async function buildEnrichedRow(item) {
  const meta = mergeLocationMeta(item);
  const categories = inferCategories(item);
  const travelokaUrl = resolveTravelokaUrl(item);
  const imageAsset = await resolveImageAsset(item, travelokaUrl);
  return {
    ...item,
    ...meta,
    imageUrl: imageAsset.imageUrl,
    imageSourceKind: imageAsset.imageSourceKind,
    travelokaUrl,
    mapsUrl: buildMapsUrl(item, meta),
    categories,
    primaryCategory: categories[0] ?? 'Experience',
    travelokaUrlLabel: 'Traveloka',
    mapsUrlLabel: 'Google Maps',
    sortRegionOrder: regionSortValue(meta),
    sortLocationKey: [
      String(regionSortValue(meta)).padStart(2, '0'),
      meta.city,
      meta.kecamatan,
      meta.kelurahan,
      item.rawLocation,
      item.title,
    ]
      .filter(Boolean)
      .join(' | ')
      .toLowerCase(),
    sortCategoryKey: [categories[0] ?? '', item.title].join(' | ').toLowerCase(),
    sortListNameKey: item.title.toLowerCase(),
  };
}

function stringifyForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function buildHtml(items, snapshot) {
  const styles = fs.readFileSync(STYLES_PATH, 'utf8');
  const app = fs.readFileSync(APP_PATH, 'utf8');
  const html2canvas = fs.readFileSync(HTML2CANVAS_PATH, 'utf8');
  const jspdf = fs.readFileSync(JSPDF_PATH, 'utf8');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Trip Curated Planner</title>
    <meta name="description" content="Curated offline planner rebuilt from a live Traveloka saved list snapshot.">
    <link rel="icon" href="data:,">
    <style id="planner-styles">
${styles}
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script id="trip-data" type="application/json">${stringifyForHtml(items)}</script>
    <script id="trip-meta" type="application/json">${stringifyForHtml({
      extractedAt: snapshot.extractedAt,
      sourceUrl: snapshot.sourceUrl,
      count: items.length,
    })}</script>
    <script>
${html2canvas}
    </script>
    <script>
${jspdf}
    </script>
    <script>
${app}
    </script>
  </body>
</html>
`;
}

const snapshot = readJson(SNAPSHOT_PATH);
const normalized = snapshot.rows.map((row) => parseCard(row, snapshot.extractedAt));
const enriched = [];
for (const item of normalized) {
  enriched.push(await buildEnrichedRow(item));
}

const metadata = enriched.map((item) => ({
  id: item.id,
  regionKey: item.regionKey,
  regionLabel: item.regionLabel,
  kecamatan: item.kecamatan,
  kelurahan: item.kelurahan,
  island: item.island,
  city: item.city,
  mapsUrl: item.mapsUrl,
  categories: item.categories,
  primaryCategory: item.primaryCategory,
}));

fs.writeFileSync(METADATA_PATH, JSON.stringify(metadata, null, 2));
fs.writeFileSync(ITEMS_PATH, JSON.stringify(enriched, null, 2));
fs.writeFileSync(HTML_PATH, buildHtml(enriched, snapshot));

console.log(`Wrote ${metadata.length} metadata rows to ${METADATA_PATH}`);
console.log(`Wrote ${enriched.length} live planner rows to ${ITEMS_PATH}`);
console.log(`Wrote standalone planner HTML to ${HTML_PATH}`);
