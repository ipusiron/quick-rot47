// Page behaviour: method choice, conversion, samples, copy, moving the output to the input, the character table,
// the method guess, the help dialog and language.
document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
  const $ = id => document.getElementById(id);
  const input = $('input-text');
  const output = $('output-text');
  const live = $('live-convert');
  const stats = $('stats');
  const fullWidthNote = $('fullwidth-note');
  const status = $('status');
  const methodInputs = [...document.querySelectorAll('input[name="method"]')];
  const shiftInput = $('rotn-shift');
  const PLAIN_SAMPLE = 'Hello World! 123';
  const STATUS_MS = 4000;
  const PREVIEW_LENGTH = 160;
  const DETECT_SHOWN = 5;
  let statusTimer = null;       // one timer, so a new message is never cleared by an older one
  let statusMessage = null;     // { key, values } of the message on screen, to translate it again
  let converted = null;         // { text, method, n } of the last conversion; the counts describe it
  let lastShift = RotCore.normalizeShift(shiftInput.value);    // the ROT-N shift in use (1 to 25)

  const method = () => methodInputs.find(radio => radio.checked).value;
  const shift = () => lastShift;
  const nameOf = (m, n) => (m === 'rotn' ? 'ROT-' + n : m.toUpperCase());
  // The typed shift as a whole number, or null while the field is empty or holds something else
  const typedShift = () => (/^\s*-?\d+\s*$/.test(shiftInput.value) ? Number(shiftInput.value) : null);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function showStatus(key, values = {}) {
    clearTimeout(statusTimer);
    statusMessage = key ? { key, values } : null;
    status.textContent = key ? I18n.t(key, values) : '';
    if (key) statusTimer = setTimeout(() => showStatus(null), STATUS_MS);
  }

  // ---------- Method ----------
  function renderMethod() {
    const m = method();
    const n = shift();
    $('rotn-controls').hidden = m !== 'rotn';
    $('method-note').textContent = RotCore.isSelfInverse(m, n)
      ? I18n.t('method.selfInverse', { name: nameOf(m, n) })
      : I18n.t('method.notSelfInverse', { n, back: RotCore.inverseShift(n) });
    $('sample-plain').textContent = I18n.t('sample.plain', { text: PLAIN_SAMPLE });
    $('sample-cipher').textContent = I18n.t('sample.cipher', { name: nameOf(m, n) });
  }

  function onMethodChange() {
    renderMethod();
    if (input.value || converted) convert();
    renderMap();
  }
  methodInputs.forEach(radio => radio.addEventListener('change', onMethodChange));
  // While typing, only 1 to 25 takes effect; other numbers are folded into 1..25 when the field is left,
  // and an empty field or a non-number goes back to the shift in use
  shiftInput.addEventListener('input', () => {
    const typed = typedShift();
    if (typed === null || typed < 1 || typed > 25 || typed === lastShift) return;
    lastShift = typed;
    onMethodChange();
  });
  shiftInput.addEventListener('change', () => {
    const typed = typedShift();
    const next = typed === null ? lastShift : RotCore.normalizeShift(typed);
    shiftInput.value = next;
    if (next !== lastShift) {
      lastShift = next;
      onMethodChange();
    }
    if (typed === null || typed !== next) showStatus('status.shiftFixed', { n: next });
  });
  $('rotn-invert').addEventListener('click', () => {
    lastShift = RotCore.inverseShift(lastShift);
    shiftInput.value = lastShift;
    onMethodChange();
    showStatus('status.inverted', { n: lastShift });
  });

  // ---------- Conversion ----------
  function renderStats() {
    if (!converted) {
      stats.textContent = '';
      fullWidthNote.hidden = true;
      return;
    }
    const s = RotCore.stats(converted.text, converted.method, converted.n);
    const scopeKey = `scope.${converted.method}`;       // scope.rot47, scope.rot13, ... (test/i18n.test.js checks them)
    stats.textContent = converted.text ? I18n.t('stats.line', { ...s, scope: I18n.t(scopeKey) }) : '';
    fullWidthNote.hidden = s.fullWidth === 0;
    fullWidthNote.textContent = s.fullWidth ? I18n.t('stats.fullWidth', { count: s.fullWidth, name: nameOf(converted.method, converted.n) }) : '';
  }

  function convert() {
    converted = { text: input.value, method: method(), n: shift() };
    output.value = RotCore.convert(converted.text, converted.method, converted.n);
    renderStats();
  }

  // The input changed: the table follows it, and an earlier guess no longer describes it
  function inputChanged() {
    renderMap();
    if (guesses) {
      guesses = { stale: true };
      renderGuesses();
    }
  }

  $('convert-button').addEventListener('click', convert);
  input.addEventListener('input', () => {
    if (live.checked) convert();
    inputChanged();
  });
  live.addEventListener('change', () => {
    if (live.checked) convert();
  });
  document.querySelectorAll('.sample-button').forEach(button => button.addEventListener('click', () => {
    input.value = button.dataset.sample === 'plain' ? PLAIN_SAMPLE : RotCore.convert(PLAIN_SAMPLE, method(), shift());
    convert();
    inputChanged();
    // ROT-N does not undo itself, so converting its sample shifts it again: say how to get the plain text back
    if (button.dataset.sample === 'cipher' && !RotCore.isSelfInverse(method(), shift())) {
      showStatus('status.sampleShifted', { n: shift(), back: RotCore.inverseShift(shift()) });
    }
  }));

  $('copy-button').addEventListener('click', async () => {
    if (!output.value) return showStatus('status.nothing');
    try {
      await navigator.clipboard.writeText(output.value);
      showStatus('status.copied');
    } catch (e) {
      // No clipboard access (for example an insecure context): select the text for a manual copy
      output.focus();
      output.select();
      showStatus('status.copyFailed');
    }
  });

  $('set-input-button').addEventListener('click', () => {
    if (!output.value) return showStatus('status.setNothing');
    input.value = output.value;
    convert();
    inputChanged();
    const n = shift();
    if (RotCore.isSelfInverse(method(), n)) showStatus('status.set');
    else showStatus('status.setShifted', { n, back: RotCore.inverseShift(n) });
  });

  // ---------- Character table ----------
  const grid = $('map-grid');
  function renderMap() {
    const m = method();
    const n = shift();
    const used = new Set(input.value);
    const map = RotCore.mapping(m, n);
    grid.setAttribute('aria-label', I18n.t('map.gridLabel', { name: nameOf(m, n) }));
    grid.replaceChildren(...map.map(({ from, to, kind }) => {
      const cell = el('li', `map-cell kind-${kind}${used.has(from) ? ' used' : ''}`);
      cell.setAttribute('aria-label', I18n.t(used.has(from) ? 'map.cellUsed' : 'map.cell', { from, to }));
      const arrow = el('span', 'map-arrow', '→');
      arrow.setAttribute('aria-hidden', 'true');
      cell.append(el('span', 'map-from', from), arrow, el('span', 'map-to', to));
      return cell;
    }));
    $('map-summary').textContent = I18n.t('map.summary', {
      name: nameOf(m, n), count: map.length, used: map.filter(({ from }) => used.has(from)).length
    });
  }

  // ---------- Method guess ----------
  const detectList = $('detect-list');
  const detectStatus = $('detect-status');
  const WEAK_SCORE = 0.8;       // below this, even the best result hardly looks like English
  const WEAK_MARGIN = 0.2;      // a lead smaller than this over the next different result is not reliable
  let guesses = null;           // the last result ({ list } or { empty } or { stale }), drawn again when the language changes

  function candidateName(c) {
    if (c.method === 'none') return I18n.t('detect.none');
    if (c.method === 'rotn') return I18n.t('detect.rotnName', { n: c.n, back: RotCore.inverseShift(c.n) });
    return nameOf(c.method, c.n);
  }

  function useCandidate(c) {
    methodInputs.forEach(radio => { radio.checked = radio.value === c.method; });
    if (c.method === 'rotn') {
      lastShift = c.n;
      shiftInput.value = c.n;
    }
    onMethodChange();
    convert();
    output.focus();
    showStatus('status.used', { name: nameOf(c.method, c.n) });
  }

  function guessMessage(list) {
    const best = list[0];
    const tied = list.filter(c => c.tie && c.score === best.score);
    const next = list.find(c => c.score < best.score);
    const weak = best.score < WEAK_SCORE || (next !== undefined && best.score - next.score < WEAK_MARGIN);
    const parts = [I18n.t('detect.result', { count: list.length, shown: Math.min(DETECT_SHOWN, list.length) })];
    if (tied.length > 1) parts.push(I18n.t('detect.tieNote', { names: tied.map(candidateName).join(I18n.t('detect.nameSep')) }));
    if (weak) parts.push(I18n.t('detect.weak'));
    return { text: parts.join(' '), tied };
  }

  function renderGuesses() {
    if (!guesses) return;
    if (!guesses.list) {
      detectStatus.textContent = I18n.t(guesses.empty ? 'detect.empty' : 'detect.stale');
      detectList.replaceChildren();
      return;
    }
    const list = guesses.list;
    const { text, tied } = guessMessage(list);
    detectStatus.textContent = text;
    // The bars compare the results with each other: the best one is full, the worst one is empty
    const best = list[0].score;
    const worst = list[list.length - 1].score;
    const percent = c => (best === worst ? 100 : Math.round(((c.score - worst) / (best - worst)) * 100));
    detectList.replaceChildren(...list.slice(0, DETECT_SHOWN).map((c, i) => {
      const top = i === 0 || tied.includes(c);
      const item = el('li', 'detect-item' + (top ? ' best' : ''));
      const head = el('div', 'detect-head');
      head.append(el('strong', 'detect-name', candidateName(c)));
      const meter = el('meter', 'detect-meter');
      meter.min = 0;
      meter.max = 100;
      meter.value = percent(c);
      meter.setAttribute('aria-label', I18n.t('detect.meter', { percent: percent(c) }));
      head.append(meter);
      if (top) head.append(el('span', 'detect-badge', I18n.t(tied.length > 1 ? 'detect.bestTie' : 'detect.best')));
      const chars = Array.from(c.text);                  // by code point, so an emoji is never cut in half
      const preview = chars.length > PREVIEW_LENGTH ? chars.slice(0, PREVIEW_LENGTH).join('') + '…' : c.text;
      item.append(head, el('p', 'detect-preview', preview));
      if (c.method !== 'none') {
        const use = el('button', 'small-button', I18n.t('detect.use', { name: nameOf(c.method, c.n) }));
        use.type = 'button';
        use.addEventListener('click', () => useCandidate(c));
        item.append(use);
      }
      return item;
    }));
  }

  $('detect-button').addEventListener('click', () => {
    // Nothing to judge without half-width letters, digits or symbols (the methods change nothing else)
    guesses = /[!-~]/.test(input.value) ? { list: RotCore.detect(input.value) } : { empty: true };
    renderGuesses();
  });

  // ---------- Help dialog ----------
  const helpButton = $('help-button');
  const helpModal = $('help-modal');
  function renderHelp() {
    $('help-body').replaceChildren(...[1, 2, 3, 4, 5, 6].flatMap(n => [el('h3', '', I18n.t(`help.s${n}.h`)), el('p', '', I18n.t(`help.s${n}.p`))]));
  }
  helpButton.addEventListener('click', () => {
    renderHelp();
    helpModal.showModal();
  });
  $('help-close').addEventListener('click', () => helpModal.close());
  // A click on the backdrop closes the dialog; a click inside it (including its padding) does not
  helpModal.addEventListener('click', event => {
    const r = helpModal.getBoundingClientRect();
    const inside = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
    if (event.target === helpModal && !inside) helpModal.close();
  });
  helpModal.addEventListener('close', () => helpButton.focus());

  // ---------- Language ----------
  // The button shows the other language's name ("English" / "日本語"), which is also its accessible name
  const langButton = $('lang-button');
  const markLangButton = () => { langButton.lang = I18n.language === 'ja' ? 'en' : 'ja'; };
  langButton.addEventListener('click', () => I18n.setLanguage(I18n.language === 'ja' ? 'en' : 'ja'));
  document.addEventListener('languagechange', () => {
    markLangButton();
    renderMethod();
    renderStats();
    renderMap();
    renderGuesses();
    if (statusMessage) status.textContent = I18n.t(statusMessage.key, statusMessage.values);
    if (helpModal.open) renderHelp();
  });
  markLangButton();
  renderMethod();
  renderStats();
  renderMap();
});
