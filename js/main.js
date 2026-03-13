// --- 1. Funciones de Carga de Componentes ---
async function loadComponent(id, path) {
    const container = document.getElementById(id);
    if (!container) return; 

    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`No se encontró ${path}`);
        const html = await response.text();
        container.innerHTML = html;
        console.log(`Componente ${id} cargado con éxito.`);

        // Si cargamos el header, inicializamos el menú móvil
        if (id === 'header-component') {
            initMobileMenu();
        }
    } catch (error) {
        console.error("Error cargando componentes:", error);
    }
}

// --- 2. Lógica Menú Móvil (Encapsulada para evitar errores de null) ---
function initMobileMenu() {
    const openBtn = document.getElementById('open-menu');
    const closeBtn = document.getElementById('close-menu');
    const overlay = document.getElementById('mobile-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    if (openBtn && overlay) {
        openBtn.addEventListener('click', () => {
            overlay.classList.add('active');
        });
    }

    const closeFunction = () => {
        if (overlay) overlay.classList.remove('active');
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', closeFunction);
    }

    if (mobileLinks) {
        mobileLinks.forEach(link => {
            link.addEventListener('click', closeFunction);
        });
    }
}

// --- 3. Eventos Globales y Scroll ---
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section, header');
    const navItems = document.querySelectorAll('.nav-links li a');
    const scrollValue = window.pageYOffset;

    // Ajustamos a 180 para considerar la altura de la Top Bar + Navbar
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollValue >= (sectionTop - 180)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(a => {
        a.classList.remove('active');
        // Solo añadimos 'active' si hay un ID actual detectado
        if (current && a.getAttribute('href').includes(current)) {
            a.classList.add('active');
        }
    });

    // --- Efectos Parallax (Shapes) ---
    const s1 = document.querySelector('.shape-1');
    const s2 = document.querySelector('.shape-2');
    const s3 = document.querySelector('.shape-3');

    if(s1) s1.style.transform = `translate(${scrollValue * 0.1}px, ${scrollValue * 0.05}px) rotate(${45 + scrollValue * 0.1}deg)`;
    if(s2) s2.style.transform = `translateY(${scrollValue * -0.08}px) scale(${1 + (scrollValue * 0.0002)})`;
    if(s3) s3.style.transform = `translateX(${scrollValue * 0.12}px) rotate(-45deg)`;
});

// --- 4. Formulario de Contacto ---
const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const myForm = e.target;
        const formData = new FormData(myForm);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: json,
        })
        .then(async (response) => {
            if (response.status == 200) {
                const toast = document.getElementById("toast-success");
                if (toast) {
                    toast.style.display = "block";
                    toast.style.opacity = "1";
                    setTimeout(() => {
                        toast.style.opacity = "0";
                        toast.style.transition = "opacity 0.5s ease";
                        setTimeout(() => { toast.style.display = "none"; }, 500);
                    }, 5000);
                }
                myForm.reset();
            } else {
                alert("Algo salió mal al enviar el mensaje.");
            }
        })
        .catch((error) => {
            console.log(error);
            alert("Error al enviar: " + error);
        });
    });
}

// --- 5. Delegación de Clics (Botones en componentes) ---
document.addEventListener('click', function (event) {
    if (event.target.matches('.btn-contacto') || event.target.closest('.btn-contacto')) {
        console.log("Clic detectado en el botón de contacto");
    }
    if (event.target.matches('.cta-button')) {
        console.log("Clic en el botón del Hero");
    }
});

// --- 6. Inicialización al cargar el DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // Carga de componentes
    loadComponent('header-component', 'components/header.html');
    loadComponent('footer-component', 'components/footer.html');

    // Observador Nosotros
    const observerOptions = { threshold: 0.25 };
    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const title = entry.target.querySelector('.section-title');
                if (title) title.style.opacity = "1";
                
                const items = entry.target.querySelectorAll('.about-item');
                items.forEach((item, index) => {
                    setTimeout(() => { item.classList.add('show'); }, index * 200);
                });

                const seals = entry.target.querySelectorAll('.seal-modern');
                seals.forEach((seal, index) => {
                    setTimeout(() => { seal.classList.add('show'); }, 800 + (index * 150));
                });
                aboutObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const aboutSection = document.querySelector('#nosotros');
    if (aboutSection) aboutObserver.observe(aboutSection);

    // Observador Porque Elegirnos
    const whyChooseObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const cards = entry.target.querySelectorAll('.animate-up');
                cards.forEach((card) => { card.classList.add('visible'); });
                whyChooseObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    const targetSection = document.querySelector('#porque-elegirnos');
    if (targetSection) whyChooseObserver.observe(targetSection);
});
