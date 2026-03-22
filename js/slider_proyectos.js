// Variable global para guardar los intervalos de cada slider
let projectIntervals = {};

function moveSlide(sliderId, direction) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;

    const slides = slider.querySelectorAll('.p-slide');
    const activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));

    if (activeIndex === -1) return;

    slides[activeIndex].classList.remove('active');

    let nextIndex = (activeIndex + direction + slides.length) % slides.length;
    slides[nextIndex].classList.add('active');
}

function initProjectAutoPlay() {
    const sliders = document.querySelectorAll('.project-slider');
    
    sliders.forEach(slider => {
        const sliderId = slider.id;
        
        // Iniciar el intervalo automático
        const startInterval = () => {
            projectIntervals[sliderId] = setInterval(() => {
                moveSlide(sliderId, 1);
            }, 5000);
        };

        startInterval();

        // Pausar al entrar con el mouse y reanudar al salir
        slider.addEventListener('mouseenter', () => clearInterval(projectIntervals[sliderId]));
        slider.addEventListener('mouseleave', () => startInterval());
        
        // Si hay botones prev/next, que reinicien el tiempo al hacer clic
        const btns = slider.querySelectorAll('button');
        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                clearInterval(projectIntervals[sliderId]);
                // No reanudamos aquí, dejamos que el 'mouseleave' lo haga 
                // o lo reanudamos tras 2 segundos de inactividad:
                setTimeout(startInterval, 2000); 
            });
        });
    });
}

// AL ESTAR EN EL INDEX: Esto se dispara apenas carga la página
document.addEventListener('DOMContentLoaded', initProjectAutoPlay);
