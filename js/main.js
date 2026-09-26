// Page behaviour: conversion, samples, copy, moving the output to the input, help dialog and language.
document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
  const $ = id => document.getElementById(id);
  const input = $('input-text');
  const output = $('output-text');
  const live = $('live-convert');
  const stats = $('stats');
  const fullWidthNote = $('fullwidth-note');
  const status = $('status');
  const SAMPLES = { plain: 'Hello World! 123', cipher: RotCore.rot47('Hello World! 123') };
  const STATUS_MS = 4000;
  let statusTimer = null;       // one timer, so a new message is never cleared by an older one
  let statusKey = null;
  let converted = '';           // the input of the last conversion; the counts describe it

  function showStatus(key) {
    clearTimeout(statusTimer);
    statusKey = key;
    status.textContent = key ? I18n.t(key) : '';
    if (key) statusTimer = setTimeout(() => showStatus(null), STATUS_MS);
  }

  function renderStats() {
    const s = RotCore.stats(converted);
    stats.textContent = converted ? I18n.t('stats.line', s) : '';
    fullWidthNote.hidden = s.fullWidth === 0;
    fullWidthNote.textContent = s.fullWidth ? I18n.t('stats.fullWidth', { count: s.fullWidth }) : '';
  }

  function convert() {
    converted = input.value;
    output.value = RotCore.rot47(converted);
    renderStats();
  }

  $('convert-button').addEventListener('click', convert);
  input.addEventListener('input', () => {
    if (live.checked) convert();
  });
  live.addEventListener('change', () => {
    if (live.checked) convert();
  });
  document.querySelectorAll('.sample-button').forEach(button => button.addEventListener('click', () => {
    input.value = SAMPLES[button.dataset.sample];
    convert();
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
    showStatus('status.set');
  });

  // ---------- Help dialog ----------
  const helpButton = $('help-button');
  const helpModal = $('help-modal');
  function renderHelp() {
    $('help-body').replaceChildren(...[1, 2, 3, 4].flatMap(n => {
      const heading = document.createElement('h3');
      heading.textContent = I18n.t(`help.s${n}.h`);
      const text = document.createElement('p');
      text.textContent = I18n.t(`help.s${n}.p`);
      return [heading, text];
    }));
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
    renderStats();
    if (statusKey) status.textContent = I18n.t(statusKey);
    if (helpModal.open) renderHelp();
  });
  renderStats();
});
