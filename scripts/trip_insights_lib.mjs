const CATEGORY_PROFILES = {
  Hotel: { mobility: 84, view: 58, beauty: 63, experience: 70, walkDistance: '50–250 m', walkTime: '2–8 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter straight to the property', selfGuided: 'DIY arrival is straightforward unless the road is narrow.', knee: 'Usually workable for weak knees unless the room access is stair-only.' },
  'City Tour': { mobility: 72, view: 70, beauty: 66, experience: 74, walkDistance: '100–600 m', walkTime: '5–15 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter between stops', selfGuided: 'DIY is possible if you are comfortable arranging multiple stops.', knee: 'Usually manageable because walking is split into short segments.' },
  Boat: { mobility: 66, view: 84, beauty: 80, experience: 78, walkDistance: '100–500 m', walkTime: '5–12 min', steepness: 'Low', stairs: 'Low to Medium', transport: 'Car or scooter to the dock, then boat boarding', selfGuided: 'DIY is possible if tickets and harbor timing are clear.', knee: 'Walking is light, but balance while boarding matters.' },
  'Island Tour': { mobility: 52, view: 90, beauty: 88, experience: 84, walkDistance: '300 m–1.2 km', walkTime: '10–30 min', steepness: 'Medium to High', stairs: 'Medium to High', transport: 'Boat transfer plus car on the island', selfGuided: 'DIY is possible, but drivers or packaged transport reduce friction.', knee: 'Not ideal if your knees dislike stairs, cliffs, or rough island roads.' },
  Waterfall: { mobility: 38, view: 86, beauty: 88, experience: 81, walkDistance: '400 m–1.4 km', walkTime: '15–35 min', steepness: 'High', stairs: 'High', transport: 'Car or scooter to the trailhead, then a sustained walk', selfGuided: 'DIY is common, but shoes and dry weather matter.', knee: 'Weak knees and low leg strength are a real constraint on return climbs.' },
  Temple: { mobility: 68, view: 80, beauty: 82, experience: 77, walkDistance: '200–700 m', walkTime: '5–18 min', steepness: 'Low to Medium', stairs: 'Medium', transport: 'Car or scooter to the parking zone', selfGuided: 'DIY is easy; timing matters more than logistics.', knee: 'Usually manageable, but sunset venues can involve extra steps and crowd pressure.' },
  Rafting: { mobility: 44, view: 72, beauty: 68, experience: 84, walkDistance: '300–900 m', walkTime: '10–25 min', steepness: 'Medium to High', stairs: 'Medium to High', transport: 'Car or shuttle to the operator, then stairs to the river', selfGuided: 'Operator-led access is the norm.', knee: 'River access stairs are the main issue; vibration and wet footing add extra load.' },
  ATV: { mobility: 56, view: 70, beauty: 64, experience: 83, walkDistance: '80–300 m', walkTime: '3–10 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter straight to the operator base', selfGuided: 'DIY arrival is easy; the activity itself stays guided.', knee: 'Walking is light, but vibration and body impact can still tire weak joints.' },
  Jetski: { mobility: 74, view: 66, beauty: 60, experience: 78, walkDistance: '50–250 m', walkTime: '2–8 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter to the beach operator', selfGuided: 'DIY is easy if you know the operator beach.', knee: 'Good for low walking, but balance and wave impact still matter.' },
  Cave: { mobility: 34, view: 74, beauty: 78, experience: 77, walkDistance: '300 m–1.2 km', walkTime: '12–30 min', steepness: 'Medium to High', stairs: 'Medium to High', transport: 'Car or scooter to the entry point, then uneven walking', selfGuided: 'DIY is possible at famous sites; canyoning-style trips stay guided.', knee: 'Poor fit for weak knees when the route is wet, rocky, or stair-heavy.' },
  Mangrove: { mobility: 78, view: 76, beauty: 74, experience: 72, walkDistance: '80–300 m', walkTime: '3–10 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter to the launch point', selfGuided: 'DIY is possible if rentals are clearly posted.', knee: 'Usually light on walking; getting in and out of the canoe is the main motion.' },
  'Culture Village': { mobility: 80, view: 70, beauty: 74, experience: 73, walkDistance: '200–900 m', walkTime: '8–25 min', steepness: 'Low', stairs: 'Low to Medium', transport: 'Car or scooter to the village gate', selfGuided: 'DIY is easy, though a local guide can add context.', knee: 'Generally reasonable unless the village lanes or terraces are uneven.' },
  'Hot Spring': { mobility: 78, view: 60, beauty: 66, experience: 72, walkDistance: '100–400 m', walkTime: '4–12 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter to the entry area', selfGuided: 'DIY is straightforward.', knee: 'Often gentle, though wet surfaces can still be slippery.' },
  Surf: { mobility: 64, view: 72, beauty: 66, experience: 78, walkDistance: '80–300 m', walkTime: '3–10 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter to the beach school', selfGuided: 'DIY arrival is easy; lesson logistics usually stay operator-led.', knee: 'Walking is light, but popping up and balancing is physically demanding.' },
  Swing: { mobility: 58, view: 80, beauty: 78, experience: 72, walkDistance: '150–400 m', walkTime: '5–12 min', steepness: 'Low to Medium', stairs: 'Low to Medium', transport: 'Car or scooter to the swing complex', selfGuided: 'DIY is easy.', knee: 'Mostly manageable, though ladders and harness positions can feel awkward.' },
  Cafe: { mobility: 84, view: 76, beauty: 78, experience: 70, walkDistance: '50–250 m', walkTime: '2–8 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter directly to the venue', selfGuided: 'DIY is easy.', knee: 'Usually one of the easier categories in the list.' },
  Zoo: { mobility: 86, view: 62, beauty: 68, experience: 77, walkDistance: '700 m–2.5 km optional', walkTime: '20–60 min total', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter to the gate', selfGuided: 'DIY is easy; pace is flexible inside.', knee: 'Walking can add up over time, but the route is usually flat enough to pace yourself.' },
  'Water Sport': { mobility: 76, view: 64, beauty: 58, experience: 77, walkDistance: '60–250 m', walkTime: '3–8 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter to the watersport beach', selfGuided: 'DIY arrival is easy; activity handling stays operator-led.', knee: 'Low walking burden, but transfers to pontoons and gear handling still matter.' },
  Cruise: { mobility: 78, view: 78, beauty: 74, experience: 75, walkDistance: '80–350 m', walkTime: '3–10 min', steepness: 'Low', stairs: 'Low to Medium', transport: 'Car or shuttle to the harbor', selfGuided: 'DIY is possible if the departure point is clear.', knee: 'Generally easier than waterfall or rafting access, but boarding can still be awkward.' },
  Dolphin: { mobility: 72, view: 88, beauty: 82, experience: 85, walkDistance: '80–250 m', walkTime: '3–8 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter to the beach launch area', selfGuided: 'DIY is possible, though a pre-booked operator reduces early-morning hassle.', knee: 'Walking is light; stepping into a small boat is the real challenge.' },
  Performance: { mobility: 82, view: 70, beauty: 68, experience: 76, walkDistance: '100–450 m', walkTime: '4–12 min', steepness: 'Low', stairs: 'Low to Medium', transport: 'Car or scooter to the venue', selfGuided: 'DIY is easy; arrive early for seat choice.', knee: 'Usually manageable unless seating access is stepped and crowded.' },
  'Theme Park': { mobility: 92, view: 56, beauty: 54, experience: 80, walkDistance: '300 m–1.8 km optional', walkTime: '10–45 min total', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter to the mall or park entrance', selfGuided: 'DIY is easy.', knee: 'Among the easier categories for walking strain, with plenty of stop points.' },
  Farm: { mobility: 86, view: 66, beauty: 70, experience: 69, walkDistance: '150–600 m', walkTime: '5–18 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter to the site', selfGuided: 'DIY is easy.', knee: 'Usually manageable unless the grounds are wet or muddy.' },
  Jeep: { mobility: 68, view: 84, beauty: 74, experience: 82, walkDistance: '50–220 m', walkTime: '2–7 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter to the jeep base, then vehicle ride', selfGuided: 'DIY arrival is easy; the route itself stays guided.', knee: 'Little walking, but the ride is bumpy and can stress weak backs or knees.' },
  Snorkeling: { mobility: 64, view: 92, beauty: 90, experience: 88, walkDistance: '80–350 m', walkTime: '4–10 min', steepness: 'Low', stairs: 'Low to Medium', transport: 'Car or scooter to the dock, then boat transfer', selfGuided: 'DIY is possible if boats and gear rentals are clear.', knee: 'Walking is light, but boat ladders and sea conditions still require balance.' },
  UTV: { mobility: 58, view: 68, beauty: 62, experience: 81, walkDistance: '80–250 m', walkTime: '3–8 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter to the operator base', selfGuided: 'DIY arrival is easy; the ride stays guided.', knee: 'Walking is easy, but the ride is still jolty.' },
  'Ice Skating': { mobility: 94, view: 48, beauty: 50, experience: 72, walkDistance: '80–300 m', walkTime: '3–10 min', steepness: 'Low', stairs: 'Low', transport: 'Car or scooter to the mall', selfGuided: 'DIY is easy.', knee: 'Access is easy, but the activity itself is not knee-friendly.' },
};

const COMPARISON_CLUSTERS = {
  Hotel: 'stay',
  'Ice Skating': 'family-indoor',
  'Theme Park': 'family-indoor',
  Zoo: 'family-outdoor',
  Farm: 'family-outdoor',
  Cafe: 'soft-scenic',
  'Hot Spring': 'soft-scenic',
  Temple: 'culture-scenic',
  'Culture Village': 'culture-scenic',
  Performance: 'culture-scenic',
  Waterfall: 'scenic-walk',
  Cave: 'scenic-walk',
  Swing: 'scenic-walk',
  Boat: 'water-scenic',
  'Island Tour': 'water-scenic',
  Dolphin: 'water-scenic',
  Snorkeling: 'water-scenic',
  Cruise: 'water-scenic',
  Mangrove: 'water-soft',
  Jetski: 'water-ride',
  'Water Sport': 'water-ride',
  Surf: 'water-ride',
  Rafting: 'adventure-river',
  ATV: 'adventure-ride',
  UTV: 'adventure-ride',
  Jeep: 'adventure-ride',
  'City Tour': 'tour-general',
};

const CLUSTER_LABELS = {
  stay: 'saved-list stays',
  'family-indoor': 'saved-list indoor family picks',
  'family-outdoor': 'saved-list family wildlife and park picks',
  'soft-scenic': 'saved-list easy scenic stops',
  'culture-scenic': 'saved-list culture and viewpoint stops',
  'scenic-walk': 'saved-list walk-heavy scenic stops',
  'water-scenic': 'saved-list scenic water trips',
  'water-soft': 'saved-list gentle water-edge trips',
  'water-ride': 'saved-list beach and watersport rides',
  'adventure-river': 'saved-list river adventures',
  'adventure-ride': 'saved-list ride-based adventures',
  'tour-general': 'saved-list general tours',
};

const SUPER_CLUSTERS = {
  stay: 'stay',
  'family-indoor': 'family',
  'family-outdoor': 'family',
  'soft-scenic': 'scenic',
  'culture-scenic': 'scenic',
  'scenic-walk': 'scenic',
  'water-scenic': 'water',
  'water-soft': 'water',
  'water-ride': 'water',
  'adventure-river': 'adventure',
  'adventure-ride': 'adventure',
  'tour-general': 'tour',
};

const KEYWORD_RULES = [
  {
    pattern: /banyumala|tukad cepung|hidden canyon|goa rang reng|gitgit|sambangan/i,
    view: 6,
    beauty: 8,
    mobility: -18,
    walkDistance: '500 m–1.2 km',
    walkTime: '18–35 min',
    steepness: 'High',
    stairs: 'High',
    transport: 'Car or scooter to the trailhead; the final section is on foot.',
    knee: 'The visual payoff is strong, but the climb back is a poor match for weak knees.',
  },
  {
    pattern: /nusa penida|lembongan|gili|kalong island|labuan bajo|komodo/i,
    view: 10,
    beauty: 10,
    mobility: -10,
    walkDistance: '100 m–900 m',
    walkTime: '5–25 min',
    transport: 'Boat transfer is part of the logistics, then short car or dock walks.',
    selfGuided: 'DIY works only if you are comfortable coordinating boats and return timing.',
    knee: 'Boarding steps and rough island surfaces matter more than pure distance.',
  },
  {
    pattern: /lovina dolphin/i,
    view: 10,
    experience: 7,
    mobility: -2,
    walkDistance: '80–200 m',
    walkTime: '3–8 min',
    transport: 'Car or scooter to the beach, then a small boat launch.',
    knee: 'Walking is light; the main challenge is stepping into the boat early in the morning.',
  },
  {
    pattern: /uluwatu|tanah lot|kecak/i,
    view: 8,
    beauty: 8,
    mobility: -2,
    walkDistance: '200–700 m',
    walkTime: '5–18 min',
    stairs: 'Medium',
    knee: 'Usually manageable, though sunset crowds reduce flexibility if you need to stop often.',
  },
  {
    pattern: /batur|kintamani|lahangan sweet|lempuyang|tirta gangga/i,
    view: 9,
    beauty: 7,
    mobility: -4,
  },
  {
    pattern: /telaga waja/i,
    mobility: -14,
    experience: 4,
    walkDistance: '300 m–700 m',
    walkTime: '10–20 min',
    stairs: 'High',
    steepness: 'Medium to High',
    knee: 'The rafting itself is fun, but river-entry stairs are the main knee tradeoff.',
  },
  {
    pattern: /ayung|pakerisan|river tubing/i,
    mobility: -12,
    walkDistance: '300 m–700 m',
    walkTime: '10–20 min',
    stairs: 'Medium to High',
    steepness: 'Medium',
  },
  {
    pattern: /jeep|black lava|dirt bike|quad bike|utv|buggy/i,
    experience: 6,
    mobility: -6,
    view: 4,
    transport: 'Car or scooter to the base, then the route is vehicle-led.',
    knee: 'Very little walking, but the ride itself is bumpy.',
  },
  {
    pattern: /waterbom|timezone|ice skating/i,
    mobility: 8,
    experience: 4,
    walkDistance: '80 m–800 m',
    walkTime: '3–15 min',
  },
  {
    pattern: /zoo|bird park|reptile park|farm house/i,
    mobility: 4,
    experience: 4,
    walkDistance: '700 m–2 km optional',
    walkTime: '20–50 min total',
    knee: 'Walking adds up over time, but it is usually flat enough to take it slowly.',
  },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function titleText(item) {
  return `${item.title || ''} ${item.rawLocation || ''} ${item.primaryCategory || ''}`.trim();
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function cleanLines(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function tokenSimilarity(left, right) {
  const leftTokens = normalize(left).split(/\s+/).filter(Boolean);
  const rightTokens = new Set(normalize(right).split(/\s+/).filter(Boolean));
  if (!leftTokens.length || !rightTokens.size) return 0;
  const overlap = leftTokens.filter((token) => rightTokens.has(token)).length;
  return overlap / Math.max(leftTokens.length, rightTokens.size);
}

function parseBodySample(sample) {
  const lines = cleanLines(sample);
  let name = '';
  for (let index = 0; index < Math.min(lines.length - 2, 18); index += 1) {
    if (/^[0-5]\.\d$/.test(lines[index + 1]) && /^\([\d.,]+\)$/.test(lines[index + 2])) {
      name = lines[index];
      break;
    }
  }

  const ratingMatch = String(sample || '').match(/\n([0-5]\.\d)\n\(([\d.,]+)\)\n/);
  const addressLine = lines.find((line) => /(^Jl\.|^Jalan|Kabupaten|Regency|Kec\.|No\.)/.test(line)) || '';

  return {
    name,
    rating: ratingMatch ? Number(ratingMatch[1]) : null,
    reviewCount: ratingMatch ? Number(ratingMatch[2].replace(/\./g, '').replace(/,/g, '')) : null,
    address: addressLine,
  };
}

function formatCount(value) {
  return value == null ? '' : new Intl.NumberFormat('en-US').format(value);
}

function uniqueList(values) {
  return [...new Set(values.filter(Boolean))];
}

function qualitySignal(item) {
  const googleRatingScore = item.googleRating == null ? null : clamp((item.googleRating / 5) * 100, 0, 100);
  const googleVolumeBoost = item.googleReviewCount == null ? 0 : clamp(Math.log10(item.googleReviewCount + 1) * 9, 0, 20);
  const travelokaRatingScore = item.ratingValue == null ? null : clamp((item.ratingValue / 10) * 100, 0, 100);
  const googleSignal = googleRatingScore == null ? null : googleRatingScore + googleVolumeBoost;
  if (googleSignal != null && travelokaRatingScore != null) {
    return clamp((googleSignal * 0.58) + (travelokaRatingScore * 0.42), 20, 100);
  }
  if (googleSignal != null) return clamp(googleSignal, 20, 100);
  if (travelokaRatingScore != null) return clamp(travelokaRatingScore, 20, 100);
  return 62;
}

function computeEvidenceConfidence(item) {
  if (item.googlePlaceMatchMode === 'exact' && (item.googleReviewCount || 0) >= 250) return 'high';
  if (item.googlePlaceMatchMode !== 'area' && (item.googleReviewCount || 0) >= 30) return 'medium';
  if (item.ratingValue != null || item.googleReviewCount != null) return 'medium';
  return 'low';
}

function buildGoogleFields(item, googleEntry) {
  const bodySample = googleEntry?.googleBodySample || '';
  const bodyPlace = parseBodySample(bodySample);
  const bodySimilarity = bodyPlace.name ? tokenSimilarity(item.title, bodyPlace.name) : 0;

  let googlePlaceName = googleEntry?.googlePlaceName || item.rawLocation || item.title;
  let googlePlaceMatchMode = ['exact', 'heuristic', 'area'].includes(googleEntry?.googlePlaceMatchMode)
    ? googleEntry.googlePlaceMatchMode
    : 'area';
  let googleRating = Number.isFinite(googleEntry?.googleRating) ? googleEntry.googleRating : null;
  let googleReviewCount = Number.isFinite(googleEntry?.googleReviewCount) ? googleEntry.googleReviewCount : null;
  let googleAddress = googleEntry?.googleAddress || '';

  if (bodySimilarity >= 0.34 && bodyPlace.name) {
    googlePlaceName = bodyPlace.name;
    if (bodyPlace.rating != null) googleRating = bodyPlace.rating;
    if (bodyPlace.reviewCount != null) googleReviewCount = bodyPlace.reviewCount;
    if (bodyPlace.address) googleAddress = bodyPlace.address;
    if (bodySimilarity >= 0.74) {
      googlePlaceMatchMode = 'exact';
    } else if (bodySimilarity >= 0.48) {
      googlePlaceMatchMode = 'heuristic';
    }
  }

  return {
    googlePlaceUrl: googleEntry?.googlePlaceUrl || item.mapsUrl,
    googlePlaceName,
    googlePlaceMatchMode,
    googleRating,
    googleReviewCount,
    googleReviewSnapshotDate: googleEntry?.googleReviewSnapshotDate || item.sourceDate || '',
    googlePrimaryType: googleEntry?.googlePrimaryType || '',
    googleAddress,
    googleAbout: googleEntry?.googleAbout || '',
    googleAccessFlags: Array.isArray(googleEntry?.googleAccessFlags) ? uniqueList(googleEntry.googleAccessFlags) : [],
    googleReviewQuotes: Array.isArray(googleEntry?.googleReviewQuotes) ? googleEntry.googleReviewQuotes.slice(0, 3) : [],
    googleSearchCandidates: Array.isArray(googleEntry?.googleSearchCandidates) ? googleEntry.googleSearchCandidates.slice(0, 3) : [],
    googleBodySample: bodySample,
    googleSourceKind: googleEntry?.sourceKind || 'cache_fallback',
    unresolvedReason: googleEntry?.unresolvedReason || '',
  };
}

function buildAccessProfile(item) {
  const profile = CATEGORY_PROFILES[item.primaryCategory] || CATEGORY_PROFILES.Hotel;
  const access = {
    accessMode: item.typeKey === 'hotel' ? 'Stay arrival' : item.primaryCategory,
    selfGuidedAccess: profile.selfGuided,
    transportAccess: profile.transport,
    walkDistanceText: profile.walkDistance,
    walkTimeText: profile.walkTime,
    steepnessLevel: profile.steepness,
    stairsLevel: profile.stairs,
    kneeNote: profile.knee,
    mobilityBase: profile.mobility,
    viewBase: profile.view,
    beautyBase: profile.beauty,
    experienceBase: profile.experience,
  };

  KEYWORD_RULES.forEach((rule) => {
    if (!rule.pattern.test(titleText(item))) return;
    access.mobilityBase += rule.mobility || 0;
    access.viewBase += rule.view || 0;
    access.beautyBase += rule.beauty || 0;
    access.experienceBase += rule.experience || 0;
    if (rule.walkDistance) access.walkDistanceText = rule.walkDistance;
    if (rule.walkTime) access.walkTimeText = rule.walkTime;
    if (rule.steepness) access.steepnessLevel = rule.steepness;
    if (rule.stairs) access.stairsLevel = rule.stairs;
    if (rule.transport) access.transportAccess = rule.transport;
    if (rule.selfGuided) access.selfGuidedAccess = rule.selfGuided;
    if (rule.knee) access.kneeNote = rule.knee;
  });

  if (item.googleAccessFlags.some((flag) => /wheelchair accessible/i.test(flag))) {
    access.mobilityBase += 10;
  }
  if (item.googleAccessFlags.some((flag) => /no wheelchair accessible/i.test(flag))) {
    access.mobilityBase -= 8;
  }

  if (item.googlePlaceMatchMode === 'area') {
    access.mobilityBase -= 2;
  }

  return access;
}

function buildCrowdSummary(item) {
  const sourceText = `${item.googleReviewQuotes.join(' ')} ${item.googleAbout} ${item.googleBodySample}`.toLowerCase();
  const positives = [];
  const cautions = [];

  if (/lush|beautiful|scenic|sunset|sunrise|view|panorama/.test(sourceText)) positives.push('scenery');
  if (/friendly|helpful|staff|guide/.test(sourceText)) positives.push('helpful staff');
  if (/fun|amazing|great experience|loved|worth it|enjoy/.test(sourceText)) positives.push('overall enjoyment');
  if (/food|restaurant|breakfast|dinner|coffee/.test(sourceText)) positives.push('food stop value');
  if (/crowd|busy|queue|peak/.test(sourceText)) cautions.push('peak-time crowds');
  if (/bad service|service really bad|mixed service|slow/.test(sourceText)) cautions.push('mixed service feedback');
  if (/slippery|stairs|steep|rough|long walk/.test(sourceText)) cautions.push('access effort');

  if (positives.length === 0 && item.googleRating != null) {
    if (item.googleRating >= 4.6) positives.push('consistently strong public sentiment');
    else if (item.googleRating >= 4.3) positives.push('solid public sentiment');
  }

  if (item.googleReviewQuotes.length > 0) {
    const positivePart = positives.length ? `People often mention ${positives.slice(0, 2).join(' and ')}.` : 'People feedback is mostly about the on-site feel rather than logistics.';
    const cautionPart = cautions.length ? `Common cautions are ${cautions.slice(0, 2).join(' and ')}.` : '';
    return compactText(`${positivePart} ${cautionPart}`);
  }

  if (item.googleReviewCount != null) {
    const reviewLabel = `${item.googleRating != null ? `${item.googleRating.toFixed(1)}★` : 'unrated'} from ${formatCount(item.googleReviewCount)} Google reviews`;
    const fallback = item.googlePlaceMatchMode === 'area'
      ? 'This is an area-level Maps match, so detailed review themes are softer than an exact venue page.'
      : 'Detailed review snippets are thinner here, but the aggregate review signal is usable.';
    return `${reviewLabel}. ${fallback}`;
  }

  return item.googlePlaceMatchMode === 'area'
    ? 'Maps could only resolve an area-level match, so public-review detail is thin.'
    : 'Public review detail is limited for this entry.';
}

function buildAiSummary(item, scores) {
  const scenic = scores.viewScore >= 82 || scores.beautyScore >= 82;
  const easy = scores.mobilityFriendlyScore >= 76;
  const hard = scores.mobilityFriendlyScore <= 48;

  if (item.typeKey === 'hotel') {
    return hard
      ? 'Stay option with decent value signals, but arrival comfort is less certain than the easier hotel picks in this list.'
      : easy
        ? 'Stay option that looks easier to reach than most active experiences in this list.'
        : 'Stay option with moderate arrival effort and more focus on price or area than standout scenery.';
  }

  const core = item.primaryCategory === 'Waterfall'
    ? 'Scenic waterfall stop with photo payoff as the main reason to go.'
    : item.primaryCategory === 'Cave'
      ? 'Walk-heavy cave or canyon stop where access effort matters almost as much as the view.'
      : item.primaryCategory === 'Rafting'
        ? 'Adventure-led pick where the activity matters more than static scenery.'
        : item.primaryCategory === 'Jetski' || item.primaryCategory === 'Water Sport'
          ? 'Beach-start activity with easier logistics than most cliff or waterfall entries.'
          : item.primaryCategory === 'Snorkeling' || item.primaryCategory === 'Boat' || item.primaryCategory === 'Island Tour'
            ? 'Water-trip pick where scenery and transit logistics move together.'
            : item.primaryCategory === 'Temple' || item.primaryCategory === 'Culture Village'
              ? 'Culture-led stop with better payoff if timing and atmosphere line up.'
              : 'Experience-led pick with tradeoffs driven by access and crowd timing.';

  const scenicPart = scenic ? 'Visual payoff is one of its stronger arguments.' : 'The draw is more the activity or context than pure scenery.';
  const accessPart = hard
    ? 'Access is the main tradeoff for weak knees or low leg strength.'
    : easy
      ? 'Access is easier than many other active items in this list.'
      : 'Access looks manageable only if you pace the walking segments.';

  return compactText(`${core} ${scenicPart} ${accessPart}`);
}

function buildScores(item, access) {
  const quality = qualitySignal(item);
  const confidence = computeEvidenceConfidence(item);

  let mobilityFriendlyScore = access.mobilityBase;
  let viewScore = access.viewBase;
  let beautyScore = access.beautyBase;
  let experienceScore = access.experienceBase;

  if (item.googleRating != null) {
    experienceScore += (item.googleRating - 4.2) * 10;
    beautyScore += (item.googleRating - 4.2) * 4;
  } else if (item.ratingValue != null) {
    experienceScore += ((item.ratingValue / 10) - 0.82) * 22;
  }

  if ((item.googleReviewCount || 0) >= 500) {
    experienceScore += 3;
  }
  if ((item.googleReviewCount || 0) <= 15 && item.googleReviewCount != null) {
    experienceScore -= 2;
  }

  if (item.regionKey === 'outside_island') {
    viewScore += 4;
    beautyScore += 4;
  }

  if (item.googlePlaceMatchMode === 'area') {
    viewScore -= 1;
    beautyScore -= 1;
  }

  mobilityFriendlyScore = clamp(Math.round(mobilityFriendlyScore), 18, 98);
  viewScore = clamp(Math.round(viewScore), 30, 98);
  beautyScore = clamp(Math.round(beautyScore), 30, 98);
  experienceScore = clamp(Math.round((experienceScore * 0.65) + (quality * 0.35)), 30, 98);

  let overallRecommendationScore = Math.round(
    (experienceScore * 0.35) +
    (mobilityFriendlyScore * 0.25) +
    (viewScore * 0.20) +
    (beautyScore * 0.20),
  );

  if (confidence === 'low') {
    overallRecommendationScore -= 3;
  }

  return {
    qualitySignalScore: Math.round(quality),
    evidenceConfidence: confidence,
    mobilityFriendlyScore,
    viewScore,
    beautyScore,
    experienceScore,
    overallRecommendationScore: clamp(overallRecommendationScore, 25, 98),
  };
}

function comparisonDimensionLabel(key) {
  return {
    mobilityFriendlyScore: 'access ease',
    viewScore: 'views',
    beautyScore: 'beauty',
    experienceScore: 'experience',
    overallRecommendationScore: 'overall fit',
  }[key] || 'fit';
}

function shortTitle(title) {
  return title.length > 54 ? `${title.slice(0, 51).trim()}…` : title;
}

function buildComparison(items) {
  const clusterMap = new Map();
  const superClusterMap = new Map();

  items.forEach((item) => {
    const cluster = item.comparisonCluster;
    const superCluster = item.comparisonSuperCluster;
    if (!clusterMap.has(cluster)) clusterMap.set(cluster, []);
    if (!superClusterMap.has(superCluster)) superClusterMap.set(superCluster, []);
    clusterMap.get(cluster).push(item);
    superClusterMap.get(superCluster).push(item);
  });

  return items.map((item) => {
    const peers = (clusterMap.get(item.comparisonCluster) || []).filter((peer) => peer.id !== item.id);
    const broaderPeers = (superClusterMap.get(item.comparisonSuperCluster) || []).filter((peer) => peer.id !== item.id);
    const ranking = (clusterMap.get(item.comparisonCluster) || []).slice().sort((left, right) =>
      (right.overallRecommendationScore - left.overallRecommendationScore) ||
      (right.experienceScore - left.experienceScore) ||
      left.title.localeCompare(right.title),
    );
    const rank = ranking.findIndex((peer) => peer.id === item.id) + 1;
    const poolSize = ranking.length;
    const avg = peers.reduce((accumulator, peer) => {
      accumulator.mobilityFriendlyScore += peer.mobilityFriendlyScore;
      accumulator.viewScore += peer.viewScore;
      accumulator.beautyScore += peer.beautyScore;
      accumulator.experienceScore += peer.experienceScore;
      accumulator.overallRecommendationScore += peer.overallRecommendationScore;
      return accumulator;
    }, {
      mobilityFriendlyScore: 0,
      viewScore: 0,
      beautyScore: 0,
      experienceScore: 0,
      overallRecommendationScore: 0,
    });

    const average = peers.length > 0
      ? Object.fromEntries(Object.entries(avg).map(([key, value]) => [key, value / peers.length]))
      : {
          mobilityFriendlyScore: item.mobilityFriendlyScore,
          viewScore: item.viewScore,
          beautyScore: item.beautyScore,
          experienceScore: item.experienceScore,
          overallRecommendationScore: item.overallRecommendationScore,
        };

    const strongerDimensions = [
      'mobilityFriendlyScore',
      'viewScore',
      'beautyScore',
      'experienceScore',
    ].filter((key) => item[key] >= average[key] + 7);
    const weakerDimensions = [
      'mobilityFriendlyScore',
      'viewScore',
      'beautyScore',
      'experienceScore',
    ].filter((key) => item[key] <= average[key] - 7);

    const tier = poolSize <= 2
      ? 'Selective'
      : rank <= Math.ceil(poolSize * 0.34)
        ? 'Top tier'
        : rank <= Math.ceil(poolSize * 0.67)
          ? 'Mid tier'
          : 'Lower tier';

    const poolLabel = CLUSTER_LABELS[item.comparisonCluster] || 'saved-list alternatives';

    const betterByView = broaderPeers
      .filter((peer) => peer.viewScore >= item.viewScore + 8)
      .slice()
      .sort((left, right) => right.viewScore - left.viewScore || right.overallRecommendationScore - left.overallRecommendationScore)
      .slice(0, 2);

    const easierByAccess = broaderPeers
      .filter((peer) => peer.mobilityFriendlyScore >= item.mobilityFriendlyScore + 8)
      .slice()
      .sort((left, right) => right.mobilityFriendlyScore - left.mobilityFriendlyScore || right.overallRecommendationScore - left.overallRecommendationScore)
      .slice(0, 2);

    const strongerByOverall = peers
      .filter((peer) => peer.overallRecommendationScore >= item.overallRecommendationScore + 6)
      .slice()
      .sort((left, right) => right.overallRecommendationScore - left.overallRecommendationScore)
      .slice(0, 2);

    const peerComparisonSummary = strongerDimensions.length
      ? `${comparisonDimensionLabel(strongerDimensions[0])} is stronger than most ${poolLabel}.`
      : weakerDimensions.length
        ? `${comparisonDimensionLabel(weakerDimensions[0])} is weaker than the average ${poolLabel} option.`
        : `It sits near the middle of the ${poolLabel}.`;

    const betterAlternativeSummary = strongerByOverall.length
      ? `For a stronger same-cluster pick, ${shortTitle(strongerByOverall[0].title)}${strongerByOverall[1] ? ` or ${shortTitle(strongerByOverall[1].title)}` : ''} currently score higher.`
      : betterByView.length
        ? `If scenery matters more, ${shortTitle(betterByView[0].title)}${betterByView[1] ? ` or ${shortTitle(betterByView[1].title)}` : ''} look stronger in this saved list.`
        : easierByAccess.length
          ? `If easier access matters more, ${shortTitle(easierByAccess[0].title)}${easierByAccess[1] ? ` or ${shortTitle(easierByAccess[1].title)}` : ''} are simpler picks.`
          : 'No obvious internal alternative clearly dominates it on the current rubric.';

    const strengthOrder = [
      ['mobilityFriendlyScore', item.mobilityFriendlyScore],
      ['viewScore', item.viewScore],
      ['beautyScore', item.beautyScore],
      ['experienceScore', item.experienceScore],
    ].sort((left, right) => right[1] - left[1]);

    const chooseReason = comparisonDimensionLabel(strengthOrder[0][0]);
    const skipReason = comparisonDimensionLabel(strengthOrder[strengthOrder.length - 1][0]);
    const skipOrChooseWhy = `Choose for ${chooseReason}; skip if you are prioritizing ${skipReason}.`;

    return {
      ...item,
      comparisonClusterLabel: poolLabel,
      comparisonRank: rank,
      comparisonPoolSize: poolSize,
      comparisonTierLabel: tier,
      peerComparisonSummary,
      betterAlternativeSummary,
      skipOrChooseWhy,
    };
  });
}

export function enrichInsightRows(rows, googleCache) {
  const baseRows = rows.map((row) => {
    const googleFields = buildGoogleFields(row, googleCache.get(row.id));
    const merged = { ...row, ...googleFields };
    const access = buildAccessProfile(merged);
    const scores = buildScores(merged, access);
    const comparisonCluster = COMPARISON_CLUSTERS[merged.primaryCategory] || 'tour-general';
    const comparisonSuperCluster = SUPER_CLUSTERS[comparisonCluster] || 'tour';
    const crowdSummary = buildCrowdSummary({ ...merged, ...access, ...scores });
    const aiSummary = buildAiSummary({ ...merged, ...access, ...scores }, scores);
    const researchSources = uniqueList([
      merged.travelokaUrl ? 'Traveloka listing' : '',
      merged.googlePlaceUrl ? `Google Maps (${merged.googlePlaceMatchMode})` : '',
      merged.googleAbout ? 'Google place overview' : '',
      merged.googleReviewQuotes.length ? 'Google review snippets' : '',
    ]);

    return {
      ...merged,
      ...access,
      ...scores,
      crowdSummary,
      aiSummary,
      comparisonCluster,
      comparisonSuperCluster,
      comparisonPoolLabel: CLUSTER_LABELS[comparisonCluster] || 'saved-list alternatives',
      researchSources,
    };
  });

  const withComparison = buildComparison(baseRows);

  return withComparison.map((item) => ({
    ...item,
    searchText: [
      item.title,
      item.rawLocation,
      item.regionLabel,
      item.city,
      item.kecamatan,
      item.kelurahan,
      item.island,
      item.primaryCategory,
      item.categories.join(' '),
      item.googlePlaceName,
      item.googlePrimaryType,
      item.googleAbout,
      item.crowdSummary,
      item.aiSummary,
      item.transportAccess,
      item.selfGuidedAccess,
      item.walkDistanceText,
      item.walkTimeText,
      item.steepnessLevel,
      item.stairsLevel,
      item.kneeNote,
      item.peerComparisonSummary,
      item.betterAlternativeSummary,
      item.skipOrChooseWhy,
      item.comparisonClusterLabel,
      item.evidenceConfidence,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  }));
}
