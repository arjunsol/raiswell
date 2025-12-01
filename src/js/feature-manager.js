/**
 * Feature Manager for Colin's Professional Building Services
 * Manages feature toggles and conditional rendering of components
 */

class FeatureManager {
    constructor() {
        this.xmlParser = null;
        this.initialized = false;
    }

    /**
     * Initialize feature manager
     */
    async init() {
        try {
            // Wait for XML parser to be available
            await this.waitForXMLParser();
            this.initialized = true;
            console.log('Feature manager initialized successfully');
        } catch (error) {
            console.error('Feature manager initialization failed:', error);
            this.initialized = false;
        }
    }

    /**
     * Wait for XML parser to be available
     */
    async waitForXMLParser() {
        const maxAttempts = 20;
        let attempts = 0;

        while (attempts < maxAttempts) {
            if (window.xmlParser && window.xmlParser.loaded) {
                this.xmlParser = window.xmlParser;
                return;
            }
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 250));
        }

        throw new Error('XML parser not available');
    }

    /**
     * Check if a feature is enabled
     * @param {string} featurePath - Path to feature (e.g., 'hero-section', 'services-page.service-cards')
     * @returns {boolean} True if feature is enabled
     */
    isEnabled(featurePath) {
        if (!this.initialized || !this.xmlParser) {
            return true; // Default to enabled if not initialized
        }

        return this.xmlParser.isFeatureEnabled(featurePath);
    }

    /**
     * Hide element if feature is disabled
     * @param {HTMLElement|string} element - Element or selector to hide
     * @param {string} featurePath - Feature path to check
     */
    toggleElement(element, featurePath) {
        const el = typeof element === 'string' ? document.querySelector(element) : element;
        if (!el) return;

        const isEnabled = this.isEnabled(featurePath);
        if (isEnabled) {
            el.style.display = '';
            el.removeAttribute('data-feature-disabled');
        } else {
            el.style.display = 'none';
            el.setAttribute('data-feature-disabled', 'true');
        }
    }

    /**
     * Toggle multiple elements based on feature flags
     * @param {Object} elementFeatureMap - Map of selector to feature path
     */
    toggleElements(elementFeatureMap) {
        Object.entries(elementFeatureMap).forEach(([selector, featurePath]) => {
            this.toggleElement(selector, featurePath);
        });
    }

    /**
     * Apply feature toggles to the current page
     */
    applyPageToggles() {
        const currentPage = this.getCurrentPage();
        
        // Core page components
        this.toggleElements({
            '.hero-section': 'hero-section',
            '.services-section': 'services-section',
            '.testimonials-section': 'testimonials-section',
            '.why-choose-us-section': 'why-choose-us-section',
            '.accreditations-section': 'accreditations-section',
            '.gallery-section': 'gallery-section',
            '.contact-section': 'contact-section'
        });

        // Interactive features
        this.toggleElements({
            '#chatbot-container': 'chatbot',
            '#calendar-container': 'calendar-booking',
            '.quick-quote-modal': 'quick-quote-modal',
            '#theme-switcher': 'theme-switcher'
        });

        // Page-specific toggles
        switch (currentPage) {
            case 'services':
                this.applyServicesPageToggles();
                break;
            case 'gallery':
                this.applyGalleryPageToggles();
                break;
            case 'booking':
                this.applyBookingPageToggles();
                break;
            case 'contact':
                this.applyContactPageToggles();
                break;
        }

        // Navigation and footer
        this.applyNavigationToggles();
        this.applyFooterToggles();
    }

    /**
     * Apply services page specific toggles
     */
    applyServicesPageToggles() {
        this.toggleElements({
            '.service-cards': 'services-page.service-cards',
            '.service-price': 'services-page.pricing-display',
            '.service-duration': 'services-page.duration-display',
            '.service-icon': 'services-page.service-icons'
        });
    }

    /**
     * Apply gallery page specific toggles
     */
    applyGalleryPageToggles() {
        this.toggleElements({
            '.gallery-grid': 'gallery-page.image-gallery',
            '.gallery-filters': 'gallery-page.category-filter',
            '.lightbox': 'gallery-page.lightbox-viewer',
            '.instagram-feed': 'gallery-page.instagram-feed'
        });
    }

    /**
     * Apply booking page specific toggles
     */
    applyBookingPageToggles() {
        this.toggleElements({
            '.consultation-types': 'booking-page.consultation-types',
            '.calendar-widget': 'booking-page.calendar-widget',
            '.time-slots': 'booking-page.time-slot-selector',
            '#booking-form': 'booking-page.appointment-booking',
            '.emergency-booking': 'booking-page.emergency-section'
        });
    }

    /**
     * Apply contact page specific toggles
     */
    applyContactPageToggles() {
        this.toggleElements({
            '#contact-form': 'contact-page.contact-form',
            '.business-hours': 'contact-page.business-hours',
            '.location-map': 'contact-page.location-map',
            '.emergency-contact': 'contact-page.emergency-contact'
        });
    }

    /**
     * Apply navigation toggles
     */
    applyNavigationToggles() {
        this.toggleElements({
            '.mobile-menu-toggle': 'navigation.mobile-menu',
            '#theme-dropdown': 'navigation.theme-dropdown'
        });

        // Handle active page highlighting
        if (!this.isEnabled('navigation.active-page-highlighting')) {
            document.querySelectorAll('.nav-link.active').forEach(link => {
                link.classList.remove('active');
            });
        }
    }

    /**
     * Apply footer toggles
     */
    applyFooterToggles() {
        this.toggleElements({
            '.social-links': 'footer.social-links',
            '.footer-section ul': 'footer.quick-links',
            '.footer-section:last-child': 'footer.contact-info',
            '.footer-bottom': 'footer.copyright'
        });
    }

    /**
     * Get current page name from URL or body class
     * @returns {string} Current page name
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        if (filename === '' || filename === 'index.html') return 'home';
        if (filename.includes('services')) return 'services';
        if (filename.includes('gallery')) return 'gallery';
        if (filename.includes('booking')) return 'booking';
        if (filename.includes('contact')) return 'contact';
        if (filename.includes('accreditation')) return 'accreditations';
        
        return 'unknown';
    }

    /**
     * Conditionally initialize component based on feature flag
     * @param {string} featurePath - Feature path to check
     * @param {Function} initFunction - Function to call if feature is enabled
     * @param {Object} context - Context to bind function to
     */
    conditionalInit(featurePath, initFunction, context = null) {
        if (this.isEnabled(featurePath)) {
            if (context) {
                initFunction.call(context);
            } else {
                initFunction();
            }
        } else {
            console.log(`Feature disabled: ${featurePath} - skipping initialization`);
        }
    }

    /**
     * Wrap component initialization with feature checking
     * @param {string} componentName - Name for logging
     * @param {string} featurePath - Feature path to check
     * @param {Function} initFunction - Initialization function
     * @returns {Function} Wrapped initialization function
     */
    wrapComponentInit(componentName, featurePath, initFunction) {
        return (...args) => {
            if (this.isEnabled(featurePath)) {
                console.log(`Initializing ${componentName} (feature enabled)`);
                return initFunction.apply(this, args);
            } else {
                console.log(`Skipping ${componentName} initialization (feature disabled)`);
                return null;
            }
        };
    }

    /**
     * Add feature toggle admin panel (development helper)
     */
    addDevPanel() {
        if (!window.location.search.includes('dev=true')) return;

        const panel = document.createElement('div');
        panel.id = 'feature-toggle-panel';
        panel.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: white;
            border: 2px solid #333;
            padding: 15px;
            z-index: 9999;
            max-height: 300px;
            overflow-y: auto;
            font-size: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;

        panel.innerHTML = `
            <h4>Feature Toggles (Dev Mode)</h4>
            <div id="toggle-controls"></div>
            <button onclick="featureManager.refreshToggles()">Refresh</button>
        `;

        document.body.appendChild(panel);
        this.populateDevPanel();
    }

    /**
     * Populate development panel with toggle controls
     */
    populateDevPanel() {
        const container = document.getElementById('toggle-controls');
        if (!container || !this.xmlParser) return;

        const toggles = this.xmlParser.config['feature-toggles'];
        if (!toggles) return;

        this.renderToggleGroup(container, toggles, '');
    }

    /**
     * Render toggle group recursively
     */
    renderToggleGroup(container, toggles, prefix) {
        for (const [key, value] of Object.entries(toggles)) {
            const fullPath = prefix ? `${prefix}.${key}` : key;
            
            if (typeof value === 'object' && value.enabled !== undefined) {
                const label = document.createElement('label');
                label.innerHTML = `
                    <input type="checkbox" ${value.enabled ? 'checked' : ''} 
                           onchange="featureManager.toggleFeature('${fullPath}', this.checked)">
                    ${key}
                `;
                container.appendChild(label);
                container.appendChild(document.createElement('br'));
            } else if (typeof value === 'object') {
                const groupLabel = document.createElement('strong');
                groupLabel.textContent = key + ':';
                container.appendChild(groupLabel);
                container.appendChild(document.createElement('br'));
                
                const subContainer = document.createElement('div');
                subContainer.style.marginLeft = '15px';
                container.appendChild(subContainer);
                
                this.renderToggleGroup(subContainer, value, fullPath);
            }
        }
    }

    /**
     * Toggle feature (for dev panel)
     */
    toggleFeature(featurePath, enabled) {
        // This would require server-side implementation to persist changes
        console.log(`Toggle ${featurePath}: ${enabled}`);
        // For now, just update in memory and refresh
        const pathParts = featurePath.split('.');
        let current = this.xmlParser.config['feature-toggles'];
        
        for (let i = 0; i < pathParts.length - 1; i++) {
            current = current[pathParts[i]];
        }
        
        if (current[pathParts[pathParts.length - 1]]) {
            current[pathParts[pathParts.length - 1]].enabled = enabled;
        }
        
        this.refreshToggles();
    }

    /**
     * Refresh all feature toggles
     */
    refreshToggles() {
        this.applyPageToggles();
    }
}

// Initialize feature manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.featureManager = new FeatureManager();
    
    // Initialize after a short delay to ensure XML parser is ready
    setTimeout(() => {
        window.featureManager.init().then(() => {
            window.featureManager.applyPageToggles();
            window.featureManager.addDevPanel();
        });
    }, 1500);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeatureManager;
}