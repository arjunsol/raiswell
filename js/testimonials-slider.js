/**
 * Testimonials Slider Component
 *
 * A vanilla JavaScript slider for displaying customer testimonials with:
 * - Auto-rotation with configurable interval
 * - Dot navigation
 * - Pause on hover
 * - Touch swipe support
 * - Fade transitions
 * - Accessibility features (ARIA attributes)
 * - Multiple instances support
 */

class TestimonialsSlider {
    /**
     * Create a testimonials slider instance
     * @param {HTMLElement} element - The container element with [data-testimonials]
     * @param {Array} testimonials - Array of testimonial objects from XML
     * @param {Object} options - Configuration options
     */
    constructor(element, testimonials, options = {}) {
        if (!element || !testimonials || testimonials.length === 0) {
            console.warn('TestimonialsSlider: Invalid element or testimonials data');
            return;
        }

        this.element = element;
        this.testimonials = testimonials;
        this.options = {
            autoPlayInterval: options.autoPlayInterval || 5000,
            transitionDuration: options.transitionDuration || 600,
            pauseOnHover: options.pauseOnHover !== false,
            enableSwipe: options.enableSwipe !== false,
            showRating: options.showRating !== false,
            ...options
        };

        this.currentIndex = 0;
        this.isTransitioning = false;
        this.autoPlayTimer = null;
        this.touchStartX = 0;
        this.touchEndX = 0;

        this.slidesContainer = null;
        this.dotsContainer = null;
        this.slides = [];
        this.dots = [];

        this.init();
    }

    /**
     * Initialize the slider
     */
    init() {
        if (this.testimonials.length === 0) {
            this.element.style.display = 'none';
            return;
        }

        this.findContainers();
        this.createSlides();
        this.createDots();
        this.bindEvents();
        this.goToSlide(0);
        this.startAutoPlay();

        // Add accessibility attributes to container
        this.element.setAttribute('role', 'region');
        this.element.setAttribute('aria-label', 'Customer testimonials');
    }

    /**
     * Find or create necessary container elements
     */
    findContainers() {
        this.slidesContainer = this.element.querySelector('.testimonials-slider__slides');
        this.dotsContainer = this.element.querySelector('.testimonials-slider__dots');

        if (!this.slidesContainer) {
            console.error('TestimonialsSlider: .testimonials-slider__slides container not found');
        }

        if (!this.dotsContainer) {
            console.error('TestimonialsSlider: .testimonials-slider__dots container not found');
        }
    }

    /**
     * Create slide elements from testimonials data
     */
    createSlides() {
        if (!this.slidesContainer) return;

        this.slidesContainer.innerHTML = '';
        this.slides = [];

        this.testimonials.forEach((testimonial, index) => {
            const slide = document.createElement('div');
            slide.className = 'testimonials-slider__slide';
            slide.setAttribute('role', 'tabpanel');
            slide.setAttribute('aria-label', `Testimonial ${index + 1} of ${this.testimonials.length}`);
            slide.setAttribute('aria-hidden', index !== 0 ? 'true' : 'false');

            // Build rating stars HTML if rating exists and showRating is enabled
            let ratingHTML = '';
            if (this.options.showRating && testimonial.rating) {
                const rating = parseInt(testimonial.rating, 10);
                const stars = Array(5).fill(0).map((_, i) =>
                    `<span class="testimonials-slider__star ${i < rating ? 'testimonials-slider__star--filled' : ''}" aria-hidden="true">★</span>`
                ).join('');
                ratingHTML = `
                    <div class="testimonials-slider__rating" aria-label="${rating} out of 5 stars">
                        ${stars}
                    </div>
                `;
            }

            slide.innerHTML = `
                <blockquote class="testimonials-slider__quote">
                    "${this.escapeHtml(testimonial.text || '')}"
                </blockquote>
                <div class="testimonials-slider__author-info">
                    <cite class="testimonials-slider__author">${this.escapeHtml(testimonial.author || 'Anonymous')}</cite>
                    ${testimonial.location ? `<span class="testimonials-slider__location">${this.escapeHtml(testimonial.location)}</span>` : ''}
                </div>
                ${ratingHTML}
            `;

            this.slidesContainer.appendChild(slide);
            this.slides.push(slide);
        });
    }

    /**
     * Create dot navigation elements
     */
    createDots() {
        if (!this.dotsContainer || this.testimonials.length <= 1) {
            if (this.dotsContainer) {
                this.dotsContainer.style.display = 'none';
            }
            return;
        }

        this.dotsContainer.innerHTML = '';
        this.dotsContainer.setAttribute('role', 'tablist');
        this.dotsContainer.setAttribute('aria-label', 'Testimonial navigation');
        this.dots = [];

        this.testimonials.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'testimonials-slider__dot';
            dot.setAttribute('type', 'button');
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
            dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

            dot.addEventListener('click', () => {
                this.goToSlide(index);
                this.stopAutoPlay();
                this.startAutoPlay();
            });

            this.dotsContainer.appendChild(dot);
            this.dots.push(dot);
        });
    }

    /**
     * Update dot navigation active state
     */
    updateDots() {
        this.dots.forEach((dot, index) => {
            if (index === this.currentIndex) {
                dot.classList.add('testimonials-slider__dot--active');
                dot.setAttribute('aria-selected', 'true');
            } else {
                dot.classList.remove('testimonials-slider__dot--active');
                dot.setAttribute('aria-selected', 'false');
            }
        });
    }

    /**
     * Navigate to a specific slide
     * @param {number} index - The slide index to navigate to
     */
    goToSlide(index) {
        if (this.isTransitioning || index === this.currentIndex) {
            return;
        }

        if (index < 0 || index >= this.testimonials.length) {
            return;
        }

        this.isTransitioning = true;

        const previousSlide = this.slides[this.currentIndex];
        const nextSlide = this.slides[index];

        // Update ARIA attributes
        if (previousSlide) {
            previousSlide.setAttribute('aria-hidden', 'true');
            previousSlide.classList.remove('testimonials-slider__slide--active');
        }

        if (nextSlide) {
            nextSlide.setAttribute('aria-hidden', 'false');
            nextSlide.classList.add('testimonials-slider__slide--active');
        }

        this.currentIndex = index;
        this.updateDots();

        // Allow transition to complete
        setTimeout(() => {
            this.isTransitioning = false;
        }, this.options.transitionDuration);
    }

    /**
     * Navigate to the next slide
     */
    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.testimonials.length;
        this.goToSlide(nextIndex);
    }

    /**
     * Navigate to the previous slide
     */
    previousSlide() {
        const prevIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
        this.goToSlide(prevIndex);
    }

    /**
     * Start automatic slide rotation
     */
    startAutoPlay() {
        if (this.testimonials.length <= 1) return;

        this.stopAutoPlay();
        this.autoPlayTimer = setInterval(() => {
            this.nextSlide();
        }, this.options.autoPlayInterval);
    }

    /**
     * Stop automatic slide rotation
     */
    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Pause on hover
        if (this.options.pauseOnHover) {
            this.element.addEventListener('mouseenter', () => {
                this.stopAutoPlay();
            });

            this.element.addEventListener('mouseleave', () => {
                this.startAutoPlay();
            });
        }

        // Touch swipe support
        if (this.options.enableSwipe && this.slidesContainer) {
            this.slidesContainer.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            this.slidesContainer.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe();
            }, { passive: true });
        }

        // Keyboard navigation
        this.element.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousSlide();
                    this.stopAutoPlay();
                    this.startAutoPlay();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextSlide();
                    this.stopAutoPlay();
                    this.startAutoPlay();
                    break;
            }
        });

        // Pause when page is hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoPlay();
            } else {
                this.startAutoPlay();
            }
        });
    }

    /**
     * Handle touch swipe gesture
     */
    handleSwipe() {
        const swipeThreshold = 50;
        const diff = this.touchStartX - this.touchEndX;

        if (Math.abs(diff) < swipeThreshold) {
            return;
        }

        if (diff > 0) {
            // Swipe left - next slide
            this.nextSlide();
        } else {
            // Swipe right - previous slide
            this.previousSlide();
        }

        // Reset autoplay after swipe
        this.stopAutoPlay();
        this.startAutoPlay();
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Destroy the slider instance and clean up
     */
    destroy() {
        this.stopAutoPlay();

        if (this.slidesContainer) {
            this.slidesContainer.innerHTML = '';
        }

        if (this.dotsContainer) {
            this.dotsContainer.innerHTML = '';
        }

        this.slides = [];
        this.dots = [];
    }
}

/**
 * Initialize all testimonial sliders on the page
 * @param {Object} testimonialsData - Testimonials data from XML parser
 * @param {Object} options - Global options for all sliders
 */
function initTestimonialsSliders(testimonialsData = [], options = {}) {
    const sliderElements = document.querySelectorAll('[data-testimonials]');
    const sliders = [];

    sliderElements.forEach(element => {
        // Check if this element should use custom testimonials data
        const customDataAttribute = element.getAttribute('data-testimonials');
        let testimonials = testimonialsData;

        // If data-testimonials has a value, it might be a filter or custom dataset identifier
        if (customDataAttribute && customDataAttribute !== '') {
            // You could implement filtering logic here if needed
            // For example: filter by category, location, etc.
        }

        const slider = new TestimonialsSlider(element, testimonials, options);
        sliders.push(slider);
    });

    return sliders;
}

// Auto-initialize when DOM is ready if XMLParser data is available
document.addEventListener('DOMContentLoaded', () => {
    // Wait for XML data to be parsed
    if (window.XMLParser && typeof window.XMLParser.getTestimonials === 'function') {
        const testimonials = window.XMLParser.getTestimonials();

        if (testimonials && testimonials.length > 0) {
            initTestimonialsSliders(testimonials);
        }
    } else {
        // If XML parser isn't ready yet, listen for custom event
        document.addEventListener('xmlConfigLoaded', () => {
            if (window.XMLParser && typeof window.XMLParser.getTestimonials === 'function') {
                const testimonials = window.XMLParser.getTestimonials();

                if (testimonials && testimonials.length > 0) {
                    initTestimonialsSliders(testimonials);
                }
            }
        });
    }
});

// Export for module usage or manual initialization
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestimonialsSlider, initTestimonialsSliders };
}

// Also expose globally for easy access
window.TestimonialsSlider = TestimonialsSlider;
window.initTestimonialsSliders = initTestimonialsSliders;
