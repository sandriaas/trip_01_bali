(function () {
  const items = JSON.parse(document.getElementById('trip-data').textContent);
  const snapshotMeta = JSON.parse(document.getElementById('trip-meta').textContent);
  const itemIndex = new Map(items.map(function (item) { return [item.id, item]; }));

  const STORAGE_VIEWS = 'trip-curated-views-v1';
  const STORAGE_SELECTION = 'trip-curated-selection-v1';
  const STORAGE_STATE = 'trip-curated-state-v1';
  const STORAGE_LISTS = 'trip-curated-saved-lists-v1';
  const DEFAULT_SORTS = [
    { key: 'location', dir: 'asc' },
    { key: 'category', dir: 'asc' },
    { key: 'listName', dir: 'asc' },
  ];
  const SORT_OPTIONS = [
    { value: 'location', label: 'Location' },
    { value: 'category', label: 'Category' },
    { value: 'listName', label: 'List Name' },
    { value: 'price', label: 'Price' },
    { value: 'rating', label: 'Rating' },
    { value: 'type', label: 'Type' },
    { value: 'none', label: 'None' },
  ];
  const DIRECTION_OPTIONS = [
    { value: 'asc', label: 'Asc' },
    { value: 'desc', label: 'Desc' },
  ];

  const state = loadState();
  state.exporting = false;

  const allCategories = unique(items.flatMap(function (item) { return item.categories; })).sort(localeCompare);
  const allRegions = items
    .map(function (item) { return item.regionLabel; })
    .filter(Boolean)
    .filter(function (value, index, list) { return list.indexOf(value) === index; })
    .sort(function (a, b) { return regionRank(a) - regionRank(b) || localeCompare(a, b); });

  const app = document.getElementById('app');
  app.innerHTML = buildShell();

  const refs = {
    search: document.getElementById('searchInput'),
    type: document.getElementById('typeFilter'),
    region: document.getElementById('regionFilter'),
    category: document.getElementById('categoryFilter'),
    sort1Key: document.getElementById('sort1Key'),
    sort1Dir: document.getElementById('sort1Dir'),
    sort2Key: document.getElementById('sort2Key'),
    sort2Dir: document.getElementById('sort2Dir'),
    sort3Key: document.getElementById('sort3Key'),
    sort3Dir: document.getElementById('sort3Dir'),
    summary: document.getElementById('summaryStrip'),
    rows: document.getElementById('rows'),
    visibleCount: document.getElementById('visibleCount'),
    selectedCount: document.getElementById('selectedCount'),
    totalCount: document.getElementById('totalCount'),
    extractedAt: document.getElementById('extractedAt'),
    sourceUrl: document.getElementById('sourceUrl'),
    viewName: document.getElementById('viewName'),
    viewSelect: document.getElementById('viewSelect'),
    saveView: document.getElementById('saveView'),
    loadView: document.getElementById('loadView'),
    deleteView: document.getElementById('deleteView'),
    selectVisible: document.getElementById('selectVisible'),
    clearToolbarSelection: document.getElementById('clearToolbarSelection'),
    resetFilters: document.getElementById('resetFilters'),
    batchPanel: document.getElementById('batchPanel'),
    batchSummary: document.getElementById('batchSummary'),
    batchCount: document.getElementById('batchCount'),
    listName: document.getElementById('listNameInput'),
    listSelect: document.getElementById('savedListSelect'),
    saveList: document.getElementById('saveList'),
    loadList: document.getElementById('loadList'),
    deleteList: document.getElementById('deleteList'),
    clearSelection: document.getElementById('clearSelection'),
    exportHtml: document.getElementById('exportHtml'),
    exportHtm: document.getElementById('exportHtm'),
    exportPdf: document.getElementById('exportPdf'),
    exportPng: document.getElementById('exportPng'),
    exportHost: document.getElementById('exportHost'),
  };

  hydrateControls();
  attachEvents();
  render();

  function buildShell() {
    return [
      '<div class="shell">',
      '  <section class="hero">',
      '    <div class="hero-top">',
      '      <div>',
      '        <div class="eyebrow">Live Traveloka Snapshot</div>',
      '        <h1>Curated Trip Planner</h1>',
      '      </div>',
      '      <div class="hero-meta">',
      '        <span class="hero-pill"><strong id="totalCount">0</strong> live items</span>',
      '        <span class="hero-pill"><strong id="visibleCount">0</strong> visible</span>',
      '        <span class="hero-pill"><strong id="selectedCount">0</strong> selected</span>',
      '      </div>',
      '    </div>',
      '    <p>Compact local planner rebuilt from the live Traveloka saved list. Keep the original card info, add location intelligence and categories, save named views, save named checked lists, and export the selected rows as HTML, HTM, PDF, or PNG.</p>',
      '    <div class="hero-meta">',
      '      <span class="hero-pill">Extracted <strong id="extractedAt"></strong></span>',
      '      <span class="hero-pill">Source <a id="sourceUrl" target="_blank" rel="noreferrer">Traveloka saved list</a></span>',
      '    </div>',
      '  </section>',
      '  <section class="toolbar">',
      '    <div class="toolbar-grid">',
      '      <div class="field">',
      '        <label for="searchInput">Search</label>',
      '        <input id="searchInput" type="search" placeholder="Title, location, category, city, island">',
      '      </div>',
      '      <div class="field">',
      '        <label for="typeFilter">Type</label>',
      '        <select id="typeFilter"></select>',
      '      </div>',
      '      <div class="field">',
      '        <label for="regionFilter">Region</label>',
      '        <select id="regionFilter"></select>',
      '      </div>',
      '      <div class="field">',
      '        <label for="categoryFilter">Category</label>',
      '        <select id="categoryFilter"></select>',
      '      </div>',
      '    </div>',
      '    <div class="sort-grid">',
      '      <div class="sort-rule">',
      '        <label>Sort Rule 1</label>',
      '        <div class="rule-pair"><select id="sort1Key"></select><select id="sort1Dir"></select></div>',
      '      </div>',
      '      <div class="sort-rule">',
      '        <label>Sort Rule 2</label>',
      '        <div class="rule-pair"><select id="sort2Key"></select><select id="sort2Dir"></select></div>',
      '      </div>',
      '      <div class="sort-rule">',
      '        <label>Sort Rule 3</label>',
      '        <div class="rule-pair"><select id="sort3Key"></select><select id="sort3Dir"></select></div>',
      '      </div>',
      '    </div>',
      '    <div class="views-grid">',
      '      <div class="view-controls">',
      '        <label for="viewName">Save View Name</label>',
      '        <input id="viewName" type="text" placeholder="e.g. South Bali water sports">',
      '      </div>',
      '      <div class="view-controls">',
      '        <label for="viewSelect">Saved Views</label>',
      '        <select id="viewSelect"></select>',
      '      </div>',
      '      <button class="btn subtle" id="saveView" type="button">Save View</button>',
      '      <button class="btn subtle" id="loadView" type="button">Load View</button>',
      '      <button class="btn subtle" id="deleteView" type="button">Delete View</button>',
      '    </div>',
      '    <div class="actions-grid">',
      '      <button class="btn subtle" id="selectVisible" type="button">Select Visible</button>',
      '      <button class="btn subtle" id="clearToolbarSelection" type="button">Clear Selection</button>',
      '      <button class="btn subtle" id="resetFilters" type="button">Reset Filters</button>',
      '      <div class="summary-strip" id="summaryStrip"></div>',
      '    </div>',
      '  </section>',
      '  <section class="batch-panel" id="batchPanel" hidden>',
      '    <div class="batch-top">',
      '      <div>',
      '        <div class="eyebrow">Batch Actions</div>',
      '        <h2><strong id="batchCount">0</strong> selected rows</h2>',
      '      </div>',
      '      <div class="summary-strip" id="batchSummary"></div>',
      '    </div>',
      '    <div class="batch-grid">',
      '      <div class="view-controls">',
      '        <label for="listNameInput">Save List Name</label>',
      '        <input id="listNameInput" type="text" placeholder="e.g. Jimbaran short list">',
      '      </div>',
      '      <div class="view-controls">',
      '        <label for="savedListSelect">Saved Lists</label>',
      '        <select id="savedListSelect"></select>',
      '      </div>',
      '      <button class="btn subtle" id="saveList" type="button">Save List</button>',
      '      <button class="btn subtle" id="loadList" type="button">Load List</button>',
      '      <button class="btn subtle" id="deleteList" type="button">Delete List</button>',
      '    </div>',
      '    <div class="export-actions">',
      '      <button class="btn subtle" id="clearSelection" type="button">Clear Selection</button>',
      '      <div class="export-group">',
      '        <span class="section-title">Export Selected</span>',
      '        <button class="btn primary" id="exportHtml" type="button">HTML</button>',
      '        <button class="btn primary" id="exportHtm" type="button">HTM</button>',
      '        <button class="btn primary" id="exportPdf" type="button">PDF</button>',
      '        <button class="btn primary" id="exportPng" type="button">PNG</button>',
      '      </div>',
      '    </div>',
      '  </section>',
      '  <section class="table-shell">',
      '    <div class="table-header">',
      '      <div>Location</div>',
      '      <div>Category</div>',
      '      <div>List</div>',
      '    </div>',
      '    <div id="rows"></div>',
      '    <div class="footer-note">Default order is <strong>Location → Category → List Name</strong>. Saved views store filters and sorting. Saved lists store checked rows only.</div>',
      '  </section>',
      '  <div class="export-host" id="exportHost" aria-hidden="true"></div>',
      '</div>',
    ].join('');
  }

  function loadState() {
    const saved = parseJson(localStorage.getItem(STORAGE_STATE), {});
    const selectedRaw = parseJson(localStorage.getItem(STORAGE_SELECTION), {});
    const views = parseJson(localStorage.getItem(STORAGE_VIEWS), {});
    const savedLists = parseJson(localStorage.getItem(STORAGE_LISTS), {});

    return {
      search: saved.search || '',
      type: saved.type || 'all',
      region: saved.region || 'all',
      category: saved.category || 'all',
      sorts: normalizeSorts(saved.sorts || DEFAULT_SORTS),
      selected: sanitizeSelection(selectedRaw),
      views: sanitizeViews(views),
      lists: sanitizeLists(savedLists),
    };
  }

  function hydrateControls() {
    refs.extractedAt.textContent = formatDate(snapshotMeta.extractedAt);
    refs.sourceUrl.href = snapshotMeta.sourceUrl;

    refs.type.innerHTML = [
      option('all', 'All Types'),
      option('Hotels', 'Hotels'),
      option('Things to Do', 'Things to Do'),
    ].join('');

    refs.region.innerHTML = [option('all', 'All Regions')]
      .concat(allRegions.map(function (region) { return option(region, region); }))
      .join('');

    refs.category.innerHTML = [option('all', 'All Categories')]
      .concat(allCategories.map(function (category) { return option(category, category); }))
      .join('');

    fillSortSelect(refs.sort1Key);
    fillSortSelect(refs.sort2Key);
    fillSortSelect(refs.sort3Key);
    fillDirectionSelect(refs.sort1Dir);
    fillDirectionSelect(refs.sort2Dir);
    fillDirectionSelect(refs.sort3Dir);
    renderViewOptions();
    renderListOptions();
    syncControls();
  }

  function attachEvents() {
    refs.search.addEventListener('input', function () {
      state.search = refs.search.value;
      persistState();
      render();
    });

    refs.type.addEventListener('change', function () {
      state.type = refs.type.value;
      persistState();
      render();
    });

    refs.region.addEventListener('change', function () {
      state.region = refs.region.value;
      persistState();
      render();
    });

    refs.category.addEventListener('change', function () {
      state.category = refs.category.value;
      persistState();
      render();
    });

    [
      [refs.sort1Key, 0, 'key'],
      [refs.sort1Dir, 0, 'dir'],
      [refs.sort2Key, 1, 'key'],
      [refs.sort2Dir, 1, 'dir'],
      [refs.sort3Key, 2, 'key'],
      [refs.sort3Dir, 2, 'dir'],
    ].forEach(function (entry) {
      const element = entry[0];
      const index = entry[1];
      const field = entry[2];
      element.addEventListener('change', function () {
        state.sorts[index][field] = element.value;
        state.sorts = normalizeSorts(state.sorts);
        persistState();
        render();
      });
    });

    refs.saveView.addEventListener('click', function () {
      const name = refs.viewName.value.trim();
      if (!name) {
        window.alert('Enter a view name first.');
        return;
      }
      state.views[name] = {
        search: state.search,
        type: state.type,
        region: state.region,
        category: state.category,
        sorts: normalizeSorts(state.sorts),
      };
      persistViews();
      renderViewOptions(name);
      refs.viewName.value = '';
    });

    refs.loadView.addEventListener('click', function () {
      const name = refs.viewSelect.value;
      if (!name || !state.views[name]) return;
      const view = state.views[name];
      state.search = view.search || '';
      state.type = view.type || 'all';
      state.region = view.region || 'all';
      state.category = view.category || 'all';
      state.sorts = normalizeSorts(view.sorts || DEFAULT_SORTS);
      syncControls();
      persistState();
      render();
    });

    refs.deleteView.addEventListener('click', function () {
      const name = refs.viewSelect.value;
      if (!name || !state.views[name]) return;
      delete state.views[name];
      persistViews();
      renderViewOptions();
    });

    refs.selectVisible.addEventListener('click', function () {
      getVisibleItems().forEach(function (item) {
        state.selected[item.id] = true;
      });
      persistSelection();
      render();
    });

    refs.clearToolbarSelection.addEventListener('click', function () {
      state.selected = {};
      persistSelection();
      render();
    });

    refs.clearSelection.addEventListener('click', function () {
      state.selected = {};
      persistSelection();
      render();
    });

    refs.resetFilters.addEventListener('click', function () {
      state.search = '';
      state.type = 'all';
      state.region = 'all';
      state.category = 'all';
      state.sorts = normalizeSorts(DEFAULT_SORTS);
      syncControls();
      persistState();
      render();
    });

    refs.saveList.addEventListener('click', function () {
      const name = refs.listName.value.trim();
      const selectedItems = getSelectedItems();
      if (!name) {
        window.alert('Enter a list name first.');
        return;
      }
      if (selectedItems.length === 0) {
        window.alert('Select at least one row before saving a list.');
        return;
      }
      const existing = state.lists[name];
      state.lists[name] = {
        ids: selectedItems.map(function (item) { return item.id; }),
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      persistLists();
      renderListOptions(name);
      refs.listName.value = '';
    });

    refs.loadList.addEventListener('click', function () {
      const name = refs.listSelect.value;
      if (!name || !state.lists[name]) return;
      state.selected = {};
      state.lists[name].ids.forEach(function (id) {
        if (itemIndex.has(id)) {
          state.selected[id] = true;
        }
      });
      persistSelection();
      render();
    });

    refs.deleteList.addEventListener('click', function () {
      const name = refs.listSelect.value;
      if (!name || !state.lists[name]) return;
      delete state.lists[name];
      persistLists();
      renderListOptions();
    });

    refs.exportHtml.addEventListener('click', function () {
      handleExport('html');
    });
    refs.exportHtm.addEventListener('click', function () {
      handleExport('htm');
    });
    refs.exportPdf.addEventListener('click', function () {
      handleExport('pdf');
    });
    refs.exportPng.addEventListener('click', function () {
      handleExport('png');
    });

    refs.rows.addEventListener('change', function (event) {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) || target.type !== 'checkbox') return;
      const id = target.getAttribute('data-id');
      if (!id) return;
      if (target.checked) {
        state.selected[id] = true;
      } else {
        delete state.selected[id];
      }
      persistSelection();
      render();
    });
  }

  function render() {
    const visibleItems = getVisibleItems();
    refs.rows.innerHTML = visibleItems.length
      ? visibleItems.map(function (item) { return renderInteractiveRow(item); }).join('')
      : '<div class="empty-state">No rows match the current search and filters.</div>';

    refs.totalCount.textContent = String(items.length);
    refs.visibleCount.textContent = String(visibleItems.length);
    refs.selectedCount.textContent = String(getSelectedCount());
    renderSummary(visibleItems);
    renderBatchPanel(visibleItems);
    wireThumbnailFallbacks(refs.rows);
  }

  function renderSummary(visibleItems) {
    const selectedVisible = visibleItems.filter(function (item) { return !!state.selected[item.id]; }).length;
    const totalSelected = getSelectedCount();
    refs.summary.innerHTML = [
      summaryPill('Visible', String(visibleItems.length)),
      summaryPill('Selected Visible', String(selectedVisible)),
      summaryPill('Selected Total', String(totalSelected)),
      summaryPill('Current Sort', describeSorts(state.sorts)),
    ].join('');
  }

  function renderBatchPanel(visibleItems) {
    const selectedItems = getSelectedItems();
    const selectedVisible = visibleItems.filter(function (item) { return !!state.selected[item.id]; }).length;
    refs.batchPanel.hidden = selectedItems.length === 0;
    refs.batchCount.textContent = String(selectedItems.length);
    refs.batchSummary.innerHTML = [
      summaryPill('Selected Total', String(selectedItems.length)),
      summaryPill('Selected Visible', String(selectedVisible)),
      summaryPill('Saved Lists', String(Object.keys(state.lists).length)),
      summaryPill('Export Order', describeSorts(state.sorts)),
    ].join('');
    setExportBusy(state.exporting);
  }

  function getVisibleItems() {
    return items.filter(matchesFilters).slice().sort(compareItems);
  }

  function getSelectedItems() {
    return items.filter(function (item) { return !!state.selected[item.id]; }).slice().sort(compareItems);
  }

  function getSelectedCount() {
    return Object.keys(state.selected).length;
  }

  function matchesFilters(item) {
    const haystack = [
      item.title,
      item.rawLocation,
      item.regionLabel,
      item.city,
      item.kecamatan,
      item.kelurahan,
      item.island,
      item.primaryCategory,
      item.categories.join(' '),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    const search = state.search.trim().toLowerCase();
    if (search && !haystack.includes(search)) return false;
    if (state.type !== 'all' && item.typeLabel !== state.type) return false;
    if (state.region !== 'all' && item.regionLabel !== state.region) return false;
    if (state.category !== 'all' && !item.categories.includes(state.category)) return false;
    return true;
  }

  function compareItems(left, right) {
    const collator = compareItems.collator || (compareItems.collator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' }));
    for (const rule of state.sorts) {
      if (!rule || rule.key === 'none') continue;
      let result = 0;
      if (rule.key === 'location') {
        result = collator.compare(left.sortLocationKey, right.sortLocationKey);
      } else if (rule.key === 'category') {
        result = collator.compare(left.sortCategoryKey, right.sortCategoryKey);
      } else if (rule.key === 'listName') {
        result = collator.compare(left.sortListNameKey, right.sortListNameKey);
      } else if (rule.key === 'price') {
        result = compareNullable(left.priceValue, right.priceValue);
      } else if (rule.key === 'rating') {
        result = compareNullable(left.ratingValue, right.ratingValue);
      } else if (rule.key === 'type') {
        result = collator.compare(left.typeLabel, right.typeLabel);
      }
      if (result !== 0) {
        return rule.dir === 'desc' ? result * -1 : result;
      }
    }
    return collator.compare(left.title, right.title);
  }

  function renderInteractiveRow(item) {
    const selected = !!state.selected[item.id];
    return [
      '<div class="trip-row', selected ? ' is-selected' : '', '" data-id="', escapeHtml(item.id), '">',
      renderLocationCell(item),
      renderCategoryCell(item),
      renderListCell(item, true),
      '</div>',
    ].join('');
  }

  function renderLocationCell(item) {
    return [
      '<section class="cell location-cell">',
      '  <span class="region-badge ', badgeClass(item.regionKey), '">', escapeHtml(item.regionLabel), '</span>',
      '  <div class="admin-line"><strong>Admin:</strong> ', escapeHtml(composeAdminLine(item)), '</div>',
      '  <div class="source-line"><strong>Source location:</strong> ', escapeHtml(item.rawLocation || 'Unknown'), '</div>',
      '  <div class="link-row">',
      item.travelokaUrl ? link(item.travelokaUrl, item.travelokaUrlLabel) : '<span class="pending">Traveloka link pending</span>',
      link(item.mapsUrl, item.mapsUrlLabel),
      '  </div>',
      '</section>',
    ].join('');
  }

  function renderCategoryCell(item) {
    return [
      '<section class="cell category-cell">',
      '  <div class="chips">',
      item.categories.map(function (category) { return '<span class="chip">' + escapeHtml(category) + '</span>'; }).join(''),
      '  </div>',
      '</section>',
    ].join('');
  }

  function renderListCell(item, interactive) {
    return [
      '<section class="cell">',
      '  <div class="list-card">',
      interactive
        ? '    <label class="select-wrap"><input type="checkbox" data-id="' + escapeHtml(item.id) + '"' + (state.selected[item.id] ? ' checked' : '') + '></label>'
        : '    <span class="select-wrap" aria-hidden="true"></span>',
      renderThumb(item),
      '    <div class="list-copy">',
      '      <div class="type-label">', escapeHtml(item.typeLabel), '</div>',
      item.travelokaUrl
        ? '      <a class="title-link" href="' + escapeHtml(item.travelokaUrl) + '" target="_blank" rel="noreferrer">' + escapeHtml(item.title) + '</a>'
        : '      <div class="title-link">' + escapeHtml(item.title) + '</div>',
      '      <div class="rating-line"><strong>Rating:</strong> ', escapeHtml(item.ratingText || 'No ratings yet'), '</div>',
      '      <div class="raw-line"><strong>Original location:</strong> ', escapeHtml(item.rawLocation || 'Unknown'), '</div>',
      '      <div class="url-line">',
      item.travelokaUrl ? link(item.travelokaUrl, item.title) : '',
      item.mapsUrl ? link(item.mapsUrl, 'Google Maps') : '',
      '      </div>',
      '    </div>',
      '    <div class="price-block">',
      '      <div class="price">', escapeHtml(item.priceText || 'Price unavailable'), '</div>',
      '      <div class="price-meta">', escapeHtml(item.priceQualifier || ''), '</div>',
      '    </div>',
      '  </div>',
      '</section>',
    ].join('');
  }

  function renderThumb(item) {
    const fallbackLabel = item.typeKey === 'hotel' ? 'Hotel' : 'Activity';
    if (!item.imageUrl) {
      return [
        '    <div class="thumb-frame is-fallback">',
        '      <div class="thumb-fallback"><span>', escapeHtml(fallbackLabel), '</span></div>',
        '    </div>',
      ].join('');
    }

    return [
      '    <div class="thumb-frame">',
      '      <img class="thumb" crossorigin="anonymous" loading="lazy" src="', escapeHtml(item.imageUrl), '" alt="', escapeHtml(item.title), '">',
      '      <div class="thumb-fallback" aria-hidden="true"><span>', escapeHtml(fallbackLabel), '</span></div>',
      '    </div>',
    ].join('');
  }

  function buildExportMarkup(selectedItems) {
    const rowsHtml = selectedItems.map(function (item) {
      return [
        '<div class="trip-row">',
        renderLocationCell(item),
        renderCategoryCell(item),
        renderListCell(item, false),
        '</div>',
      ].join('');
    }).join('');

    return [
      '<div class="export-sheet">',
      '  <div class="shell export-shell">',
      '    <section class="hero export-hero">',
      '      <div class="hero-top">',
      '        <div>',
      '          <div class="eyebrow">Selected Export</div>',
      '          <h1>Chosen Trip Rows</h1>',
      '        </div>',
      '        <div class="hero-meta">',
      '          <span class="hero-pill"><strong>', String(selectedItems.length), '</strong> exported rows</span>',
      '        </div>',
      '      </div>',
      '      <p>Standalone export from the curated trip planner. This snapshot preserves the current sort order and keeps both Traveloka and Google Maps links visible.</p>',
      '    </section>',
      '    <section class="table-shell export-table">',
      '      <div class="table-header"><div>Location</div><div>Category</div><div>List</div></div>',
      '      <div>', rowsHtml, '</div>',
      '    </section>',
      '  </div>',
      '</div>',
    ].join('');
  }

  function buildExportDocument(selectedItems) {
    const styles = document.getElementById('planner-styles').textContent;
    return [
      '<!doctype html>',
      '<html lang="en">',
      '<head>',
      '  <meta charset="utf-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1">',
      '  <title>Selected Trip Rows</title>',
      '  <link rel="icon" href="data:,">',
      '  <style>', styles, '</style>',
      '</head>',
      '<body>',
      buildExportMarkup(selectedItems),
      '</body>',
      '</html>',
    ].join('');
  }

  async function handleExport(format) {
    const selectedItems = getSelectedItems();
    if (selectedItems.length === 0) {
      window.alert('Select at least one row before exporting.');
      return;
    }
    if ((format === 'pdf' || format === 'png') && typeof window.html2canvas !== 'function') {
      window.alert('Export renderer is not available in this build.');
      return;
    }

    setExportBusy(true);

    try {
      if (format === 'html' || format === 'htm') {
        downloadFile(buildFilename(format), buildExportDocument(selectedItems));
        return;
      }

      const stage = await mountExportStage(selectedItems);
      try {
        const canvas = await renderExportCanvas(stage);
        if (format === 'png') {
          const blob = await canvasToBlob(canvas, 'image/png');
          downloadBlob(buildFilename('png'), blob);
          return;
        }

        await downloadPdf(canvas, buildFilename('pdf'));
      } finally {
        refs.exportHost.innerHTML = '';
      }
    } catch (error) {
      console.error(error);
      window.alert('Export failed. Please try a smaller selection or retry.');
    } finally {
      setExportBusy(false);
    }
  }

  async function mountExportStage(selectedItems) {
    refs.exportHost.innerHTML = buildExportMarkup(selectedItems);
    const stage = refs.exportHost.firstElementChild;
    if (!stage) {
      throw new Error('export stage not created');
    }
    wireThumbnailFallbacks(stage);
    await waitForImages(stage);
    return stage;
  }

  async function renderExportCanvas(stage) {
    const scale = stage.scrollHeight > 12000 ? 1.15 : 1.6;
    return window.html2canvas(stage, {
      backgroundColor: '#f7f3ec',
      scale: scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 15000,
      windowWidth: Math.max(stage.scrollWidth, 1280),
      windowHeight: Math.max(stage.scrollHeight, 1200),
      scrollX: 0,
      scrollY: 0,
    });
  }

  async function downloadPdf(canvas, filename) {
    const jsPDF = window.jspdf?.jsPDF;
    if (!jsPDF) {
      throw new Error('jsPDF not available');
    }

    const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4', compress: true });
    const margin = 22;
    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;
    const ratio = pageWidth / canvas.width;
    const pageHeightPx = Math.floor(pageHeight / ratio);
    let offsetY = 0;
    let pageNumber = 0;

    while (offsetY < canvas.height) {
      const sliceHeight = Math.min(pageHeightPx, canvas.height - offsetY);
      const pageCanvas = document.createElement('canvas');
      const pageContext = pageCanvas.getContext('2d');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;
      pageContext.drawImage(canvas, 0, offsetY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
      const image = pageCanvas.toDataURL('image/jpeg', 0.92);
      if (pageNumber > 0) pdf.addPage();
      pdf.addImage(image, 'JPEG', margin, margin, pageWidth, sliceHeight * ratio, undefined, 'FAST');
      offsetY += sliceHeight;
      pageNumber += 1;
    }

    pdf.save(filename);
  }

  function buildFilename(extension) {
    const now = new Date();
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return ['trip-selected', yyyy, mm, dd].join('-') + '.' + extension;
  }

  function composeAdminLine(item) {
    return [item.kecamatan, item.kelurahan, item.island, item.city].filter(Boolean).join(', ') || 'Not set';
  }

  function persistSelection() {
    localStorage.setItem(STORAGE_SELECTION, JSON.stringify(state.selected));
  }

  function persistViews() {
    localStorage.setItem(STORAGE_VIEWS, JSON.stringify(state.views));
  }

  function persistLists() {
    localStorage.setItem(STORAGE_LISTS, JSON.stringify(state.lists));
  }

  function persistState() {
    localStorage.setItem(STORAGE_STATE, JSON.stringify({
      search: state.search,
      type: state.type,
      region: state.region,
      category: state.category,
      sorts: state.sorts,
    }));
  }

  function syncControls() {
    refs.search.value = state.search;
    refs.type.value = state.type;
    refs.region.value = state.region;
    refs.category.value = state.category;
    refs.sort1Key.value = state.sorts[0].key;
    refs.sort1Dir.value = state.sorts[0].dir;
    refs.sort2Key.value = state.sorts[1].key;
    refs.sort2Dir.value = state.sorts[1].dir;
    refs.sort3Key.value = state.sorts[2].key;
    refs.sort3Dir.value = state.sorts[2].dir;
  }

  function renderViewOptions(selectedName) {
    const names = Object.keys(state.views).sort(localeCompare);
    refs.viewSelect.innerHTML = [option('', 'Choose a saved view')]
      .concat(names.map(function (name) { return option(name, name); }))
      .join('');
    if (selectedName && state.views[selectedName]) {
      refs.viewSelect.value = selectedName;
    }
  }

  function renderListOptions(selectedName) {
    const names = Object.keys(state.lists).sort(localeCompare);
    refs.listSelect.innerHTML = [option('', 'Choose a saved list')]
      .concat(names.map(function (name) { return option(name, name); }))
      .join('');
    if (selectedName && state.lists[selectedName]) {
      refs.listSelect.value = selectedName;
    }
  }

  function normalizeSorts(rules) {
    return [0, 1, 2].map(function (index) {
      const rule = rules[index] || { key: 'none', dir: 'asc' };
      return {
        key: rule.key || 'none',
        dir: rule.dir === 'desc' ? 'desc' : 'asc',
      };
    });
  }

  function fillSortSelect(select) {
    select.innerHTML = SORT_OPTIONS.map(function (entry) { return option(entry.value, entry.label); }).join('');
  }

  function fillDirectionSelect(select) {
    select.innerHTML = DIRECTION_OPTIONS.map(function (entry) { return option(entry.value, entry.label); }).join('');
  }

  function badgeClass(regionKey) {
    return String(regionKey || '').replace(/_/g, '-');
  }

  function summaryPill(label, value) {
    return '<span class="summary-pill"><strong>' + escapeHtml(value) + '</strong> ' + escapeHtml(label) + '</span>';
  }

  function option(value, label) {
    return '<option value="' + escapeHtml(value) + '">' + escapeHtml(label) + '</option>';
  }

  function link(href, label) {
    return '<a href="' + escapeHtml(href) + '" target="_blank" rel="noreferrer">' + escapeHtml(label) + '</a>';
  }

  function downloadFile(filename, content) {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    downloadBlob(filename, blob);
  }

  function downloadBlob(filename, blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  function setExportBusy(isBusy) {
    state.exporting = !!isBusy;
    refs.batchPanel.dataset.busy = String(state.exporting);
    [
      refs.saveList,
      refs.loadList,
      refs.deleteList,
      refs.clearSelection,
      refs.exportHtml,
      refs.exportHtm,
      refs.exportPdf,
      refs.exportPng,
    ].forEach(function (button) {
      button.disabled = state.exporting;
    });
  }

  function wireThumbnailFallbacks(root) {
    root.querySelectorAll('.thumb').forEach(function (img) {
      const frame = img.closest('.thumb-frame');
      const handleLoad = function () {
        if (img.naturalWidth > 0) {
          frame.classList.add('is-loaded');
        }
      };
      const handleError = function () {
        frame.classList.add('is-fallback');
      };
      if (img.complete) {
        if (img.naturalWidth > 0) {
          frame.classList.add('is-loaded');
        } else {
          frame.classList.add('is-fallback');
        }
        return;
      }
      img.addEventListener('load', handleLoad, { once: true });
      img.addEventListener('error', handleError, { once: true });
    });
  }

  function waitForImages(root) {
    const images = Array.from(root.querySelectorAll('.thumb'));
    return Promise.all(images.map(function (img) {
      return new Promise(function (resolve) {
        if (img.complete) {
          resolve();
          return;
        }
        img.addEventListener('load', function () { resolve(); }, { once: true });
        img.addEventListener('error', function () { resolve(); }, { once: true });
      });
    })).then(function () {
      return new Promise(function (resolve) { setTimeout(resolve, 180); });
    });
  }

  function canvasToBlob(canvas, type) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('canvas blob failed'));
        }
      }, type);
    });
  }

  function sanitizeSelection(value) {
    return Object.fromEntries(Object.entries(value || {}).filter(function (entry) {
      return !!entry[1] && itemIndex.has(entry[0]);
    }));
  }

  function sanitizeViews(value) {
    const views = {};
    Object.entries(value || {}).forEach(function (entry) {
      views[entry[0]] = {
        search: entry[1]?.search || '',
        type: entry[1]?.type || 'all',
        region: entry[1]?.region || 'all',
        category: entry[1]?.category || 'all',
        sorts: normalizeSorts(entry[1]?.sorts || DEFAULT_SORTS),
      };
    });
    return views;
  }

  function sanitizeLists(value) {
    const lists = {};
    Object.entries(value || {}).forEach(function (entry) {
      const ids = Array.isArray(entry[1]?.ids) ? entry[1].ids.filter(function (id) { return itemIndex.has(id); }) : [];
      if (!ids.length) return;
      lists[entry[0]] = {
        ids: unique(ids),
        createdAt: entry[1]?.createdAt || new Date().toISOString(),
        updatedAt: entry[1]?.updatedAt || entry[1]?.createdAt || new Date().toISOString(),
      };
    });
    return lists;
  }

  function parseJson(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function describeSorts(sorts) {
    return sorts
      .filter(function (rule) { return rule.key !== 'none'; })
      .map(function (rule) { return labelForSort(rule.key) + ' ' + rule.dir.toUpperCase(); })
      .join(' · ') || 'None';
  }

  function labelForSort(key) {
    return SORT_OPTIONS.find(function (entry) { return entry.value === key; })?.label || key;
  }

  function compareNullable(left, right) {
    if (left == null && right == null) return 0;
    if (left == null) return 1;
    if (right == null) return -1;
    return left - right;
  }

  function unique(list) {
    return list.filter(function (value, index) { return list.indexOf(value) === index; });
  }

  function localeCompare(left, right) {
    return left.localeCompare(right, 'en', { sensitivity: 'base', numeric: true });
  }

  function regionRank(regionLabel) {
    if (regionLabel === 'North') return 0;
    if (regionLabel === 'Central') return 1;
    if (regionLabel === 'West') return 2;
    if (regionLabel === 'East') return 3;
    if (regionLabel === 'South') return 4;
    if (regionLabel.startsWith('Outside Island')) return 5;
    if (regionLabel.startsWith('Outside Bali')) return 6;
    return 99;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
})();
