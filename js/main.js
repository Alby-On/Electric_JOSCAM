/* ======================================================
   Electric_JOSCAM · Script principal
====================================================== */

// --- 1. Carga de componentes (header y footer) ---
async function loadComponent(id, path) {
    const container = document.getElementById(id);
    if (!container) return;
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`No se encontró ${path}`);
        container.innerHTML = await response.text();
    } catch (error) {
        console.error('Error cargando componentes:', error);
    }
}

// --- 2. Menú móvil ---
function initMobileMenu() {
    const openBtn = document.getElementById('open-menu');
    const closeBtn = document.getElementById('close-menu');
    const overlay = document.getElementById('mobile-overlay');
    if (!openBtn || !overlay) return;

    const setOpen = (open) => {
        overlay.classList.toggle('active', open);
        overlay.setAttribute('aria-hidden', String(!open));
        openBtn.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
        if (open && closeBtn) closeBtn.focus();
    };

    openBtn.addEventListener('click', () => setOpen(true));
    if (closeBtn) closeBtn.addEventListener('click', () => setOpen(false));

    // Cerrar al tocar el fondo oscuro o un enlace
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) setOpen(false);
    });
}

// --- 3. Header: sombra al hacer scroll + enlace activo ---
function initHeaderState() {
    const header = document.getElementById('site-header');
    const onScroll = () => {
        if (header) header.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const links = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('main section[id]');
    if (!links.length || !sections.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${id}`));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((s) => observer.observe(s));
}

// --- 4. Animaciones al aparecer ---
function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
        items.forEach((el) => el.classList.add('visible'));
        return;
    }
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            // Escalonar tarjetas hermanas
            const siblings = Array.from(el.parentElement.children).filter((c) => c.classList.contains('reveal'));
            const index = siblings.indexOf(el);
            el.style.transitionDelay = `${Math.min(index, 5) * 90}ms`;
            el.classList.add('visible');
            observer.unobserve(el);
        });
    }, { threshold: 0.12 });
    items.forEach((el) => observer.observe(el));
}

// --- 5. Aviso (toast) ---
let toastTimer;
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.querySelector('.toast-text').textContent = message;
    toast.querySelector('i').className = isError ? 'fas fa-circle-exclamation' : 'fas fa-circle-check';
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 5000);
}

// --- 6. Formulario de contacto (Web3Forms) ---
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const messages = {
        nombre: 'Ingresa tu nombre (mínimo 3 letras).',
        telefono: 'Ingresa los 9 dígitos de tu móvil, por ejemplo 912345678.',
        email: 'Ingresa un correo válido.',
        asunto: 'Indica el asunto de tu mensaje.',
        mensaje: 'Cuéntanos un poco más (mínimo 10 caracteres).'
    };

    const validateField = (field) => {
        const group = field.closest('.form-group');
        if (!group) return true;
        let error = group.querySelector('.field-error');
        if (field.checkValidity()) {
            group.classList.remove('invalid');
            if (error) error.remove();
            return true;
        }
        group.classList.add('invalid');
        if (!error) {
            error = document.createElement('span');
            error.className = 'field-error';
            group.appendChild(error);
        }
        error.textContent = messages[field.name] || 'Revisa este campo.';
        return false;
    };

    const fields = form.querySelectorAll('input[required], textarea[required]');
    fields.forEach((f) => {
        f.addEventListener('blur', () => validateField(f));
        f.addEventListener('input', () => {
            if (f.closest('.form-group').classList.contains('invalid')) validateField(f);
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        let firstInvalid = null;
        fields.forEach((f) => {
            if (!validateField(f) && !firstInvalid) firstInvalid = f;
        });
        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }

        const button = form.querySelector('button[type="submit"]');
        const label = button.querySelector('.btn-label');
        const original = label.textContent;
        button.disabled = true;
        label.textContent = 'Enviando...';

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            });
            if (response.ok) {
                showToast('¡Mensaje enviado con éxito! Nos contactaremos pronto.');
                form.reset();
            } else {
                showToast('No pudimos enviar el mensaje. Intenta de nuevo o escríbenos por WhatsApp.', true);
            }
        } catch (error) {
            console.error(error);
            showToast('Sin conexión. Revisa tu internet o escríbenos por WhatsApp.', true);
        } finally {
            button.disabled = false;
            label.textContent = original;
        }
    });
}

// --- 7. Animaciones interactivas ---
function initMotion() {
    const progress = document.getElementById('scroll-progress');
    const toTop = document.getElementById('back-to-top');
    let ticking = false;

    const update = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = max > 0 ? window.scrollY / max : 0;
        if (progress) progress.style.transform = `scaleX(${ratio})`;
        if (toTop) toTop.classList.toggle('show', window.scrollY > 700);
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Foco de luz que sigue al mouse en las tarjetas oscuras
    document.querySelectorAll('.why-card').forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
    });
}

// --- 8. Inicio ---
document.addEventListener('DOMContentLoaded', async () => {
    initReveal();
    initContactForm();
    initMotion();

    await Promise.all([
        loadComponent('header-component', 'components/header.html'),
        loadComponent('footer-component', 'components/footer.html')
    ]);

    initMobileMenu();
    initHeaderState();

    const year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
});
