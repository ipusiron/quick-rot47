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

  const method = () => methodInputs.find(radio => radio.checked).value;
  const shift = () => RotCore.normalizeShift(shiftInput.value);
  const nameOf = (m, n) => (m === 'rotn' ? 'ROT-' + n : m.toUpperCase());
  const currentName = () => nameOf(method(), shift());

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
  shiftInput.addEventListener('input', () => {
    if (shiftInput.value !== '') onMethodChange();
  });
  shiftInput.addEventListener('change', () => {
    shiftInput.value = shift();              // show the shift that is actually used (1 to 25)
    onMethodChange();
  });
  $('rotn-invert').addEventListener('click', () => {
    shiftInput.value = RotCore.inverseShift(shift());
    onMethodChange();
    showStatus('status.inverted', { n: shift() });
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

  $('convert-button').addEventListener('click', convert);
  input.addEventListener('input', () => {
    if (live.checked) convert();
    renderMap();
  });
  live.addEventListener('change', () => {
    if (live.checked) convert();
  });
  document.querySelectorAll('.sample-button').forEach(button => button.addEventListener('click', () => {
    input.value = button.dataset.sample === 'plain' ? PLAIN_SAMPLE : RotCore.convert(PLAIN_SAMPLE, method(), shift());
    convert();
    renderMap();
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
    renderMap();
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
  let guesses = null;           // the last result, drawn again when the language changes

  function candidateName(c) {
    if (c.method === 'none') return I18n.t('detect.none');
    if (c.method === 'rotn') return I18n.t('detect.rotnName', { n: c.n, back: RotCore.inverseShift(c.n) });
    return nameOf(c.method, c.n);
  }

  function useCandidate(c) {
    methodInputs.forEach(radio => { radio.checked = radio.value === c.method; });
    if (c.method === 'rotn') shiftInput.value = c.n;
    onMethodChange();
    convert();
    output.focus();
    showStatus('status.used', { name: nameOf(c.method, c.n) });
  }

  function renderGuesses() {
    if (!guesses) return;
    if (guesses.empty) {
      detectStatus.textContent = I18n.t('detect.empty');
      detectList.replaceChildren();
      return;
    }
    const best = guesses.list[0];
    detectStatus.textContent = best.score === 0 ? I18n.t('detect.noLetters') : I18n.t('detect.result', { count: guesses.list.length });
    if (best.score === 0) return detectList.replaceChildren();
    const top = best.score;
    detectList.replaceChildren(...guesses.list.slice(0, DETECT_SHOWN).map((c, i) => {
      const item = el('li', 'detect-item' + (i === 0 ? ' best' : ''));
      const head = el('div', 'detect-head');
      head.append(el('strong', 'detect-name', candidateName(c)));
      const meter = el('meter', 'detect-meter');
      meter.min = 0;
      meter.max = top;
      meter.value = c.score;
      meter.setAttribute('aria-label', I18n.t('detect.meter', { percent: Math.round((c.score / top) * 100) }));
      head.append(meter);
      if (i === 0) head.append(el('span', 'detect-badge', I18n.t('detect.best')));
      const preview = c.text.length > PREVIEW_LENGTH ? c.text.slice(0, PREVIEW_LENGTH) + '…' : c.text;
      item.append(head, el('p', 'detect-preview', preview));
      if (c.method !== 'none') {
        const use = el('button', 'small-button', I18n.t('detect.use'));
        use.type = 'button';
        use.addEventListener('click', () => useCandidate(c));
        item.append(use);
      }
      return item;
    }));
  }

  $('detect-button').addEventListener('click', () => {
    guesses = input.value.trim() ? { list: RotCore.detect(input.value) } : { empty: true };
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
  helpModal.addEventListener('click', event => {
    if (event.target === helpModal) helpModal.close();
  });
  helpModal.addEventListener('close', () => helpButton.focus());

  // ---------- Language ----------
  $('lang-button').addEventListener('click', () => I18n.setLanguage(I18n.language === 'ja' ? 'en' : 'ja'));
  document.addEventListener('languagechange', () => {
    renderMethod();
    renderStats();
    renderMap();
    renderGuesses();
    if (statusMessage) status.textContent = I18n.t(statusMessage.key, statusMessage.values);
    if (helpModal.open) renderHelp();
  });
  renderMethod();
  renderStats();
  renderMap();
});
