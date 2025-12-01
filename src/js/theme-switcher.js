/**
 * Theme Switcher for Colin's Professional Building Services
 * Manages three UX-optimized themes with smooth transitions
 */

class ThemeSwitcher {
    constructor() {
        this.themes = {
            professional: {
                name: 'Professional Corporate',
                description: 'Trust & reliability focused design',
                icon: '🏢'
            },
            craftsman: {
                name: 'Modern Craftsman', 
                description: 'Skill & innovation emphasis',
                icon: '🔨'
            },
            community: {
                name: 'Community Local',
                description: 'Personal & approachable feel',
                icon: '🏘️'
            }
        };
        
        this.currentTheme = this.getStoredTheme() || 'professional';
        this.init();
    }

    /**
     * Initialize theme switcher
     */
    init() {
        this.createThemeSwitcher();
        this.applyTheme(this.currentTheme);
        this.addEventListeners();
        this.preloadGoogleFonts();
        
        // Apply theme-specific animations after page load
        window.addEventListener('load', () => {
            this.addThemeAnimations();
        });
    }

    /**
     * Create theme switcher dropdown in header
     */
    createThemeSwitcher() {
        const navContainer = document.querySelector('.nav-container');
        if (!navContainer) return;

        const themeSwitcher = document.createElement('div');
        themeSwitcher.className = 'theme-switcher';
        themeSwitcher.innerHTML = `
            <select class="theme-dropdown" id="theme-selector" aria-label="Choose website theme">
                <option value="professional" ${this.currentTheme === 'professional' ? 'selected' : ''}>
                    ${this.themes.professional.icon} ${this.themes.professional.name}
                </option>
                <option value="craftsman" ${this.currentTheme === 'craftsman' ? 'selected' : ''}>
                    ${this.themes.craftsman.icon} ${this.themes.craftsman.name}
                </option>
                <option value="community" ${this.currentTheme === 'community' ? 'selected' : ''}>
                    ${this.themes.community.icon} ${this.themes.community.name}
                </option>
            </select>
        `;

        navContainer.appendChild(themeSwitcher);
    }

    /**
     * Add event listeners
     */
    addEventListeners() {
        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            themeSelector.addEventListener('change', (e) => {
                this.switchTheme(e.target.value);
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                this.showThemeModal();
            }
        });
    }

    /**
     * Switch to new theme with smooth transition
     */
    switchTheme(themeName) {
        if (!this.themes[themeName]) return;

        // Add transition class
        document.body.classList.add('theme-transitioning');
        
        // Small delay for smooth transition
        setTimeout(() => {
            this.applyTheme(themeName);
            this.storeTheme(themeName);
            this.currentTheme = themeName;
            
            // Remove transition class
            setTimeout(() => {
                document.body.classList.remove('theme-transitioning');
                this.addThemeAnimations();
            }, 150);
        }, 50);

        // Analytics tracking (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'theme_change', {
                'theme_name': themeName,
                'previous_theme': this.currentTheme
            });
        }

        // Show theme change notification
        this.showThemeNotification(themeName);
    }

    /**
     * Apply theme to document
     */
    applyTheme(themeName) {
        // Set data attribute on html element
        document.documentElement.setAttribute('data-theme', themeName);
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor(themeName);
        
        // Apply theme-specific font loading
        this.loadThemeFonts(themeName);
        
        // Update any dynamic content based on theme
        this.updateThemeSpecificContent(themeName);
    }

    /**
     * Update meta theme color for mobile browsers
     */
    updateMetaThemeColor(themeName) {
        const themeColors = {
            professional: '#1e3a5f',
            craftsman: '#2d3748', 
            community: '#3182ce'
        };

        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = themeColors[themeName];
    }

    /**
     * Preload Google Fonts for all themes
     */
    preloadGoogleFonts() {
        const fonts = [
            'Inter:wght@400;500;600;700',
            'Merriweather:wght@400;700',
            'Source+Sans+Pro:wght@400;600;700',
            'Playfair+Display:wght@400;700',
            'Open+Sans:wght@400;600;700',
            'Poppins:wght@400;600;700'
        ];

        fonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = `https://fonts.googleapis.com/css2?family=${font}&display=swap`;
            document.head.appendChild(link);
            
            // Convert to stylesheet after preload
            setTimeout(() => {
                link.rel = 'stylesheet';
            }, 100);
        });
    }

    /**
     * Load theme-specific fonts
     */
    loadThemeFonts(themeName) {
        const fontMappings = {
            professional: ['Inter', 'Merriweather'],
            craftsman: ['Source Sans Pro', 'Playfair Display'],
            community: ['Open Sans', 'Poppins']
        };

        const fonts = fontMappings[themeName];
        if (fonts) {
            fonts.forEach(font => {
                if (document.fonts) {
                    document.fonts.load(`16px "${font}"`);
                }
            });
        }
    }

    /**
     * Update theme-specific content
     */
    updateThemeSpecificContent(themeName) {
        // Update any theme-specific text or messaging
        const themeSpecificElements = document.querySelectorAll('[data-theme-content]');
        themeSpecificElements.forEach(element => {
            const content = element.getAttribute(`data-${themeName}-content`);
            if (content) {
                element.textContent = content;
            }
        });

        // Update button text based on theme personality
        this.updateButtonText(themeName);
    }

    /**
     * Update button text to match theme personality
     */
    updateButtonText(themeName) {
        const buttonMappings = {
            professional: {
                'Get Quote': 'Request Proposal',
                'Book Consultation': 'Schedule Meeting',
                'Contact Us': 'Get In Touch'
            },
            craftsman: {
                'Get Quote': 'Get Quote',
                'Book Consultation': 'Book Consultation', 
                'Contact Us': 'Contact Us'
            },
            community: {
                'Get Quote': 'Get Free Quote',
                'Book Consultation': 'Chat With Us',
                'Contact Us': 'Say Hello'
            }
        };

        const mapping = buttonMappings[themeName];
        if (mapping) {
            Object.keys(mapping).forEach(originalText => {
                const buttons = document.querySelectorAll('.btn');
                buttons.forEach(button => {
                    if (button.textContent.trim() === originalText) {
                        button.textContent = mapping[originalText];
                    }
                });
            });
        }
    }

    /**
     * Add theme-specific animations
     */
    addThemeAnimations() {
        const cards = document.querySelectorAll('.card, .service-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in-scale');
        });
    }

    /**
     * Show theme change notification
     */
    showThemeNotification(themeName) {
        const theme = this.themes[themeName];
        
        // Remove existing notification
        const existingNotification = document.querySelector('.theme-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.innerHTML = `
            <div class="theme-notification-content">
                <span class="theme-icon">${theme.icon}</span>
                <div class="theme-text">
                    <strong>${theme.name}</strong>
                    <small>${theme.description}</small>
                </div>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--color-background);
            border: 2px solid var(--color-secondary);
            border-radius: var(--border-radius);
            padding: 1rem;
            box-shadow: var(--box-shadow);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            max-width: 280px;
        `;

        notification.querySelector('.theme-notification-content').style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.75rem;
        `;

        notification.querySelector('.theme-icon').style.cssText = `
            font-size: 1.5rem;
        `;

        notification.querySelector('.theme-text').style.cssText = `
            display: flex;
            flex-direction: column;
        `;

        notification.querySelector('.theme-text strong').style.cssText = `
            color: var(--color-primary);
            font-size: 0.9rem;
        `;

        notification.querySelector('.theme-text small').style.cssText = `
            color: var(--color-dark-gray);
            font-size: 0.75rem;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    /**
     * Show theme selection modal (keyboard shortcut)
     */
    showThemeModal() {
        const modal = document.createElement('div');
        modal.className = 'theme-modal-overlay';
        modal.innerHTML = `
            <div class="theme-modal">
                <h3>Choose Your Theme</h3>
                <div class="theme-options">
                    ${Object.keys(this.themes).map(key => `
                        <button class="theme-option ${key === this.currentTheme ? 'active' : ''}" data-theme="${key}">
                            <span class="theme-option-icon">${this.themes[key].icon}</span>
                            <strong>${this.themes[key].name}</strong>
                            <small>${this.themes[key].description}</small>
                        </button>
                    `).join('')}
                </div>
                <button class="theme-modal-close">Close</button>
            </div>
        `;

        // Add modal styles
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        document.body.appendChild(modal);

        // Event listeners
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('theme-modal-close')) {
                modal.remove();
            }
            
            if (e.target.closest('.theme-option')) {
                const themeName = e.target.closest('.theme-option').dataset.theme;
                this.switchTheme(themeName);
                document.getElementById('theme-selector').value = themeName;
                modal.remove();
            }
        });
    }

    /**
     * Store theme preference
     */
    storeTheme(themeName) {
        try {
            localStorage.setItem('colinbuilds-theme', themeName);
        } catch (e) {
            // Fallback to cookie if localStorage is not available
            document.cookie = `colinbuilds-theme=${themeName}; max-age=31536000; path=/`;
        }
    }

    /**
     * Get stored theme preference
     */
    getStoredTheme() {
        try {
            return localStorage.getItem('colinbuilds-theme');
        } catch (e) {
            // Fallback to cookie
            const match = document.cookie.match(/colinbuilds-theme=([^;]+)/);
            return match ? match[1] : null;
        }
    }

    /**
     * Get current theme info
     */
    getCurrentThemeInfo() {
        return {
            name: this.currentTheme,
            ...this.themes[this.currentTheme]
        };
    }
}

// Initialize theme switcher when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeSwitcher = new ThemeSwitcher();
});

// Add transition styles
const style = document.createElement('style');
style.textContent = `
    .theme-transitioning * {
        transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
    }
    
    .theme-modal .theme-modal {
        background: var(--color-background);
        border-radius: var(--border-radius);
        padding: 2rem;
        max-width: 500px;
        width: 90%;
    }
    
    .theme-modal h3 {
        color: var(--color-primary);
        margin-bottom: 1.5rem;
        text-align: center;
    }
    
    .theme-options {
        display: grid;
        gap: 1rem;
        margin-bottom: 2rem;
    }
    
    .theme-option {
        padding: 1rem;
        border: 2px solid var(--color-light-gray);
        border-radius: var(--border-radius);
        background: transparent;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: left;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .theme-option:hover,
    .theme-option.active {
        border-color: var(--color-secondary);
        background: var(--color-light-gray);
    }
    
    .theme-option-icon {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
    }
    
    .theme-modal-close {
        width: 100%;
        padding: 0.75rem;
        background: var(--color-secondary);
        color: white;
        border: none;
        border-radius: var(--border-radius);
        cursor: pointer;
        font-weight: 600;
    }
`;
document.head.appendChild(style);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeSwitcher;
}