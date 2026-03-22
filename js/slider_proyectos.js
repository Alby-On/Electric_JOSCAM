function initProjectSliders() {
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const images = card.querySelectorAll('.slider-wrapper img');
        const nextBtn = card.querySelector('.next');
        const prevBtn = card.querySelector('.prev');
        let index = 0;

        const changeImage = (newIndex) => {
            images[index].classList.remove('active');
            index = (newIndex + images.length) % images.length;
            images[index].classList.add('active');
        };

        if(nextBtn) nextBtn.addEventListener('click', () => changeImage(index + 1));
        if(prevBtn) prevBtn.addEventListener('click', () => changeImage(index - 1));

        // Rotación automática
        setInterval(() => {
            changeImage(index + 1);
        }, 4000);
    });
}

// Llama a esta función dentro de tu DOMContentLoaded o después de cargar el componente.
