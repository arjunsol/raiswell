/**
 * Main JavaScript for Colin's Professional Building Services
 * Handles core site functionality and XML-driven content population
 */

class SiteManager {
    constructor() {
        this.config = null;
        this.isLoaded = false;
        this.currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        this.init();
    }

    /**
     * Initialize the site
     */
    async init() {
        try {
            // Show loading state
            this.showLoading();
            
            // Load configuration
            this.config = await window.siteConfig.loadConfig();
            
            // Wait for feature manager to be available
            await this.waitForFeatureManager();
            
            // Apply branding
            window.siteConfig.applyBrandingStyles();
            
            // Initialize components with feature checking
            this.initializeComponentsWithToggles();
            
            // Page-specific initialization
            this.initializePageSpecificFeatures();
            
            // Hide loading state
            this.hideLoading();
            
            this.isLoaded = true;
            console.log('Site initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize site:', error);
            this.showError('Failed to load site configuration. Please refresh the page.');
        }
    }

    /**
     * Wait for feature manager to be available
     */
    async waitForFeatureManager() {
        const maxAttempts = 20;
        let attempts = 0;

        while (attempts < maxAttempts) {
            if (window.featureManager && window.featureManager.initialized) {
                return;
            }
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.warn('Feature manager not available, continuing without feature toggles');
    }

    /**
     * Initialize components with feature toggle checking
     */
    initializeComponentsWithToggles() {
        const fm = window.featureManager;
        
        // Core components
        if (!fm || fm.isEnabled('navigation')) {
            this.initializeNavigation();
        }
        
        this.initializeScrollEffects();
        this.populateContent();
        this.initializeIntersectionObserver();
        this.initializeLazyLoading();
    }

    /**
     * Show loading state
     */
    showLoading() {
        document.body.classList.add('loading');
        
        // Create loading overlay if it doesn't exist
        if (!document.querySelector('.loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
    }

    /**
     * Hide loading state
     */
    hideLoading() {
        document.body.classList.remove('loading');
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="btn btn-primary">Reload Page</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }

    /**
     * Initialize navigation functionality
     */
    initializeNavigation() {
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Mobile menu toggle
        if (mobileToggle && navMenu) {
            mobileToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileToggle.classList.toggle('active');
                
                // Update aria attributes for accessibility
                const isOpen = navMenu.classList.contains('active');
                mobileToggle.setAttribute('aria-expanded', isOpen);
                mobileToggle.innerHTML = isOpen ? '✕' : '☰';
            });
        }
        
        // Close mobile menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu && navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                    mobileToggle.setAttribute('aria-expanded', 'false');
                    mobileToggle.innerHTML = '☰';
                }
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navMenu && navMenu.classList.contains('active') && 
                !navMenu.contains(e.target) && 
                !mobileToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileToggle.innerHTML = '☰';
            }
        });
        
        // Highlight active navigation item
        this.updateActiveNavigation();
    }

    /**
     * Update active navigation based on current page
     */
    updateActiveNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const linkPath = link.getAttribute('href');
            
            if (linkPath === currentPath || 
                (currentPath === '/' && linkPath === 'index.html') ||
                (currentPath.endsWith('/') && linkPath === 'index.html')) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Initialize scroll effects
     */
    initializeScrollEffects() {
        const header = document.querySelector('.header');
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            // Add scrolled class to header
            if (currentScrollY > 50) {
                header?.classList.add('scrolled');
            } else {
                header?.classList.remove('scrolled');
            }
            
            // Hide/show header on scroll (optional)
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                header?.classList.add('header-hidden');
            } else {
                header?.classList.remove('header-hidden');
            }
            
            lastScrollY = currentScrollY;
        });
    }

    /**
     * Populate content from XML configuration
     */
    populateContent() {
        if (!this.config) return;
        
        // Update page title and meta
        this.updatePageMeta();
        
        // Populate company information
        this.populateCompanyInfo();
        
        // Populate services
        this.populateServices();
        
        // Populate testimonials
        this.populateTestimonials();
        
        // Populate accreditations
        this.populateAccreditations();
        
        // Populate contact information
        this.populateContactInfo();
        
        // Update footer
        this.populateFooter();
    }

    /**
     * Update page meta information
     */
    updatePageMeta() {
        const { seo, company } = this.config;
        
        // Update title
        if (seo?.meta?.title) {
            document.title = seo.meta.title;
        }
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription && seo?.meta?.description) {
            metaDescription.setAttribute('content', seo.meta.description);
        }
        
        // Update meta keywords
        const metaKeywords = document.querySelector('meta[name="keywords"]');
        if (metaKeywords && seo?.meta?.keywords) {
            metaKeywords.setAttribute('content', seo.meta.keywords);
        }
        
        // Update Open Graph tags
        this.updateOpenGraphTags();
    }

    /**
     * Update Open Graph meta tags
     */
    updateOpenGraphTags() {
        const { seo, company } = this.config;
        
        const ogTags = [
            { property: 'og:title', content: seo?.meta?.title || company?.name },
            { property: 'og:description', content: seo?.meta?.description || company?.description },
            { property: 'og:type', content: 'website' },
            { property: 'og:url', content: window.location.href }
        ];
        
        ogTags.forEach(tag => {
            let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
            if (!metaTag) {
                metaTag = document.createElement('meta');
                metaTag.setAttribute('property', tag.property);
                document.head.appendChild(metaTag);
            }
            metaTag.setAttribute('content', tag.content);
        });
    }

    /**
     * Populate company information
     */
    populateCompanyInfo() {
        const { company } = this.config;
        if (!company) return;
        
        // Update logo and company name
        const logoElements = document.querySelectorAll('.logo');
        logoElements.forEach(logo => {
            if (company.logo && logo.querySelector('img')) {
                logo.querySelector('img').src = company.logo;
                logo.querySelector('img').alt = `${company.name} Logo`;
            } else {
                logo.textContent = company.name;
            }
        });
        
        // Update hero section
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroDescription = document.querySelector('.hero-description');
        
        if (heroTitle) heroTitle.textContent = company.name;
        if (heroSubtitle) heroSubtitle.textContent = company.tagline;
        if (heroDescription) heroDescription.textContent = company.description;
        
        // Update established year and projects completed
        const establishedElement = document.querySelector('[data-established]');
        const projectsElement = document.querySelector('[data-projects]');
        
        if (establishedElement) establishedElement.textContent = company.established;
        if (projectsElement) projectsElement.textContent = company.projectsCompleted;
    }

    /**
     * Populate services section
     */
    populateServices() {
        const { services } = this.config;
        if (!services || !Array.isArray(services)) return;
        
        const servicesContainer = document.querySelector('.services-grid');
        if (!servicesContainer) return;
        
        servicesContainer.innerHTML = '';
        
        services.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'card service-card';
            serviceCard.innerHTML = `
                <div class="service-image" style="background-image: url('${service.featuredImage}')"></div>
                <div class="card-header">
                    <div class="card-icon">${service.icon}</div>
                    <h3 class="card-title">${service.name}</h3>
                </div>
                <div class="card-content">
                    <p>${service.description}</p>
                    <div class="service-price">${service.priceRange}</div>
                    <div class="service-duration">Duration: ${service.duration}</div>
                </div>
                <div class="card-footer">
                    <a href="contact.html?service=${service.id}" class="btn btn-primary">Get Quote</a>
                </div>
            `;
            servicesContainer.appendChild(serviceCard);
        });
    }

    /**
     * Populate testimonials section
     */
    populateTestimonials() {
        const { testimonials } = this.config;
        if (!testimonials || !Array.isArray(testimonials)) return;
        
        const testimonialsContainer = document.querySelector('.testimonials-slider');
        if (!testimonialsContainer) return;
        
        testimonialsContainer.innerHTML = '';
        
        testimonials.forEach((testimonial, index) => {
            const testimonialCard = document.createElement('div');
            testimonialCard.className = `testimonial-card ${index === 0 ? 'active' : ''}`;
            
            const stars = '★'.repeat(testimonial.rating) + '☆'.repeat(5 - testimonial.rating);
            
            testimonialCard.innerHTML = `
                <div class="testimonial-rating">
                    <span class="stars">${stars}</span>
                </div>
                <p class="testimonial-text">"${testimonial.text}"</p>
                <div class="testimonial-author">${testimonial.name}</div>
                <div class="testimonial-location">${testimonial.location}</div>
                <div class="testimonial-project">${testimonial.projectType}</div>
            `;
            testimonialsContainer.appendChild(testimonialCard);
        });
        
        // Initialize testimonial slider if multiple testimonials
        if (testimonials.length > 1) {
            this.initializeTestimonialSlider();
        }
    }

    /**
     * Initialize testimonial slider
     */
    initializeTestimonialSlider() {
        const testimonials = document.querySelectorAll('.testimonial-card');
        if (testimonials.length <= 1) return;
        
        let currentIndex = 0;
        
        const showTestimonial = (index) => {
            testimonials.forEach((testimonial, i) => {
                testimonial.classList.toggle('active', i === index);
            });
        };
        
        // Auto-rotate testimonials
        setInterval(() => {
            currentIndex = (currentIndex + 1) % testimonials.length;
            showTestimonial(currentIndex);
        }, 5000);
    }

    /**
     * Populate accreditations section
     */
    populateAccreditations() {
        const { accreditations } = this.config;
        if (!accreditations || !Array.isArray(accreditations)) return;
        
        const accreditationsContainer = document.querySelector('.accreditations-grid');
        if (!accreditationsContainer) return;
        
        accreditationsContainer.innerHTML = '';
        
        accreditations.forEach(accreditation => {
            const accreditationItem = document.createElement('div');
            accreditationItem.className = 'accreditation-item';
            
            // Check if certification is still valid
            const isValid = new Date(accreditation.validUntil) > new Date();
            const validityClass = isValid ? 'valid' : 'expired';
            
            accreditationItem.innerHTML = `
                <img src="${accreditation.logo}" alt="${accreditation.name}" class="accreditation-logo">
                <div class="accreditation-name">${accreditation.name}</div>
                <div class="accreditation-number">No: ${accreditation.number}</div>
                <div class="accreditation-validity ${validityClass}">
                    Valid until: ${new Date(accreditation.validUntil).toLocaleDateString()}
                </div>
                ${accreditation.verificationUrl ? 
                    `<a href="${accreditation.verificationUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-small">Verify</a>` : ''}
            `;
            accreditationsContainer.appendChild(accreditationItem);
        });
    }

    /**
     * Populate contact information
     */
    populateContactInfo() {
        const { company } = this.config;
        if (!company?.contact) return;
        
        // Update phone numbers
        const phoneElements = document.querySelectorAll('[data-phone]');
        phoneElements.forEach(element => {
            element.textContent = company.contact.phone;
            element.href = `tel:${company.contact.phone}`;
        });
        
        // Update email addresses
        const emailElements = document.querySelectorAll('[data-email]');
        emailElements.forEach(element => {
            element.textContent = company.contact.email;
            element.href = `mailto:${company.contact.email}`;
        });
        
        // Update emergency phone
        const emergencyElements = document.querySelectorAll('[data-emergency-phone]');
        emergencyElements.forEach(element => {
            element.textContent = company.contact.emergencyPhone;
            element.href = `tel:${company.contact.emergencyPhone}`;
        });
        
        // Update address
        const addressElements = document.querySelectorAll('[data-address]');
        addressElements.forEach(element => {
            const { address } = company.contact;
            element.innerHTML = `
                ${address.street}<br>
                ${address.city}, ${address.postcode}<br>
                ${address.country}
            `;
        });
        
        // Update business hours
        const hoursElements = document.querySelectorAll('[data-hours]');
        hoursElements.forEach(element => {
            let hoursHTML = '';
            Object.keys(company.hours).forEach(day => {
                const dayCapitalized = day.charAt(0).toUpperCase() + day.slice(1);
                hoursHTML += `<div><strong>${dayCapitalized}:</strong> ${company.hours[day]}</div>`;
            });
            element.innerHTML = hoursHTML;
        });
    }

    /**
     * Populate footer information
     */
    populateFooter() {
        const { company } = this.config;
        if (!company) return;
        
        // Update copyright year
        const copyrightElements = document.querySelectorAll('[data-copyright]');
        const currentYear = new Date().getFullYear();
        copyrightElements.forEach(element => {
            element.textContent = `© ${currentYear} ${company.name}. All rights reserved.`;
        });
        
        // Update social media links
        const socialLinks = document.querySelector('.social-links');
        if (socialLinks && company.socialMedia) {
            socialLinks.innerHTML = '';
            
            if (company.socialMedia.instagram) {
                socialLinks.innerHTML += `
                    <a href="https://instagram.com/${company.socialMedia.instagram.replace('@', '')}" 
                       target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Instagram">
                        📷
                    </a>
                `;
            }
            
            if (company.socialMedia.facebook) {
                socialLinks.innerHTML += `
                    <a href="https://facebook.com/${company.socialMedia.facebook}" 
                       target="_blank" rel="noopener noreferrer" class="social-link" aria-label="Facebook">
                        📘
                    </a>
                `;
            }
            
            if (company.socialMedia.linkedin) {
                socialLinks.innerHTML += `
                    <a href="https://linkedin.com/${company.socialMedia.linkedin}" 
                       target="_blank" rel="noopener noreferrer" class="social-link" aria-label="LinkedIn">
                        💼
                    </a>
                `;
            }
        }
    }

    /**
     * Initialize intersection observer for animations
     */
    initializeIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Observe elements that should animate in
        const animateElements = document.querySelectorAll('.card, .service-card, .testimonial-card, .accreditation-item');
        animateElements.forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Initialize lazy loading for images
     */
    initializeLazyLoading() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        } else {
            // Fallback for browsers without IntersectionObserver
            lazyImages.forEach(img => {
                img.src = img.dataset.src;
                img.classList.remove('lazy');
            });
        }
    }

    /**
     * Initialize page-specific features
     */
    initializePageSpecificFeatures() {
        const page = this.currentPage.replace('.html', '');
        
        switch (page) {
            case 'index':
            case '':
                this.initializeHomePage();
                break;
            case 'gallery':
                this.initializeGalleryPage();
                break;
            case 'contact':
                this.initializeContactPage();
                break;
            case 'booking':
                this.initializeBookingPage();
                break;
        }
    }

    /**
     * Initialize home page specific features
     */
    initializeHomePage() {
        // Initialize hero background
        this.initializeHeroBackground();
        
        // Initialize scroll-to-section functionality
        this.initializeScrollToSection();
    }

    /**
     * Initialize hero background
     */
    initializeHeroBackground() {
        const heroBackground = document.querySelector('.hero-background');
        if (heroBackground && this.config?.gallery?.featuredProjects?.length > 0) {
            const featuredProject = this.config.gallery.featuredProjects[0];
            if (featuredProject.images && featuredProject.images.length > 0) {
                heroBackground.style.backgroundImage = `url('${featuredProject.images[0]}')`;
            }
        }
    }

    /**
     * Initialize scroll to section functionality
     */
    initializeScrollToSection() {
        const scrollLinks = document.querySelectorAll('a[href^="#"]');
        
        scrollLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
                    const targetPosition = targetSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Initialize gallery page
     */
    initializeGalleryPage() {
        // This will be implemented in Stage 2
        console.log('Gallery page features will be implemented in Stage 2');
    }

    /**
     * Initialize contact page
     */
    initializeContactPage() {
        // Initialize contact form
        this.initializeContactForm();
    }

    /**
     * Initialize booking page
     */
    initializeBookingPage() {
        // This will be implemented in Stage 4
        console.log('Booking page features will be implemented in Stage 4');
    }

    /**
     * Initialize contact form
     */
    initializeContactForm() {
        const contactForm = document.querySelector('#contact-form');
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Basic form validation
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            // Validate required fields
            const requiredFields = ['name', 'email', 'message'];
            const missingFields = requiredFields.filter(field => !data[field]?.trim());
            
            if (missingFields.length > 0) {
                this.showFormError(`Please fill in the following fields: ${missingFields.join(', ')}`);
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                this.showFormError('Please enter a valid email address.');
                return;
            }
            
            // Show success message (in a real implementation, this would send the email)
            this.showFormSuccess('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }

    /**
     * Show form error message
     */
    showFormError(message) {
        this.showFormMessage(message, 'error');
    }

    /**
     * Show form success message
     */
    showFormSuccess(message) {
        this.showFormMessage(message, 'success');
    }

    /**
     * Show form message
     */
    showFormMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.form-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message form-message-${type}`;
        messageDiv.textContent = message;
        
        const form = document.querySelector('#contact-form');
        if (form) {
            form.insertBefore(messageDiv, form.firstChild);
            
            // Auto-remove message after 5 seconds
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
        }
    }

    /**
     * Get configuration value
     */
    getConfig(path) {
        return window.siteConfig.getValue(path);
    }

    /**
     * Utility method to format phone numbers
     */
    formatPhoneNumber(phone) {
        // Remove all non-digit characters except +
        const cleaned = phone.replace(/[^\d+]/g, '');
        
        // Format UK phone numbers
        if (cleaned.startsWith('+44')) {
            return cleaned.replace(/(\+44)(\d{4})(\d{3})(\d{3})/, '$1 $2 $3 $4');
        }
        
        return phone;
    }

    /**
     * Utility method to format dates
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Initialize site when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.siteManager = new SiteManager();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && window.siteManager) {
        // Refresh any time-sensitive data when page becomes visible
        window.siteManager.updateActiveNavigation();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Close mobile menu on resize to larger screen
    const navMenu = document.querySelector('.nav-menu');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    
    if (window.innerWidth > 768 && navMenu?.classList.contains('active')) {
        navMenu.classList.remove('active');
        mobileToggle?.classList.remove('active');
        mobileToggle?.setAttribute('aria-expanded', 'false');
        if (mobileToggle) mobileToggle.innerHTML = '☰';
    }
});