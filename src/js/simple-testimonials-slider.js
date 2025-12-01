/**
 * Simple Testimonials Slider
 * Works with static HTML slides rendered by 11ty/Nunjucks
 */
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        const sliders = document.querySelectorAll('.testimonials-slider');

        sliders.forEach(function(slider) {
            const slides = slider.querySelectorAll('.testimonials-slider__slide');
            const dots = slider.querySelectorAll('.testimonials-slider__dot');

            if (slides.length === 0) return;

            let currentIndex = 0;
            let autoPlayInterval = null;
            const autoPlayDelay = 5000;

            function goToSlide(index) {
                // Ensure index is in bounds
                if (index < 0) index = slides.length - 1;
                if (index >= slides.length) index = 0;

                // Update slides
                slides.forEach(function(slide, i) {
                    if (i === index) {
                        slide.classList.add('active');
                        slide.setAttribute('aria-hidden', 'false');
                    } else {
                        slide.classList.remove('active');
                        slide.setAttribute('aria-hidden', 'true');
                    }
                });

                // Update dots
                dots.forEach(function(dot, i) {
                    if (i === index) {
                        dot.classList.add('active');
                        dot.setAttribute('aria-selected', 'true');
                    } else {
                        dot.classList.remove('active');
                        dot.setAttribute('aria-selected', 'false');
                    }
                });

                currentIndex = index;
            }

            function nextSlide() {
                goToSlide(currentIndex + 1);
            }

            function startAutoPlay() {
                stopAutoPlay();
                autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
            }

            function stopAutoPlay() {
                if (autoPlayInterval) {
                    clearInterval(autoPlayInterval);
                    autoPlayInterval = null;
                }
            }

            // Click handlers for dots
            dots.forEach(function(dot, index) {
                dot.addEventListener('click', function() {
                    goToSlide(index);
                    startAutoPlay(); // Reset autoplay timer
                });
            });

            // Pause on hover
            slider.addEventListener('mouseenter', stopAutoPlay);
            slider.addEventListener('mouseleave', startAutoPlay);

            // Keyboard navigation
            slider.setAttribute('tabindex', '0');
            slider.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    goToSlide(currentIndex - 1);
                    startAutoPlay();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    goToSlide(currentIndex + 1);
                    startAutoPlay();
                }
            });

            // Touch swipe support
            let touchStartX = 0;
            let touchEndX = 0;

            slider.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            slider.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchStartX - touchEndX;
                if (Math.abs(diff) > 50) {
                    if (diff > 0) {
                        goToSlide(currentIndex + 1);
                    } else {
                        goToSlide(currentIndex - 1);
                    }
                    startAutoPlay();
                }
            }, { passive: true });

            // Start autoplay
            startAutoPlay();

            // Pause when page is hidden
            document.addEventListener('visibilitychange', function() {
                if (document.hidden) {
                    stopAutoPlay();
                } else {
                    startAutoPlay();
                }
            });
        });
    });
})();
