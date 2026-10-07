/* The carousel shares the planner's destination names and selection state. */
(() => {
  const hero = document.querySelector('.hero');
  const photo = hero?.querySelector('.hero-photo');
  const bottom = hero?.querySelector('.hero-bottom');
  const cards = [...document.querySelectorAll('.destination')];
  const slides = cards.map(card => ({
    image: card.querySelector('img'),
    button: card.querySelector('.add-destination'),
    title: card.querySelector('h3')?.textContent.trim(),
    location: card.querySelector('.location')?.textContent.trim()
  })).filter(slide => slide.image && slide.button);
  if (!photo || !bottom || slides.length < 2) return;
  const en = document.documentElement.lang.startsWith('en');
  const copy = en ? {prev:'Previous destination', next:'Next destination', pause:'Pause slideshow', play:'Play slideshow', view:'View my trip', label:'Explore destinations', selected:'Selected', add:'Add to my trip'} : {prev:'Destino anterior', next:'Siguiente destino', pause:'Pausar fotos', play:'Reproducir fotos', view:'Ver mi viaje', label:'Explora los destinos', selected:'Agregado', add:'Agregar a mi viaje'};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0, timer, paused = reduced.matches, touching = null;
  const images = slides.map((slide, i) => {
    const img = i === 0 ? photo : document.createElement('img');
    img.className = 'hero-photo carousel-photo';
    img.src = slide.image.src;
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.style.objectPosition = i === 0 ? '' : 'center';
    img.classList.toggle('is-current', i === 0);
    if (i) {img.decoding = 'async'; hero.insertBefore(img, hero.querySelector('.hero-shade'));}
    return img;
  });
  bottom.replaceChildren();
  bottom.classList.add('carousel-panel');
  bottom.setAttribute('role', 'group');
  bottom.setAttribute('aria-label', copy.label);
  const info = document.createElement('div'); info.className = 'carousel-info';
  const title = document.createElement('strong');
  const location = document.createElement('span');
  info.append(title, location);
  const actions = document.createElement('div'); actions.className = 'carousel-actions';
  const add = document.createElement('button'); add.type = 'button'; add.className = 'add-destination carousel-add';
  const view = document.createElement('a'); view.href = '#planifica'; view.textContent = copy.view + ' ↗';
  actions.append(add, view);
  const nav = document.createElement('div'); nav.className = 'carousel-nav';
  function control(label, text, handler) {
    const button = document.createElement('button'); button.type = 'button'; button.setAttribute('aria-label', label); button.title = label; button.textContent = text; button.addEventListener('click', handler); return button;
  }
  const previous = control(copy.prev, '←', () => change(current - 1));
  const next = control(copy.next, '→', () => change(current + 1));
  const playback = control(copy.pause, 'Ⅱ', () => {paused = !paused; syncPlayback(); schedule();});
  const count = document.createElement('span'); count.className = 'carousel-count';
  nav.append(previous, count, next, playback);
  bottom.append(info, actions, nav);
  hero.classList.add('has-carousel');
  placeButtons.push(add);
  add.addEventListener('click', () => slides[current].button.click());
  view.addEventListener('click', editTrip);
  function syncPlayback() {
    playback.textContent = paused ? '▶' : 'Ⅱ';
    playback.setAttribute('aria-label', paused ? copy.play : copy.pause);
    playback.title = paused ? copy.play : copy.pause;
  }
  function schedule() {
    clearTimeout(timer);
    if (!paused && !document.hidden && !hero.contains(document.activeElement)) timer = setTimeout(() => change(current + 1), 6500);
  }
  function change(index) {
    current = (index + slides.length) % slides.length;
    images.forEach((img, i) => img.classList.toggle('is-current', i === current));
    const slide = slides[current];
    title.textContent = slide.title;
    location.textContent = slide.location;
    count.textContent = `${String(current + 1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    add.dataset.place = slide.button.dataset.place;
    updatePlaces();
    schedule();
  }
  hero.addEventListener('focusin', () => clearTimeout(timer));
  hero.addEventListener('focusout', () => setTimeout(schedule, 0));
  hero.addEventListener('pointerenter', event => {if (event.pointerType === 'mouse') clearTimeout(timer);});
  hero.addEventListener('pointerleave', schedule);
  hero.addEventListener('touchstart', event => {touching = {x:event.touches[0].clientX,y:event.touches[0].clientY};clearTimeout(timer);}, {passive:true});
  hero.addEventListener('touchend', event => {
    if (!touching) return;
    const dx = event.changedTouches[0].clientX - touching.x, dy = event.changedTouches[0].clientY - touching.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) change(current + (dx < 0 ? 1 : -1));
    touching = null; schedule();
  }, {passive:true});
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => {paused = reduced.matches; syncPlayback(); schedule();});
  syncPlayback(); change(0);
})();
