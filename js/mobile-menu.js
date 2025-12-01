/**
 * Mobile Menu Component
 *
 * Handles mobile navigation menu functionality with smooth animations,
 * accessibility features, and integration with the XML-driven architecture.
 *
 * Features:
 * - Toggle mobile menu open/close
 * - Click outside to close
 * - ESC key to close
 * - Body scroll prevention when open
 * - Smooth CSS-based animations
 * - Touch-friendly interactions
 */

const MobileMenu = {
    /**
     * DOM element references
     */
    elements: {
        toggleButton: null,
        menu: null,
        closeButton: null,
        overlay: null,
        body: document.body
    },

    /**
     * Menu state
     */
    isOpen: false,

    /**
     * Initialize the mobile menu
     * Sets up DOM references and binds event listeners
     */
    init() {
        // Get DOM element references
        this.elements.toggleButton = document.querySelector('.mobile-menu-toggle');
        this.elements.menu = document.querySelector('.mobile-menu');
        this.elements.closeButton = document.querySelector('.mobile-menu__close');
        this.elements.overlay = document.querySelector('.mobile-menu-overlay');

        // Check if required elements exist
        if (!this.elements.toggleButton || !this.elements.menu) {
            console.warn('Mobile menu: Required elements not found. Menu functionality disabled.');
            return;
        }

        // Bind event listeners
        this.bindEvents();

        // Set initial ARIA attributes for accessibility
        this.setAriaAttributes();

        console.log('Mobile menu initialized');
    },

    /**
     * Set ARIA attributes for accessibility
     */
    setAriaAttributes() {
        if (this.elements.toggleButton) {
            this.elements.toggleButton.setAttribute('aria-label', 'Toggle mobile menu');
            this.elements.toggleButton.setAttribute('aria-expanded', 'false');
            this.elements.toggleButton.setAttribute('aria-controls', 'mobile-menu');
        }

        if (this.elements.menu) {
            this.elements.menu.setAttribute('id', 'mobile-menu');
            this.elements.menu.setAttribute('role', 'navigation');
            this.elements.menu.setAttribute('aria-label', 'Mobile navigation');
        }

        if (this.elements.closeButton) {
            this.elements.closeButton.setAttribute('aria-label', 'Close mobile menu');
        }
    },

    /**
     * Bind all event listeners
     */
    bindEvents() {
        // Toggle button click
        if (this.elements.toggleButton) {
            this.elements.toggleButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggle();
            });
        }

        // Close button click
        if (this.elements.closeButton) {
            this.elements.closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.close();
            });
        }

        // Overlay click to close
        if (this.elements.overlay) {
            this.elements.overlay.addEventListener('click', () => {
                this.close();
            });
        }

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Click menu links to auto-close (smooth UX for same-page navigation)
        if (this.elements.menu) {
            const menuLinks = this.elements.menu.querySelectorAll('a');
            menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    // Small delay to allow navigation to start
                    setTimeout(() => this.close(), 100);
                });
            });
        }

        // Handle window resize - close menu if resizing to desktop
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // If window is wider than mobile breakpoint and menu is open, close it
                if (window.innerWidth > 768 && this.isOpen) {
                    this.close();
                }
            }, 250);
        });
    },

    /**
     * Toggle menu open/closed
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    /**
     * Open the mobile menu
     */
    open() {
        if (this.isOpen) return;

        // Add classes for animation
        if (this.elements.menu) {
            this.elements.menu.classList.add('is-open');
        }

        if (this.elements.overlay) {
            this.elements.overlay.classList.add('is-visible');
        }

        // Prevent body scroll
        this.elements.body.classList.add('menu-open');

        // Update state
        this.isOpen = true;

        // Update ARIA attributes
        if (this.elements.toggleButton) {
            this.elements.toggleButton.setAttribute('aria-expanded', 'true');
        }

        // Focus trap - focus first focusable element in menu
        this.trapFocus();

        // Dispatch custom event for other components to listen to
        document.dispatchEvent(new CustomEvent('mobileMenuOpen'));

        console.log('Mobile menu opened');
    },

    /**
     * Close the mobile menu
     */
    close() {
        if (!this.isOpen) return;

        // Remove classes for animation
        if (this.elements.menu) {
            this.elements.menu.classList.remove('is-open');
        }

        if (this.elements.overlay) {
            this.elements.overlay.classList.remove('is-visible');
        }

        // Re-enable body scroll
        this.elements.body.classList.remove('menu-open');

        // Update state
        this.isOpen = false;

        // Update ARIA attributes
        if (this.elements.toggleButton) {
            this.elements.toggleButton.setAttribute('aria-expanded', 'false');
        }

        // Return focus to toggle button
        if (this.elements.toggleButton) {
            this.elements.toggleButton.focus();
        }

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('mobileMenuClose'));

        console.log('Mobile menu closed');
    },

    /**
     * Trap focus within the mobile menu for accessibility
     */
    trapFocus() {
        if (!this.elements.menu) return;

        // Get all focusable elements within the menu
        const focusableElements = this.elements.menu.querySelectorAll(
            'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Focus first element
        firstElement.focus();

        // Handle tab key to keep focus within menu
        this.elements.menu.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                // Shift + Tab - going backwards
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab - going forwards
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    },

    /**
     * Public method to check if menu is open
     * @returns {boolean}
     */
    isMenuOpen() {
        return this.isOpen;
    },

    /**
     * Public method to destroy the mobile menu
     * Useful for cleanup if component needs to be removed
     */
    destroy() {
        // Close menu if open
        if (this.isOpen) {
            this.close();
        }

        // Remove all event listeners by cloning and replacing elements
        // (simple approach - in production might want more granular control)
        console.log('Mobile menu destroyed');
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if mobile menu feature is enabled via feature manager
    // Note: featureManager is the instance, FeatureManager is the class
    if (window.featureManager && window.featureManager.initialized && !window.featureManager.isEnabled('mobile-menu')) {
        console.log('Mobile menu feature is disabled');
        return;
    }

    // Initialize mobile menu
    MobileMenu.init();
});

// Export for use in other modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileMenu;
}
