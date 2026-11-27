(() => {
  'use strict';

  const prompts = {
    study: {
      before: 'Розкажи про фотосинтез.',
      after: 'Ти — репетитор з біології. Поясни фотосинтез учню 9 класу: одна аналогія та 3 запитання для самоперевірки. Відповіді поки не показуй.',
    },
    explain: {
      before: 'Поясни цикли в Python.',
      after: 'Ти — викладач Python. Я знаю змінні та списки. Порівняй for і while на двох прикладах. Дай вправу без розв’язку.',
    },
    plan: {
      before: 'Зроби план підготовки.',
      after: 'Ти — репетитор з математики. До контрольної з квадратних рівнянь 7 днів, маю 30 хвилин щодня. Склади план: тема, вправа, самоперевірка.',
    },
  };

  const promptControls = document.querySelector('[data-prompt-controls]');
  promptControls.hidden = false;
  const promptButtons = [...promptControls.querySelectorAll('button')];
  promptButtons.forEach(button => {
    button.addEventListener('click', () => {
      const example = prompts[button.dataset.prompt];
      document.querySelector('#prompt-before').textContent = example.before;
      document.querySelector('#prompt-after').textContent = example.after;
      promptButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    });
  });

  // Keep initials visible when a portrait is unavailable.
  document.querySelectorAll('.portrait img').forEach(img => {
    const hideFailedImage = () => { img.hidden = true; };
    img.addEventListener('error', hideFailedImage);
    if (img.complete && img.naturalWidth === 0) hideFailedImage();
  });

  const slides = [...document.querySelectorAll('.slide')];
  const startButton = document.querySelector('[data-presentation-start]');
  const endButton = document.querySelector('[data-presentation-end]');
  const controls = document.querySelector('.presentation-controls');
  const previousButton = document.querySelector('[data-previous]');
  const nextButton = document.querySelector('[data-next]');
  const status = document.querySelector('[data-slide-status]');
  let presenting = false;
  let currentSlide = 0;
  let updateScheduled = false;
  startButton.hidden = false;

  function nearestSlide() {
    // Keep a tall section active until its successor reaches the viewport.
    const readingLine = Math.min(window.innerHeight / 3, 160);
    let active = 0;
    slides.forEach((slide, index) => {
      if (slide.getBoundingClientRect().top <= readingLine) active = index;
    });
    return active;
  }

  function updateControls() {
    currentSlide = nearestSlide();
    status.textContent = `${currentSlide + 1} / ${slides.length}`;
    status.title = slides[currentSlide].dataset.slideTitle;
    previousButton.disabled = currentSlide === 0;
    nextButton.disabled = currentSlide === slides.length - 1;
  }

  function goTo(index) {
    const target = Math.max(0, Math.min(index, slides.length - 1));
    // Immediate navigation also handles repeated key presses predictably.
    slides[target].scrollIntoView({ behavior: 'instant', block: 'start' });
    updateControls();
  }

  function setPresentation(enabled) {
    const target = nearestSlide();
    presenting = enabled;
    document.documentElement.classList.toggle('presenting', enabled);
    document.body.classList.toggle('presenting', enabled);
    controls.hidden = !enabled;
    slides[target].scrollIntoView({ behavior: 'instant', block: 'start' });
    updateControls();
    if (enabled) endButton.focus({ preventScroll: true });
    else startButton.focus({ preventScroll: true });
  }

  startButton.addEventListener('click', () => setPresentation(true));
  endButton.addEventListener('click', () => setPresentation(false));
  previousButton.addEventListener('click', () => goTo(currentSlide - 1));
  nextButton.addEventListener('click', () => goTo(currentSlide + 1));

  window.addEventListener('resize', () => {
    if (presenting) updateControls();
  });

  window.addEventListener('scroll', () => {
    if (!presenting || updateScheduled) return;
    updateScheduled = true;
    window.requestAnimationFrame(() => {
      updateControls();
      updateScheduled = false;
    });
  }, { passive: true });

  window.addEventListener('keydown', event => {
    if (!presenting || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setPresentation(false);
      return;
    }
    // Leave cursor navigation and editing keys to editable controls.
    if (event.target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')) return;
    let target;
    if (['ArrowRight', 'PageDown'].includes(event.key)) target = currentSlide + 1;
    if (['ArrowLeft', 'PageUp'].includes(event.key)) target = currentSlide - 1;
    if (event.key === 'Home') target = 0;
    if (event.key === 'End') target = slides.length - 1;
    if (target === undefined) return;
    event.preventDefault();
    goTo(target);
  });
})();
