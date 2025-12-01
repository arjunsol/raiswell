/**
 * Hero Slider Component
 * Vanilla JavaScript image slider with crossfade transitions, touch support, and XML configuration
 *
 * Features:
 * - Auto-play with configurable interval
 * - Pause on hover
 * - Previous/Next arrow navigation
 * - Dot navigation indicators
 * - Touch swipe support for mobile
 * - Keyboard navigation (arrow keys)
 * - Infinite loop
 * - Smooth crossfade transitions
 */

const HeroSlider = {
    // State management
    currentSlide: 0,
    slideCount: 0,
    autoPlayTimer: null,
    isAutoPlaying: false,
    isPaused: false,

    // Configuration (populated from XML)
    config: {
        autoPlay: true,
        interval: 5000,
        slides: []
    },

    // DOM references
    container: null,
    slidesContainer: null,
    prevButton: null,
    nextButton: null,
    dotsContainer: null,

    // Touch tracking
    touchStartX: 0,
    touchEndX: 0,
    touchStartY: 0,
    touchEndY: 0,
    minSwipeDistance: 50,

    /**
     * Initialize the hero slider
     * @param {Object} config - Configuration object from XML
     * @param {boolean} config.autoPlay - Enable auto-play
     * @param {number} config.interval - Auto-play interval in milliseconds
     * @param {Array} config.slides - Array of slide objects with image and alt properties
     */
    init(config) {
        // Validate configuration
        if (!config || !config.slides || config.slides.length === 0) {
            console.warn('HeroSlider: No slides configured');
            return;
        }

        // Merge configuration
        this.config = {
            autoPlay: config.autoPlay !== undefined ? config.autoPlay : true,
            interval: config.interval || 5000,
            slides: config.slides
        };

        this.slideCount = this.config.slides.length;

        // Only initialize if there are slides
        if (this.slideCount === 0) {
            console.warn('HeroSlider: No slides to display');
            return;
        }

        // Get DOM references
        this.container = document.querySelector('.hero-slider');
        if (!this.container) {
            console.warn('HeroSlider: Container element not found');
            return;
        }

        // Create slider structure
        this.createSliderStructure();

        // Create slides
        this.createSlides();

        // Create navigation dots
        this.createDots();

        // Bind event listeners
        this.bindEvents();

        // Start auto-play if enabled
        if (this.config.autoPlay && this.slideCount > 1) {
            this.startAutoPlay();
        }

        // Set initial slide as active
        this.goToSlide(0, false);

        console.log('HeroSlider: Initialized with', this.slideCount, 'slides');
    },

    /**
     * Create the slider HTML structure
     */
    createSliderStructure() {
        this.container.innerHTML = `
            <div class="hero-slider__container">
                <div class="hero-slider__slides"></div>
                <button class="hero-slider__prev" aria-label="Previous slide">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <button class="hero-slider__next" aria-label="Next slide">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
                <div class="hero-slider__dots"></div>
            </div>
        `;

        // Update DOM references
        this.slidesContainer = this.container.querySelector('.hero-slider__slides');
        this.prevButton = this.container.querySelector('.hero-slider__prev');
        this.nextButton = this.container.querySelector('.hero-slider__next');
        this.dotsContainer = this.container.querySelector('.hero-slider__dots');

        // Hide navigation if only one slide
        if (this.slideCount <= 1) {
            this.prevButton.style.display = 'none';
            this.nextButton.style.display = 'none';
            this.dotsContainer.style.display = 'none';
        }
    },

    /**
     * Create slide elements from configuration
     */
    createSlides() {
        this.config.slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = 'hero-slider__slide';
            slideElement.style.backgroundImage = `url(${slide.image})`;
            slideElement.setAttribute('role', 'img');
            slideElement.setAttribute('aria-label', slide.alt || `Slide ${index + 1}`);

            // Add loading attribute for performance
            const img = new Image();
            img.src = slide.image;

            this.slidesContainer.appendChild(slideElement);
        });
    },

    /**
     * Create navigation dots
     */
    createDots() {
        this.dotsContainer.innerHTML = '';

        for (let i = 0; i < this.slideCount; i++) {
            const dot = document.createElement('button');
            dot.className = 'hero-slider__dot';
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.setAttribute('data-slide', i);

            this.dotsContainer.appendChild(dot);
        }
    },

    /**
     * Navigate to specific slide
     * @param {number} index - Slide index to navigate to
     * @param {boolean} animate - Whether to animate the transition (default: true)
     */
    goToSlide(index, animate = true) {
        // Normalize index (handle infinite loop)
        if (index < 0) {
            index = this.slideCount - 1;
        } else if (index >= this.slideCount) {
            index = 0;
        }

        // Update current slide
        const previousSlide = this.currentSlide;
        this.currentSlide = index;

        // Get all slides
        const slides = this.slidesContainer.querySelectorAll('.hero-slider__slide');

        // Remove active class from all slides
        slides.forEach(slide => slide.classList.remove('active'));

        // Add active class to current slide
        if (slides[index]) {
            slides[index].classList.add('active');
        }

        // Update dots
        this.updateDots();

        // Announce slide change to screen readers
        this.announceSlideChange(index);
    },

    /**
     * Navigate to next slide
     */
    nextSlide() {
        this.goToSlide(this.currentSlide + 1);

        // Reset auto-play timer
        if (this.config.autoPlay && this.isAutoPlaying) {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    },

    /**
     * Navigate to previous slide
     */
    prevSlide() {
        this.goToSlide(this.currentSlide - 1);

        // Reset auto-play timer
        if (this.config.autoPlay && this.isAutoPlaying) {
            this.stopAutoPlay();
            this.startAutoPlay();
        }
    },

    /**
     * Start auto-play
     */
    startAutoPlay() {
        if (this.slideCount <= 1) return;

        this.stopAutoPlay(); // Clear any existing timer

        this.autoPlayTimer = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, this.config.interval);

        this.isAutoPlaying = true;
    },

    /**
     * Stop auto-play
     */
    stopAutoPlay() {
        if (this.autoPlayTimer) {
            clearInterval(this.autoPlayTimer);
            this.autoPlayTimer = null;
        }
        this.isAutoPlaying = false;
    },

    /**
     * Pause auto-play (without stopping it permanently)
     */
    pauseAutoPlay() {
        this.isPaused = true;
    },

    /**
     * Resume auto-play
     */
    resumeAutoPlay() {
        this.isPaused = false;
    },

    /**
     * Update navigation dots
     */
    updateDots() {
        const dots = this.dotsContainer.querySelectorAll('.hero-slider__dot');
        dots.forEach((dot, index) => {
            if (index === this.currentSlide) {
                dot.classList.add('active');
                dot.setAttribute('aria-current', 'true');
            } else {
                dot.classList.remove('active');
                dot.removeAttribute('aria-current');
            }
        });
    },

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Previous button
        if (this.prevButton) {
            this.prevButton.addEventListener('click', () => this.prevSlide());
        }

        // Next button
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => this.nextSlide());
        }

        // Dot navigation
        if (this.dotsContainer) {
            this.dotsContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('hero-slider__dot')) {
                    const slideIndex = parseInt(e.target.getAttribute('data-slide'), 10);
                    this.goToSlide(slideIndex);

                    // Reset auto-play timer
                    if (this.config.autoPlay && this.isAutoPlaying) {
                        this.stopAutoPlay();
                        this.startAutoPlay();
                    }
                }
            });
        }

        // Pause on hover
        if (this.container) {
            this.container.addEventListener('mouseenter', () => this.pauseAutoPlay());
            this.container.addEventListener('mouseleave', () => this.resumeAutoPlay());
        }

        // Touch events for swipe
        if (this.slidesContainer) {
            this.slidesContainer.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
            this.slidesContainer.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
            this.slidesContainer.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        }

        // Keyboard navigation
        if (this.container) {
            this.container.setAttribute('tabindex', '0');
            this.container.addEventListener('keydown', (e) => this.handleKeyDown(e));
        }

        // Pause auto-play when page is hidden (visibility API)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAutoPlay();
            } else {
                this.resumeAutoPlay();
            }
        });
    },

    /**
     * Handle touch start event
     */
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
    },

    /**
     * Handle touch move event
     */
    handleTouchMove(e) {
        // Track the current touch position for smoother detection
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;
    },

    /**
     * Handle touch end event (process swipe)
     */
    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].screenX;
        this.touchEndY = e.changedTouches[0].screenY;

        this.handleSwipe();
    },

    /**
     * Process swipe gesture
     */
    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;

        // Check if horizontal swipe is dominant (not vertical scroll)
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Check if swipe distance meets minimum threshold
            if (Math.abs(deltaX) > this.minSwipeDistance) {
                if (deltaX > 0) {
                    // Swipe right - go to previous slide
                    this.prevSlide();
                } else {
                    // Swipe left - go to next slide
                    this.nextSlide();
                }
            }
        }

        // Reset touch positions
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.touchStartY = 0;
        this.touchEndY = 0;
    },

    /**
     * Handle keyboard navigation
     */
    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.prevSlide();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(0);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.slideCount - 1);
                break;
        }
    },

    /**
     * Announce slide change to screen readers
     */
    announceSlideChange(index) {
        // Create or update live region for screen reader announcements
        let liveRegion = document.getElementById('hero-slider-live-region');

        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'hero-slider-live-region';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.className = 'sr-only';
            document.body.appendChild(liveRegion);
        }

        liveRegion.textContent = `Slide ${index + 1} of ${this.slideCount}`;
    },

    /**
     * Destroy the slider and clean up
     */
    destroy() {
        this.stopAutoPlay();

        // Remove event listeners
        if (this.container) {
            this.container.removeEventListener('mouseenter', () => this.pauseAutoPlay());
            this.container.removeEventListener('mouseleave', () => this.resumeAutoPlay());
            this.container.removeEventListener('keydown', (e) => this.handleKeyDown(e));
        }

        // Clear DOM references
        this.container = null;
        this.slidesContainer = null;
        this.prevButton = null;
        this.nextButton = null;
        this.dotsContainer = null;

        // Reset state
        this.currentSlide = 0;
        this.slideCount = 0;

        console.log('HeroSlider: Destroyed');
    }
};

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeroSlider;
}
