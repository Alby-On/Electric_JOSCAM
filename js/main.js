window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section, header');
        const navItems = document.querySelectorAll('.nav-links li a');
        const scrollValue = window.pageYOffset;

        sections.forEach(section => {
            if (scrollValue >= (section.offsetTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href').includes(current)) a.classList.add('active');
        });

        const s1 = document.querySelector('.shape-1');
        const s2 = document.querySelector('.shape-2');
        const s3 = document.querySelector('.shape-3');

        if(s1) s1.style.transform = `translate(${scrollValue * 0.1}px, ${scrollValue * 0.05}px) rotate(${45 + scrollValue * 0.1}deg)`;
        if(s2) s2.style.transform = `translateY(${scrollValue * -0.08}px) scale(${1 + (scrollValue * 0.0002)})`;
        if(s3) s3.style.transform = `translateX(${scrollValue * 0.12}px) rotate(-45deg)`;
    });

document.getElementById("contact-form").addEventListener("submit", function(e) {
  e.preventDefault(); // Evita que la página se recargue o se vaya a la web de Web3Forms

  const myForm = e.target;
  const formData = new FormData(myForm);
  const object = Object.fromEntries(formData);
  const json = JSON.stringify(object);

  // Cambiamos el fetch para que apunte a Web3Forms
  fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: json,
  })
  .then(async (response) => {
    if (response.status == 200) {
      // 1. Mostrar tu mensaje flotante (Toast)
      const toast = document.getElementById("toast-success");
      toast.style.display = "block";
      toast.style.opacity = "1"; // Aseguramos que sea visible

      // 2. Limpiar el formulario
      myForm.reset();

      // 3. Desaparecer el mensaje tras 5 segundos
      setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "opacity 0.5s ease";
        setTimeout(() => { 
          toast.style.display = "none"; 
        }, 500);
      }, 5000);
    } else {
      alert("Algo salió mal al enviar el mensaje.");
    }
  })
  .catch((error) => {
    console.log(error);
    alert("Error al enviar: " + error);
  });
});
// --- Lógica Menú Móvil ---
const openBtn = document.getElementById('open-menu');
const closeBtn = document.getElementById('close-menu');
const overlay = document.getElementById('mobile-overlay');
const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

// Abrir
openBtn.addEventListener('click', () => {
    overlay.classList.add('active');
});

// Cerrar
const closeFunction = () => {
    overlay.classList.remove('active');
};

closeBtn.addEventListener('click', closeFunction);

// Cerrar cuando se hace clic en un link (para navegar a la sección)
mobileLinks.forEach(link => {
    link.addEventListener('click', closeFunction);
});
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.25 // Se activa cuando el 25% de la sección es visible
    };

    const aboutObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animar el título y la intro primero
                entry.target.querySelector('.section-title').style.opacity = "1";
                
                // Animar los ítems de la cuadrícula con delay secuencial
                const items = entry.target.querySelectorAll('.about-item');
                items.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.add('show');
                    }, index * 200); // 200ms de diferencia entre cada uno
                });

                // Animar los sellos del final
                const seals = entry.target.querySelectorAll('.seal-modern');
                seals.forEach((seal, index) => {
                    setTimeout(() => {
                        seal.classList.add('show');
                    }, 800 + (index * 150));
                });

                aboutObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const aboutSection = document.querySelector('#nosotros');
    if (aboutSection) {
        aboutObserver.observe(aboutSection);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const whyChooseObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Buscamos todas las tarjetas dentro de esta sección
                const cards = entry.target.querySelectorAll('.animate-up');
                cards.forEach((card) => {
                    // La clase 'visible' activa la transición definida en el CSS
                    card.classList.add('visible');
                });
                // Una vez activada, dejamos de observar para ahorrar recursos
                whyChooseObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 }); // Se activa al ver el 15% de la sección

    const targetSection = document.querySelector('#porque-elegirnos');
    if (targetSection) whyChooseObserver.observe(targetSection);
});
