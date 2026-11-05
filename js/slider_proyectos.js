/* ======================================================
   Galerías de proyectos + visor de fotos
====================================================== */

const AUTOPLAY_MS = 5000;

function initProjectSlider(slider) {
    const slides = Array.from(slider.querySelectorAll('.p-slide'));
    if (!slides.length) return;

    let index = Math.max(0, slides.findIndex((s) => s.classList.contains('active')));
    let timer = null;

    // Fondo desenfocado: se asigna solo cuando la foto se necesita
    const prepare = (i) => {
        const slide = slides[(i + slides.length) % slides.length];
        if (slide.dataset.ready) return;
        const img = slide.querySelector('img');
        slide.style.backgroundImage = `url("${img.getAttribute('src')}")`;
        img.loading = 'eager';
        slide.dataset.ready = '1';
    };

    // Controles
    const prev = document.createElement('button');
    prev.className = 'slider-btn prev';
    prev.setAttribute('aria-label', 'Foto anterior');
    prev.innerHTML = '<i class="fas fa-chevron-left"></i>';

    const next = document.createElement('button');
    next.className = 'slider-btn next';
    next.setAttribute('aria-label', 'Foto siguiente');
    next.innerHTML = '<i class="fas fa-chevron-right"></i>';

    const dots = document.createElement('div');
    dots.className = 'slider-dots';
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', `Ver foto ${i + 1}`);
        dot.addEventListener('click', (e) => { e.stopPropagation(); go(i); restart(); });
        dots.appendChild(dot);
    });

    const count = document.createElement('span');
    count.className = 'slider-count';

    slider.append(prev, next, dots, count);

    function go(i) {
        slides[index].classList.remove('active');
        index = (i + slides.length) % slides.length;
        prepare(index);
        prepare(index + 1);
        slides[index].classList.add('active');
        dots.querySelectorAll('button').forEach((d, k) => d.classList.toggle('active', k === index));
        count.textContent = `${index + 1} / ${slides.length}`;
    }

    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { if (!timer) timer = setInterval(() => go(index + 1), AUTOPLAY_MS); };
    const restart = () => { stop(); start(); };

    prev.addEventListener('click', (e) => { e.stopPropagation(); go(index - 1); restart(); });
    next.addEventListener('click', (e) => { e.stopPropagation(); go(index + 1); restart(); });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    // Deslizar con el dedo
    let touchX = null;
    slider.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; stop(); }, { passive: true });
    slider.addEventListener('touchend', (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touchX = null;
        start();
    });

    // Abrir visor
    slider.addEventListener('click', (e) => {
        if (e.target.closest('.p-slide')) openLightbox(slides.map((s) => s.querySelector('img')), index);
    });

    // Solo reproducir cuando la galería está en pantalla
    const io = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) start(); else stop();
    }, { threshold: 0.3 });
    io.observe(slider);

    go(index);
}

/* --------- Visor de fotos (lightbox) --------- */
const lightbox = {
    el: null, img: null, list: [], index: 0
};

function openLightbox(images, start) {
    if (!lightbox.el) return;
    lightbox.list = images;
    showLightbox(start);
    lightbox.el.classList.add('open');
    lightbox.el.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}

function showLightbox(i) {
    lightbox.index = (i + lightbox.list.length) % lightbox.list.length;
    const source = lightbox.list[lightbox.index];
    lightbox.img.src = source.getAttribute('src');
    lightbox.img.alt = source.alt;
}

function closeLightbox() {
    lightbox.el.classList.remove('open');
    lightbox.el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function initLightbox() {
    lightbox.el = document.getElementById('lightbox');
    if (!lightbox.el) return;
    lightbox.img = lightbox.el.querySelector('img');

    lightbox.el.querySelector('.lb-close').addEventListener('click', closeLightbox);
    lightbox.el.querySelector('.lb-prev').addEventListener('click', () => showLightbox(lightbox.index - 1));
    lightbox.el.querySelector('.lb-next').addEventListener('click', () => showLightbox(lightbox.index + 1));
    lightbox.el.addEventListener('click', (e) => { if (e.target === lightbox.el) closeLightbox(); });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.el.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showLightbox(lightbox.index - 1);
        if (e.key === 'ArrowRight') showLightbox(lightbox.index + 1);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initLightbox();
    document.querySelectorAll('.project-slider').forEach(initProjectSlider);
});
