/**
 * XML Configuration Parser with Compiled Configuration Support
 * Prefers compiled configuration for performance, falls back to XML parsing
 */

class XMLConfigParser {
    constructor() {
        this.config = null;
        this.loaded = false;
        this.useCompiledConfig = false;
        this.startTime = null;
    }

    /**
     * Load configuration - prefers compiled, falls back to XML
     * @returns {Promise<Object>} Parsed configuration object
     */
    async loadConfig() {
        if (this.loaded && this.config) {
            return this.config;
        }

        this.startTime = performance.now();

        // First try to use compiled configuration
        if (window.compiledConfig && window.compiledConfig.loaded) {
            console.log('Using pre-compiled configuration for improved performance');
            this.config = window.compiledConfig.config;
            this.loaded = true;
            this.useCompiledConfig = true;

            // Apply branding styles immediately
            window.compiledConfig.applyBrandingStyles();

            const loadTime = performance.now() - this.startTime;
            console.log(`Configuration loaded in ${loadTime.toFixed(1)}ms (compiled)`);

            return this.config;
        }

        // Fall back to XML parsing
        console.warn('Compiled configuration not available, falling back to XML parsing');
        return this.loadFromXML();
    }

    /**
     * Load and parse the XML configuration file (fallback method)
     * @returns {Promise<Object>} Parsed configuration object
     */
    async loadFromXML() {
        try {
            const response = await fetch('config/site-config.xml');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const xmlText = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

            // Check for parsing errors
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                throw new Error('XML parsing error: ' + parseError.textContent);
            }

            this.config = this.parseXMLToObject(xmlDoc);
            this.loaded = true;

            // Apply branding and design styles
            this.applyBrandingStyles();
            this.applyDesignStyles();

            const loadTime = performance.now() - this.startTime;
            console.log(`Configuration loaded in ${loadTime.toFixed(1)}ms (XML parsed)`);

            return this.config;
        } catch (error) {
            console.warn('Failed to load XML configuration, using fallback data:', error);
            // Use fallback configuration when XML loading fails
            this.config = this.getFallbackConfig();
            this.loaded = true;

            const loadTime = performance.now() - this.startTime;
            console.log(`Configuration loaded in ${loadTime.toFixed(1)}ms (fallback)`);

            return this.config;
        }
    }

    /**
     * Initialize configuration and populate DOM
     * @returns {Promise<Object>} Configuration object
     */
    async init() {
        await this.loadConfig();
        this.populateFromXML();
        return this.config;
    }

    /**
     * Check if a feature is enabled
     * @param {string} featurePath - Path to feature (e.g., 'hero-section', 'services-page.service-cards')
     * @returns {boolean} True if feature is enabled
     */
    isFeatureEnabled(featurePath) {
        // Use compiled config feature checking if available
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.isFeatureEnabled(featurePath);
        }

        // Fallback to XML-based feature checking
        if (!this.config || !this.config['feature-toggles']) {
            return true; // Default to enabled if no toggles defined
        }

        const pathParts = featurePath.split('.');
        let current = this.config['feature-toggles'];

        for (const part of pathParts) {
            if (!current[part]) {
                return true; // Default to enabled if path doesn't exist
            }
            current = current[part];
        }

        // Handle both object with enabled property and direct boolean
        if (typeof current === 'object' && current.enabled !== undefined) {
            return current.enabled === 'true' || current.enabled === true;
        }

        return current === 'true' || current === true;
    }

    /**
     * Fallback configuration when XML loading fails
     * @returns {Object} Fallback configuration object
     */
    getFallbackConfig() {
        return {
            'feature-toggles': {
                'hero-section': { enabled: true },
                'services-section': { enabled: true },
                'testimonials-section': { enabled: true },
                'why-choose-us-section': { enabled: true },
                'accreditations-section': { enabled: true },
                'gallery-section': { enabled: true },
                'contact-section': { enabled: true },
                'chatbot': { enabled: true },
                'calendar-booking': { enabled: true },
                'quick-quote-modal': { enabled: true },
                'theme-switcher': { enabled: true },
                'instagram-integration': { enabled: true },
                'analytics-tracking': { enabled: true },
                'booking-analytics': { enabled: true },
                'automated-workflows': { enabled: true },
                'emergency-booking': { enabled: true },
                'services-page': {
                    'service-cards': { enabled: true },
                    'pricing-display': { enabled: true },
                    'duration-display': { enabled: true },
                    'service-icons': { enabled: true }
                },
                'gallery-page': {
                    'image-gallery': { enabled: true },
                    'category-filter': { enabled: true },
                    'lightbox-viewer': { enabled: true },
                    'instagram-feed': { enabled: true }
                },
                'booking-page': {
                    'consultation-types': { enabled: true },
                    'calendar-widget': { enabled: true },
                    'time-slot-selector': { enabled: true },
                    'appointment-booking': { enabled: true },
                    'emergency-section': { enabled: true }
                },
                'contact-page': {
                    'contact-form': { enabled: true },
                    'business-hours': { enabled: true },
                    'location-map': { enabled: true },
                    'emergency-contact': { enabled: true }
                },
                'navigation': {
                    'mobile-menu': { enabled: true },
                    'theme-dropdown': { enabled: true },
                    'active-page-highlighting': { enabled: true }
                },
                'footer': {
                    'social-links': { enabled: true },
                    'quick-links': { enabled: true },
                    'contact-info': { enabled: true },
                    'copyright': { enabled: true }
                }
            },
            design: {
                theme: 'kjs-style',
                colors: {
                    primary: '#212121',
                    secondary: '#0fb6ee',
                    accent: '#0fb6ee',
                    background: '#f7f7f7',
                    white: '#ffffff',
                    text: '#000000',
                    'text-light': '#ffffff'
                },
                fonts: {
                    heading: 'Montserrat',
                    body: 'Open Sans',
                    baseSize: '14px'
                }
            },
            'top-bar': {
                enabled: true,
                showOnMobile: false,
                phoneIcon: true,
                emailIcon: true,
                socialPosition: 'right'
            },
            'hero-slider': {
                enabled: true,
                autoPlay: true,
                interval: 5000,
                transitionSpeed: 600,
                heights: {
                    desktop: '900px',
                    tablet: '600px',
                    mobile: '400px'
                },
                showArrows: true,
                showDots: true,
                slides: [
                    { image: 'images/hero/slide-1.jpg', alt: 'Quality construction work' },
                    { image: 'images/hero/slide-2.jpg', alt: 'Professional building services' },
                    { image: 'images/hero/slide-3.jpg', alt: 'Home extensions' },
                    { image: 'images/hero/slide-4.jpg', alt: 'Kitchen renovations' }
                ]
            },
            company: {
                name: "Raiswell Building Services",
                tagline: "Quality Construction You Can Trust",
                description: "Professional building services with over 15 years of experience. Specializing in home extensions, kitchen fitting, bathroom renovations, and general construction work across London and the South East.",
                logo: "images/hero/company-logo.png",
                established: "2008",
                projectsCompleted: "500+",
                contact: {
                    phone: "+44 7700 900123",
                    email: "colin@raiswell.com",
                    emergencyPhone: "+44 7700 900999",
                    address: {
                        street: "45 High Street",
                        city: "Orpington",
                        postcode: "BR6 0JH",
                        county: "Kent",
                        country: "United Kingdom"
                    }
                },
                hours: {
                    monday: "08:00-18:00",
                    tuesday: "08:00-18:00",
                    wednesday: "08:00-18:00",
                    thursday: "08:00-18:00",
                    friday: "08:00-18:00",
                    saturday: "08:00-16:00",
                    sunday: "Emergency Only"
                },
                socialMedia: {
                    instagram: "@Raiswellbuilds",
                    facebook: "RaiswellBuildsUK",
                    linkedin: "company/Raiswell-building-services"
                }
            },
            branding: {
                colors: {
                    primary: "#212121",
                    secondary: "#0fb6ee",
                    accent: "#0fb6ee",
                    background: "#f7f7f7",
                    white: "#ffffff",
                    text: "#000000",
                    "text-light": "#ffffff",
                    "light-gray": "#ECF0F1"
                },
                typography: {
                    primaryFont: "Open Sans, sans-serif",
                    headingFont: "Montserrat, sans-serif",
                    baseSize: "14px"
                }
            },
            services: [
                {
                    id: "extensions",
                    name: "Home Extensions",
                    description: "Single and double-storey extensions, conservatories, and garden rooms. Full planning permission support and project management.",
                    icon: "🏠",
                    duration: "4-12 weeks",
                    priceRange: "£15,000 - £50,000",
                    featuredImage: "images/services/extension-placeholder.svg"
                },
                {
                    id: "kitchens",
                    name: "Kitchen Fitting",
                    description: "Complete kitchen design and installation. From contemporary to traditional styles, including all plumbing and electrical work.",
                    icon: "🍽️",
                    duration: "1-3 weeks",
                    priceRange: "£8,000 - £25,000",
                    featuredImage: "images/services/kitchen-placeholder.svg"
                },
                {
                    id: "bathrooms",
                    name: "Bathroom Renovations",
                    description: "Full bathroom refurbishment including tiling, plumbing, and electrical work. Luxury fittings and accessible design options.",
                    icon: "🛁",
                    duration: "1-2 weeks",
                    priceRange: "£5,000 - £15,000",
                    featuredImage: "images/services/bathroom-placeholder.svg"
                },
                {
                    id: "general",
                    name: "General Building",
                    description: "Property maintenance, repairs, roofing, plastering, and general construction work. No job too small.",
                    icon: "🔨",
                    duration: "1 day - 2 weeks",
                    priceRange: "£200 - £5,000",
                    featuredImage: "images/services/general-placeholder.svg"
                }
            ],
            accreditations: [
                {
                    id: "gas-safe",
                    name: "Gas Safe Registered",
                    number: "123456",
                    issuer: "Gas Safe Register",
                    validUntil: "2025-03-15",
                    logo: "images/accreditation/gas-safe.png",
                    verificationUrl: "https://www.gassaferegister.co.uk/find-an-engineer/"
                },
                {
                    id: "niceic",
                    name: "NICEIC Approved Contractor",
                    number: "ABC123",
                    issuer: "NICEIC",
                    validUntil: "2025-06-30",
                    logo: "images/accreditation/niceic.png",
                    verificationUrl: "https://www.niceic.com/find-a-contractor"
                },
                {
                    id: "fmb",
                    name: "Federation of Master Builders",
                    number: "FMB789",
                    issuer: "FMB",
                    validUntil: "2025-12-31",
                    logo: "images/accreditation/fmb.png",
                    verificationUrl: "https://www.fmb.org.uk/find-a-builder/"
                },
                {
                    id: "checkatrade",
                    name: "Checkatrade Approved",
                    number: "456789",
                    issuer: "Checkatrade",
                    validUntil: "2025-08-15",
                    logo: "images/accreditation/checkatrade.png",
                    verificationUrl: "https://www.checkatrade.com/"
                }
            ],
            testimonials: [
                {
                    name: "Sarah Thompson",
                    location: "Orpington, Kent",
                    rating: 5,
                    text: "Raiswell transformed our dated kitchen into a stunning modern space. Professional, reliable, and excellent attention to detail. Highly recommended!",
                    projectType: "Kitchen Renovation",
                    date: "2024-01-15"
                },
                {
                    name: "Mike & Jenny Roberts",
                    location: "Bromley, Kent",
                    rating: 5,
                    text: "Our house extension was completed on time and within budget. Raiswell's expertise and communication throughout the project was exceptional.",
                    projectType: "Single Storey Extension",
                    date: "2023-11-30"
                },
                {
                    name: "David Wilson",
                    location: "Croydon, Surrey",
                    rating: 5,
                    text: "Emergency roof repair completed quickly and professionally. Raiswell went above and beyond to ensure our home was weatherproof.",
                    projectType: "Emergency Repairs",
                    date: "2024-02-20"
                }
            ],
            gallery: {
                instagramHandle: "Raiswellbuilds",
                categories: [
                    { id: "extensions", name: "Extensions" },
                    { id: "kitchens", name: "Kitchens" },
                    { id: "bathrooms", name: "Bathrooms" },
                    { id: "general", name: "General Work" },
                    { id: "before-after", name: "Before & After" }
                ],
                featuredProjects: [
                    {
                        id: "modern-extension",
                        title: "Modern Two-Storey Extension",
                        description: "Contemporary glass and steel extension adding 40sqm of living space",
                        category: "extensions",
                        location: "Beckenham, Kent",
                        duration: "8 weeks",
                        year: "2024",
                        images: [
                            "images/gallery/ext-modern-1.jpg",
                            "images/gallery/ext-modern-2.jpg",
                            "images/gallery/ext-modern-3.jpg"
                        ]
                    }
                ]
            },
            seo: {
                meta: {
                    title: "Raiswell Building Services | Local Builder",
                    description: "Professional building services in Manchester. Extensions, kitchens, bathrooms & general building work. Gas Safe registered, NICEIC approved. Free quotes.",
                    keywords: "builder manchester, home extensions, kitchen fitting, bathroom renovation, building services, gas safe, niceic",
                    author: "Raiswell's Professional Building Services"
                },
                analytics: {
                    googleAnalyticsId: "GA-XXXXXXXX-X",
                    googleTagManagerId: "GTM-XXXXXXX"
                },
                localBusiness: {
                    type: "GeneralContractor",
                    areaServed: "Greater Manchester, UK",
                    priceRange: "££"
                }
            }
        };
    }

    /**
     * Convert XML document to JavaScript object
     * @param {Document} xmlDoc - XML document
     * @returns {Object} Configuration object
     */
    parseXMLToObject(xmlDoc) {
        const config = {};
        const root = xmlDoc.documentElement;

        // Parse feature toggles
        config['feature-toggles'] = this.parseFeatureToggles(root.querySelector('feature-toggles'));

        // Parse design configuration
        config.design = this.parseDesign(root.querySelector('design'));

        // Parse top bar configuration
        config['top-bar'] = this.parseTopBar(root.querySelector('top-bar'));

        // Parse hero slider configuration
        config['hero-slider'] = this.parseHeroSlider(root.querySelector('hero-slider'));

        // Parse company information
        config.company = this.parseCompanyInfo(root.querySelector('company'));

        // Parse branding
        config.branding = this.parseBranding(root.querySelector('branding'));

        // Parse services
        config.services = this.parseServices(root.querySelector('services'));

        // Parse accreditations
        config.accreditations = this.parseAccreditations(root.querySelector('accreditations'));

        // Parse gallery configuration
        config.gallery = this.parseGallery(root.querySelector('gallery'));

        // Parse testimonials
        config.testimonials = this.parseTestimonials(root.querySelector('testimonials'));

        // Parse chatbot configuration
        config.chatbot = this.parseChatbot(root.querySelector('chatbot'));

        // Parse calendar configuration
        config.calendar = this.parseCalendar(root.querySelector('calendar'));

        // Parse SEO configuration
        config.seo = this.parseSEO(root.querySelector('seo'));

        // Parse pages configuration
        config.pages = this.parsePages(root.querySelector('pages'));

        // Parse UI configuration
        config.ui = this.parseUI(root.querySelector('ui'));

        // Parse forms configuration
        config.forms = this.parseForms(root.querySelector('forms'));

        // Parse business policies
        config['business-policies'] = this.parseBusinessPolicies(root.querySelector('business-policies'));

        // Parse service areas
        config['service-areas'] = this.parseServiceAreas(root.querySelector('service-areas'));

        return config;
    }

    /**
     * Parse feature toggles section
     */
    parseFeatureToggles(togglesNode) {
        if (!togglesNode) return {};

        const toggles = {};
        const parseNode = (node) => {
            const result = {};
            for (let child of node.children) {
                const enabled = child.getAttribute('enabled');
                if (child.children.length > 0) {
                    // Has nested toggles
                    result[child.tagName] = parseNode(child);
                } else {
                    // Leaf node
                    result[child.tagName] = { enabled: enabled === 'true' };
                }
            }
            return result;
        };

        return parseNode(togglesNode);
    }

    /**
     * Parse design configuration
     * @returns {Object} Design configuration
     */
    parseDesign(designNode) {
        if (!designNode) return {};

        const design = {
            theme: this.getTextContent(designNode, 'theme'),
            colors: {},
            fonts: {}
        };

        // Parse colors
        const colorsNode = designNode.querySelector('colors');
        if (colorsNode) {
            for (let child of colorsNode.children) {
                design.colors[child.tagName] = child.textContent.trim();
            }
        }

        // Parse fonts
        const fontsNode = designNode.querySelector('fonts');
        if (fontsNode) {
            design.fonts = {
                heading: this.getTextContent(fontsNode, 'heading'),
                body: this.getTextContent(fontsNode, 'body'),
                baseSize: this.getTextContent(fontsNode, 'base-size')
            };
        }

        return design;
    }

    /**
     * Parse top bar configuration
     * @returns {Object} Top bar configuration
     */
    parseTopBar(topBarNode) {
        if (!topBarNode) return {};

        return {
            enabled: this.getTextContent(topBarNode, 'enabled') === 'true',
            showOnMobile: this.getTextContent(topBarNode, 'show-on-mobile') === 'true',
            phoneIcon: this.getTextContent(topBarNode, 'phone-icon') === 'true',
            emailIcon: this.getTextContent(topBarNode, 'email-icon') === 'true',
            socialPosition: this.getTextContent(topBarNode, 'social-position')
        };
    }

    /**
     * Parse hero slider configuration
     * @returns {Object} Hero slider configuration
     */
    parseHeroSlider(sliderNode) {
        if (!sliderNode) return {};

        const slider = {
            enabled: this.getTextContent(sliderNode, 'enabled') === 'true',
            autoPlay: this.getTextContent(sliderNode, 'auto-play') === 'true',
            interval: parseInt(this.getTextContent(sliderNode, 'interval')) || 5000,
            transitionSpeed: parseInt(this.getTextContent(sliderNode, 'transition-speed')) || 600,
            heights: {
                desktop: this.getTextContent(sliderNode, 'height-desktop') || '900px',
                tablet: this.getTextContent(sliderNode, 'height-tablet') || '600px',
                mobile: this.getTextContent(sliderNode, 'height-mobile') || '400px'
            },
            showArrows: this.getTextContent(sliderNode, 'show-arrows') === 'true',
            showDots: this.getTextContent(sliderNode, 'show-dots') === 'true',
            slides: []
        };

        // Parse slides
        const slidesNode = sliderNode.querySelector('slides');
        if (slidesNode) {
            const slideNodes = slidesNode.querySelectorAll('slide');
            slideNodes.forEach(slideNode => {
                slider.slides.push({
                    image: this.getTextContent(slideNode, 'image'),
                    alt: this.getTextContent(slideNode, 'alt')
                });
            });
        }

        return slider;
    }

    /**
     * Parse pages configuration
     */
    parsePages(pagesNode) {
        if (!pagesNode) return {};

        const pages = {};
        const pageNodes = pagesNode.querySelectorAll('page');

        pageNodes.forEach(pageNode => {
            const pageName = pageNode.getAttribute('name');
            pages[pageName] = this.parsePageContent(pageNode);
        });

        return pages;
    }

    /**
     * Parse individual page content
     */
    parsePageContent(pageNode) {
        const page = {
            name: pageNode.getAttribute('name')
        };

        // Parse all child nodes
        for (let child of pageNode.children) {
            const tagName = child.tagName;

            if (child.children.length > 0) {
                // Has nested content
                page[tagName] = this.parseNestedContent(child);
            } else {
                // Simple text content
                page[tagName] = child.textContent.trim();
            }
        }

        return page;
    }

    /**
     * Parse nested content recursively
     */
    parseNestedContent(node) {
        const result = {};

        for (let child of node.children) {
            const tagName = child.tagName;

            if (child.children.length > 0) {
                // Check if it's an array of similar items
                const similarChildren = Array.from(node.children).filter(c => c.tagName === tagName);

                if (similarChildren.length > 1) {
                    // It's an array
                    if (!result[tagName]) {
                        result[tagName] = [];
                    }
                    result[tagName].push(this.parseNestedContent(child));
                } else {
                    // It's a nested object
                    result[tagName] = this.parseNestedContent(child);
                }
            } else {
                // Simple text content
                result[tagName] = child.textContent.trim();
            }
        }

        return result;
    }

    /**
     * Parse UI configuration
     */
    parseUI(uiNode) {
        if (!uiNode) return {};

        const ui = {};

        // Parse navigation
        const navNode = uiNode.querySelector('navigation');
        if (navNode) {
            ui.navigation = this.parseNestedContent(navNode);
        }

        // Parse buttons
        const buttonsNode = uiNode.querySelector('buttons');
        if (buttonsNode) {
            ui.buttons = {};
            for (let child of buttonsNode.children) {
                ui.buttons[child.tagName] = child.textContent.trim();
            }
        }

        // Parse messages
        const messagesNode = uiNode.querySelector('messages');
        if (messagesNode) {
            ui.messages = this.parseNestedContent(messagesNode);
        }

        // Parse labels
        const labelsNode = uiNode.querySelector('labels');
        if (labelsNode) {
            ui.labels = {};
            for (let child of labelsNode.children) {
                ui.labels[child.tagName] = child.textContent.trim();
            }
        }

        return ui;
    }

    /**
     * Parse forms configuration
     */
    parseForms(formsNode) {
        if (!formsNode) return {};

        const forms = {};

        for (let formNode of formsNode.children) {
            const formName = formNode.tagName;
            forms[formName] = this.parseFormConfig(formNode);
        }

        return forms;
    }

    /**
     * Parse individual form configuration
     */
    parseFormConfig(formNode) {
        const form = {
            title: this.getTextContent(formNode, 'title'),
            subtitle: this.getTextContent(formNode, 'subtitle'),
            fields: []
        };

        // Parse fields
        const fieldsNode = formNode.querySelector('fields');
        if (fieldsNode) {
            const fieldNodes = fieldsNode.querySelectorAll('field');
            fieldNodes.forEach(fieldNode => {
                const field = {
                    name: fieldNode.getAttribute('name'),
                    type: fieldNode.getAttribute('type'),
                    label: fieldNode.getAttribute('label'),
                    placeholder: fieldNode.getAttribute('placeholder'),
                    required: fieldNode.getAttribute('required') === 'true',
                    rows: fieldNode.getAttribute('rows')
                };

                // Parse options if present
                const optionsNode = fieldNode.querySelector('options');
                if (optionsNode) {
                    field.options = [];
                    const optionNodes = optionsNode.querySelectorAll('option');
                    optionNodes.forEach(optionNode => {
                        field.options.push({
                            value: optionNode.getAttribute('value'),
                            text: optionNode.textContent.trim()
                        });
                    });
                }

                form.fields.push(field);
            });
        }

        // Parse messages
        const messagesNode = formNode.querySelector('messages');
        if (messagesNode) {
            form.messages = {};
            for (let child of messagesNode.children) {
                form.messages[child.tagName] = child.textContent.trim();
            }
        }

        // Parse guidance if present
        const guidanceNode = formNode.querySelector('guidance');
        if (guidanceNode) {
            form.guidance = this.parseNestedContent(guidanceNode);
        }

        return form;
    }

    /**
     * Parse business policies section
     */
    parseBusinessPolicies(policiesNode) {
        if (!policiesNode) return {};
        return this.parseNestedContent(policiesNode);
    }

    /**
     * Parse service areas section
     */
    parseServiceAreas(areasNode) {
        if (!areasNode) return {};

        const serviceAreas = {
            regions: [],
            fallbackMessage: this.getTextContent(areasNode, 'fallback-message')
        };

        const regionNodes = areasNode.querySelectorAll('region');
        regionNodes.forEach(regionNode => {
            const region = {
                name: regionNode.getAttribute('name'),
                areas: []
            };

            const areaNodes = regionNode.querySelectorAll('area');
            areaNodes.forEach(areaNode => {
                region.areas.push(areaNode.textContent.trim());
            });

            serviceAreas.regions.push(region);
        });

        return serviceAreas;
    }

    /**
     * Parse company information section
     */
    parseCompanyInfo(companyNode) {
        if (!companyNode) return {};

        const company = {
            name: this.getTextContent(companyNode, 'name'),
            tagline: this.getTextContent(companyNode, 'tagline'),
            description: this.getTextContent(companyNode, 'description'),
            logo: this.getTextContent(companyNode, 'logo'),
            established: this.getTextContent(companyNode, 'established'),
            projectsCompleted: this.getTextContent(companyNode, 'projects-completed'),
            contact: {},
            hours: {},
            socialMedia: {}
        };

        // Parse contact information
        const contactNode = companyNode.querySelector('contact');
        if (contactNode) {
            company.contact = {
                phone: this.getTextContent(contactNode, 'phone'),
                email: this.getTextContent(contactNode, 'email'),
                emergencyPhone: this.getTextContent(contactNode, 'emergency-phone'),
                address: {}
            };

            const addressNode = contactNode.querySelector('address');
            if (addressNode) {
                company.contact.address = {
                    street: this.getTextContent(addressNode, 'street'),
                    city: this.getTextContent(addressNode, 'city'),
                    postcode: this.getTextContent(addressNode, 'postcode'),
                    county: this.getTextContent(addressNode, 'county'),
                    country: this.getTextContent(addressNode, 'country')
                };
            }
        }

        // Parse business hours
        const hoursNode = companyNode.querySelector('hours');
        if (hoursNode) {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            days.forEach(day => {
                company.hours[day] = this.getTextContent(hoursNode, day);
            });
        }

        // Parse social media
        const socialNode = companyNode.querySelector('social-media');
        if (socialNode) {
            company.socialMedia = {
                instagram: this.getTextContent(socialNode, 'instagram'),
                facebook: this.getTextContent(socialNode, 'facebook'),
                linkedin: this.getTextContent(socialNode, 'linkedin')
            };
        }

        return company;
    }

    /**
     * Parse branding section
     */
    parseBranding(brandingNode) {
        if (!brandingNode) return {};

        const branding = {
            colors: {},
            typography: {}
        };

        // Parse colors
        const colorsNode = brandingNode.querySelector('colors');
        if (colorsNode) {
            const colorElements = colorsNode.children;
            for (let i = 0; i < colorElements.length; i++) {
                const element = colorElements[i];
                branding.colors[element.tagName] = element.textContent.trim();
            }
        }

        // Parse typography
        const typographyNode = brandingNode.querySelector('typography');
        if (typographyNode) {
            branding.typography = {
                primaryFont: this.getTextContent(typographyNode, 'primary-font'),
                headingFont: this.getTextContent(typographyNode, 'heading-font'),
                baseSize: this.getTextContent(typographyNode, 'base-size')
            };
        }

        return branding;
    }

    /**
     * Parse services section
     */
    parseServices(servicesNode) {
        if (!servicesNode) return [];

        const services = [];
        const serviceNodes = servicesNode.querySelectorAll('service');

        serviceNodes.forEach(serviceNode => {
            services.push({
                id: serviceNode.getAttribute('id'),
                name: this.getTextContent(serviceNode, 'name'),
                description: this.getTextContent(serviceNode, 'description'),
                icon: this.getTextContent(serviceNode, 'icon'),
                duration: this.getTextContent(serviceNode, 'duration'),
                priceRange: this.getTextContent(serviceNode, 'price-range'),
                featuredImage: this.getTextContent(serviceNode, 'featured-image')
            });
        });

        return services;
    }

    /**
     * Parse accreditations section
     */
    parseAccreditations(accreditationsNode) {
        if (!accreditationsNode) return [];

        const accreditations = [];
        const certNodes = accreditationsNode.querySelectorAll('certification');

        certNodes.forEach(certNode => {
            accreditations.push({
                id: certNode.getAttribute('id'),
                name: this.getTextContent(certNode, 'name'),
                number: this.getTextContent(certNode, 'number'),
                issuer: this.getTextContent(certNode, 'issuer'),
                validUntil: this.getTextContent(certNode, 'valid-until'),
                logo: this.getTextContent(certNode, 'logo'),
                verificationUrl: this.getTextContent(certNode, 'verification-url')
            });
        });

        return accreditations;
    }

    /**
     * Parse gallery configuration
     */
    parseGallery(galleryNode) {
        if (!galleryNode) return {};

        const gallery = {
            instagramHandle: this.getTextContent(galleryNode, 'instagram-handle'),
            categories: [],
            featuredProjects: []
        };

        // Parse categories
        const categoriesNode = galleryNode.querySelector('categories');
        if (categoriesNode) {
            const categoryNodes = categoriesNode.querySelectorAll('category');
            categoryNodes.forEach(categoryNode => {
                gallery.categories.push({
                    id: categoryNode.getAttribute('id'),
                    name: categoryNode.getAttribute('name')
                });
            });
        }

        // Parse featured projects
        const projectsNode = galleryNode.querySelector('featured-projects');
        if (projectsNode) {
            const projectNodes = projectsNode.querySelectorAll('project');
            projectNodes.forEach(projectNode => {
                const project = {
                    id: projectNode.getAttribute('id'),
                    title: this.getTextContent(projectNode, 'title'),
                    description: this.getTextContent(projectNode, 'description'),
                    category: this.getTextContent(projectNode, 'category'),
                    location: this.getTextContent(projectNode, 'location'),
                    duration: this.getTextContent(projectNode, 'duration'),
                    year: this.getTextContent(projectNode, 'year'),
                    images: []
                };

                const imagesNode = projectNode.querySelector('images');
                if (imagesNode) {
                    const imageNodes = imagesNode.querySelectorAll('image');
                    imageNodes.forEach(imageNode => {
                        project.images.push(imageNode.textContent.trim());
                    });
                }

                gallery.featuredProjects.push(project);
            });
        }

        return gallery;
    }

    /**
     * Parse testimonials section
     */
    parseTestimonials(testimonialsNode) {
        if (!testimonialsNode) return [];

        const testimonials = [];
        const testimonialNodes = testimonialsNode.querySelectorAll('testimonial');

        testimonialNodes.forEach(testimonialNode => {
            testimonials.push({
                name: this.getTextContent(testimonialNode, 'name'),
                location: this.getTextContent(testimonialNode, 'location'),
                rating: parseInt(this.getTextContent(testimonialNode, 'rating')),
                text: this.getTextContent(testimonialNode, 'text'),
                projectType: this.getTextContent(testimonialNode, 'project-type'),
                date: this.getTextContent(testimonialNode, 'date'),
                author: this.getTextContent(testimonialNode, 'name') // Alias for compatibility
            });
        });

        return testimonials;
    }

    /**
     * Parse chatbot configuration
     */
    parseChatbot(chatbotNode) {
        if (!chatbotNode) return {};

        const chatbot = {
            apiKey: this.getTextContent(chatbotNode, 'api-key'),
            model: this.getTextContent(chatbotNode, 'model'),
            maxTokens: parseInt(this.getTextContent(chatbotNode, 'max-tokens')),
            temperature: parseFloat(this.getTextContent(chatbotNode, 'temperature')),
            personality: {},
            prompts: {},
            greetingMessages: {},
            escalationTriggers: [],
            ui: {}
        };

        // Parse UI configuration
        const uiNode = chatbotNode.querySelector('ui');
        if (uiNode) {
            chatbot.ui = this.parseNestedContent(uiNode);
        }

        // Parse personality
        const personalityNode = chatbotNode.querySelector('personality');
        if (personalityNode) {
            chatbot.personality = {
                tone: this.getTextContent(personalityNode, 'tone'),
                expertise: this.getTextContent(personalityNode, 'expertise'),
                style: this.getTextContent(personalityNode, 'style')
            };
        }

        // Parse prompts
        const promptsNode = chatbotNode.querySelector('prompts');
        if (promptsNode) {
            chatbot.prompts = {
                generalInquiry: this.getTextContent(promptsNode, 'general-inquiry'),
                quoteRequest: this.getTextContent(promptsNode, 'quote-request'),
                emergencyService: this.getTextContent(promptsNode, 'emergency-service')
            };
        }

        // Parse greeting messages
        const greetingsNode = chatbotNode.querySelector('greeting-messages');
        if (greetingsNode) {
            chatbot.greetingMessages = {
                default: this.getTextContent(greetingsNode, 'default'),
                emergency: this.getTextContent(greetingsNode, 'emergency')
            };
        }

        // Parse escalation triggers
        const triggersNode = chatbotNode.querySelector('escalation-triggers');
        if (triggersNode) {
            const triggerNodes = triggersNode.querySelectorAll('trigger');
            triggerNodes.forEach(triggerNode => {
                chatbot.escalationTriggers.push(triggerNode.textContent.trim());
            });
        }

        return chatbot;
    }

    /**
     * Parse calendar configuration
     */
    parseCalendar(calendarNode) {
        if (!calendarNode) return {};

        const calendar = {
            provider: this.getTextContent(calendarNode, 'provider'),
            googleCalendar: {},
            outlookCalendar: {},
            availability: {},
            appointmentTypes: [],
            blackoutDates: []
        };

        // Parse Google Calendar config
        const googleNode = calendarNode.querySelector('google-calendar');
        if (googleNode) {
            calendar.googleCalendar = {
                calendarId: this.getTextContent(googleNode, 'calendar-id'),
                clientId: this.getTextContent(googleNode, 'client-id'),
                clientSecret: this.getTextContent(googleNode, 'client-secret')
            };
        }

        // Parse Outlook Calendar config
        const outlookNode = calendarNode.querySelector('outlook-calendar');
        if (outlookNode) {
            calendar.outlookCalendar = {
                clientId: this.getTextContent(outlookNode, 'client-id'),
                clientSecret: this.getTextContent(outlookNode, 'client-secret'),
                tenantId: this.getTextContent(outlookNode, 'tenant-id')
            };
        }

        // Parse availability
        const availabilityNode = calendarNode.querySelector('availability');
        if (availabilityNode) {
            calendar.availability = {
                workingHours: {},
                bufferTime: parseInt(this.getTextContent(availabilityNode, 'buffer-time')),
                advanceBookingDays: parseInt(this.getTextContent(availabilityNode, 'advance-booking-days')),
                minimumNoticeHours: parseInt(this.getTextContent(availabilityNode, 'minimum-notice-hours'))
            };

            const hoursNode = availabilityNode.querySelector('working-hours');
            if (hoursNode) {
                const dayNodes = hoursNode.children;
                for (let i = 0; i < dayNodes.length; i++) {
                    const dayNode = dayNodes[i];
                    calendar.availability.workingHours[dayNode.tagName] = {
                        start: dayNode.getAttribute('start'),
                        end: dayNode.getAttribute('end'),
                        available: dayNode.getAttribute('available') !== 'false'
                    };
                }
            }
        }

        // Parse appointment types
        const typesNode = calendarNode.querySelector('appointment-types');
        if (typesNode) {
            const typeNodes = typesNode.querySelectorAll('type');
            typeNodes.forEach(typeNode => {
                calendar.appointmentTypes.push({
                    id: typeNode.getAttribute('id'),
                    name: this.getTextContent(typeNode, 'name'),
                    duration: parseInt(this.getTextContent(typeNode, 'duration')),
                    description: this.getTextContent(typeNode, 'description'),
                    price: parseInt(this.getTextContent(typeNode, 'price')),
                    available247: this.getTextContent(typeNode, 'available-247') === 'true'
                });
            });
        }

        // Parse blackout dates
        const blackoutNode = calendarNode.querySelector('blackout-dates');
        if (blackoutNode) {
            const dateNodes = blackoutNode.querySelectorAll('date');
            dateNodes.forEach(dateNode => {
                calendar.blackoutDates.push(dateNode.textContent.trim());
            });
        }

        return calendar;
    }

    /**
     * Parse SEO configuration
     */
    parseSEO(seoNode) {
        if (!seoNode) return {};

        const seo = {
            meta: {},
            analytics: {},
            localBusiness: {}
        };

        // Parse meta information
        const metaNode = seoNode.querySelector('meta');
        if (metaNode) {
            seo.meta = {
                title: this.getTextContent(metaNode, 'title'),
                description: this.getTextContent(metaNode, 'description'),
                keywords: this.getTextContent(metaNode, 'keywords'),
                author: this.getTextContent(metaNode, 'author')
            };
        }

        // Parse analytics
        const analyticsNode = seoNode.querySelector('analytics');
        if (analyticsNode) {
            seo.analytics = {
                googleAnalyticsId: this.getTextContent(analyticsNode, 'google-analytics-id'),
                googleTagManagerId: this.getTextContent(analyticsNode, 'google-tag-manager-id')
            };
        }

        // Parse local business
        const localBusinessNode = seoNode.querySelector('local-business');
        if (localBusinessNode) {
            seo.localBusiness = {
                type: this.getTextContent(localBusinessNode, 'type'),
                areaServed: this.getTextContent(localBusinessNode, 'area-served'),
                priceRange: this.getTextContent(localBusinessNode, 'price-range')
            };
        }

        return seo;
    }

    /**
     * Helper method to get text content from XML element
     * @param {Element} parent - Parent element
     * @param {string} selector - CSS selector
     * @returns {string} Text content or empty string
     */
    getTextContent(parent, selector) {
        const element = parent.querySelector(selector);
        return element ? element.textContent.trim() : '';
    }

    /**
     * Get configuration value by path
     * @param {string} path - Dot notation path (e.g., 'company.name')
     * @returns {any} Configuration value
     */
    getValue(path) {
        // Use compiled config method if available
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getValue(path);
        }

        // Fallback to direct config access
        if (!this.config) {
            console.warn('Configuration not loaded. Call loadConfig() first.');
            return null;
        }

        return path.split('.').reduce((obj, key) => obj && obj[key], this.config);
    }

    /**
     * Get design configuration
     * @returns {Object} Design configuration with theme, colors, and fonts
     */
    getDesign() {
        if (this.useCompiledConfig && window.compiledConfig && window.compiledConfig.getDesign) {
            return window.compiledConfig.getDesign();
        }
        return this.config?.design || {};
    }

    /**
     * Get top bar configuration
     * @returns {Object} Top bar configuration
     */
    getTopBar() {
        if (this.useCompiledConfig && window.compiledConfig && window.compiledConfig.getTopBar) {
            return window.compiledConfig.getTopBar();
        }
        return this.config?.['top-bar'] || {};
    }

    /**
     * Get hero slider configuration
     * @returns {Object} Hero slider configuration including slides
     */
    getHeroSlider() {
        if (this.useCompiledConfig && window.compiledConfig && window.compiledConfig.getHeroSlider) {
            return window.compiledConfig.getHeroSlider();
        }

        const heroConfig = this.config?.['hero-slider'] || {};

        // Normalize slides - handle both XML structure (slides.slide) and parsed structure (slides array)
        if (heroConfig.slides) {
            if (heroConfig.slides.slide) {
                // XML structure: slides.slide is an array
                heroConfig.slides = Array.isArray(heroConfig.slides.slide)
                    ? heroConfig.slides.slide
                    : [heroConfig.slides.slide];
            } else if (!Array.isArray(heroConfig.slides)) {
                // Convert to array if needed
                heroConfig.slides = [heroConfig.slides];
            }
        }

        // Normalize boolean strings
        heroConfig.autoPlay = heroConfig.autoPlay === 'true' || heroConfig.autoPlay === true || heroConfig['auto-play'] === 'true';
        heroConfig.showArrows = heroConfig.showArrows === 'true' || heroConfig.showArrows === true || heroConfig['show-arrows'] === 'true';
        heroConfig.showDots = heroConfig.showDots === 'true' || heroConfig.showDots === true || heroConfig['show-dots'] === 'true';
        heroConfig.interval = parseInt(heroConfig.interval) || 5000;

        return heroConfig;
    }

    /**
     * Get company information
     * @returns {Object} Company configuration
     */
    getCompany() {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getCompany();
        }
        return this.config?.company || {};
    }

    /**
     * Get services list
     * @returns {Array} Services array
     */
    getServices() {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getServices();
        }
        const services = this.config?.services;
        return Array.isArray(services) ? services : [services || {}];
    }

    /**
     * Get testimonials list
     * @returns {Array} Testimonials array with text, author, location, rating, projectType, date
     */
    getTestimonials() {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getTestimonials();
        }
        const testimonials = this.config?.testimonials;
        return Array.isArray(testimonials) ? testimonials : [testimonials || {}];
    }

    /**
     * Get accreditations list
     * @returns {Array} Accreditations array
     */
    getAccreditations() {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getAccreditations();
        }
        const accreditations = this.config?.accreditations;
        return Array.isArray(accreditations) ? accreditations : [accreditations || {}];
    }

    /**
     * Get page-specific configuration
     * @param {string} pageName - Page name (e.g., 'index', 'services', 'about')
     * @returns {Object} Page configuration including hero, layout, sections, etc.
     */
    getPageConfig(pageName) {
        if (this.useCompiledConfig && window.compiledConfig && window.compiledConfig.getPageConfig) {
            return window.compiledConfig.getPageConfig(pageName);
        }
        return this.config?.pages?.[pageName] || {};
    }

    /**
     * Get page-specific content (alias for getPageConfig for backwards compatibility)
     * @param {string} pageName - Page name (e.g., 'index', 'services')
     * @returns {Object} Page configuration
     */
    getPageContent(pageName) {
        return this.getPageConfig(pageName);
    }

    /**
     * Get service areas
     * @returns {Object} Service areas configuration
     */
    getServiceAreas() {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getServiceAreas();
        }
        return this.config?.['service-areas'] || {};
    }

    /**
     * Get business policies
     * @returns {Object} Business policies configuration
     */
    getBusinessPolicies() {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getBusinessPolicies();
        }
        return this.config?.['business-policies'] || {};
    }

    /**
     * Get form configuration
     * @param {string} formName - Form name (e.g., 'contact-form')
     * @returns {Object} Form configuration
     */
    getFormConfig(formName) {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getFormConfig(formName);
        }
        return this.config?.forms?.[formName] || {};
    }

    /**
     * Get pre-compiled template (only available with compiled config)
     * @param {string} templateName - Template name
     * @param {number} index - Template index (for arrays)
     * @returns {string} HTML template or empty string
     */
    getTemplate(templateName, index = 0) {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getTemplate(templateName, index);
        }
        return ''; // Templates only available in compiled mode
    }

    /**
     * Get all templates for a type (only available with compiled config)
     * @param {string} templateName - Template name
     * @returns {Array} Array of HTML templates
     */
    getAllTemplates(templateName) {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getAllTemplates(templateName);
        }
        return []; // Templates only available in compiled mode
    }

    /**
     * Get UI navigation items
     * @returns {Object} Navigation configuration
     */
    getNavigation() {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getNavigation();
        }
        return this.config?.ui?.navigation || {};
    }

    /**
     * Get UI button text
     * @param {string} buttonKey - Button key (e.g., 'get-quote')
     * @returns {string} Button text
     */
    getButtonText(buttonKey) {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getButtonText(buttonKey);
        }
        return this.config?.ui?.buttons?.[buttonKey] || buttonKey;
    }

    /**
     * Get UI message
     * @param {string} messagePath - Message path (e.g., 'error.general')
     * @returns {string} Message text
     */
    getMessage(messagePath) {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getMessage(messagePath);
        }

        const pathParts = messagePath.split('.');
        let current = this.config?.ui?.messages;

        for (const part of pathParts) {
            if (!current || !current[part]) {
                return messagePath; // Return path if not found
            }
            current = current[part];
        }

        return current || messagePath;
    }

    /**
     * Get UI label
     * @param {string} labelKey - Label key (e.g., 'call-us')
     * @returns {string} Label text
     */
    getLabel(labelKey) {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getLabel(labelKey);
        }
        return this.config?.ui?.labels?.[labelKey] || labelKey;
    }

    /**
     * Get chatbot UI configuration
     * @returns {Object} Chatbot UI configuration
     */
    getChatbotUI() {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getChatbotUI();
        }

        // Handle both old and new chatbot structure
        if (Array.isArray(this.config?.chatbot)) {
            return this.config.chatbot.find(c => c.ui)?.ui || {};
        }
        return this.config?.chatbot?.ui || {};
    }

    /**
     * Get form field configuration
     * @param {string} formName - Form name (e.g., 'contact-form')
     * @param {string} fieldName - Field name (e.g., 'name')
     * @returns {Object} Field configuration
     */
    getFormField(formName, fieldName) {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getFormField(formName, fieldName);
        }

        const form = this.config?.forms?.[formName];
        if (!form?.fields) return {};

        const fields = Array.isArray(form.fields) ? form.fields : [form.fields];
        return fields.find(field => field.name === fieldName) || {};
    }

    /**
     * Get all form fields for a form
     * @param {string} formName - Form name (e.g., 'contact-form')
     * @returns {Array} Array of field configurations
     */
    getFormFields(formName) {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getFormFields(formName);
        }

        const form = this.config?.forms?.[formName];
        if (!form?.fields) return [];

        return Array.isArray(form.fields) ? form.fields : [form.fields];
    }

    /**
     * Apply design styles to CSS custom properties from design config
     */
    applyDesignStyles() {
        // Use compiled config method if available for better performance
        if (this.useCompiledConfig && window.compiledConfig && window.compiledConfig.applyDesignStyles) {
            window.compiledConfig.applyDesignStyles();
            return;
        }

        // Fallback to XML-based design application
        const design = this.getDesign();
        if (!design || !design.colors) return;

        const root = document.documentElement;

        // Apply color variables from design.colors
        Object.entries(design.colors).forEach(([key, value]) => {
            root.style.setProperty(`--color-${key}`, value);
        });

        // Apply font variables from design.fonts
        if (design.fonts) {
            if (design.fonts.heading) {
                root.style.setProperty('--font-heading', design.fonts.heading);
            }
            if (design.fonts.body) {
                root.style.setProperty('--font-body', design.fonts.body);
            }
            if (design.fonts.baseSize) {
                root.style.setProperty('--font-base-size', design.fonts.baseSize);
            }
        }
    }

    /**
     * Apply branding styles to CSS custom properties
     */
    applyBrandingStyles() {
        // Use compiled config method if available for better performance
        if (this.useCompiledConfig && window.compiledConfig) {
            window.compiledConfig.applyBrandingStyles();
            return;
        }

        // Fallback to XML-based branding application
        if (!this.config || !this.config.branding) return;

        const root = document.documentElement;
        const { colors, typography } = this.config.branding;

        // Apply color variables
        if (colors) {
            Object.keys(colors).forEach(colorName => {
                root.style.setProperty(`--color-${colorName.replace(/([A-Z])/g, '-$1').toLowerCase()}`, colors[colorName]);
            });
        }

        // Apply typography variables
        if (typography) {
            root.style.setProperty('--font-primary', typography.primaryFont);
            root.style.setProperty('--font-heading', typography.headingFont);
            root.style.setProperty('--font-base-size', typography.baseSize);
        }
    }

    /**
     * Populate DOM elements from XML configuration using data attributes
     */
    populateFromXML() {
        if (!this.config) {
            console.warn('Configuration not loaded. Cannot populate DOM.');
            return;
        }

        const company = this.getCompany();

        // Populate company name
        document.querySelectorAll('[data-company-name]').forEach(el => {
            el.textContent = company.name || '';
        });

        // Populate phone number
        document.querySelectorAll('[data-phone]').forEach(el => {
            const phone = company.contact?.phone || '';
            if (el.tagName === 'A') {
                el.href = `tel:${phone}`;
                el.textContent = phone;
            } else {
                el.textContent = phone;
            }
        });

        // Populate email
        document.querySelectorAll('[data-email]').forEach(el => {
            const email = company.contact?.email || '';
            if (el.tagName === 'A') {
                el.href = `mailto:${email}`;
                el.textContent = email;
            } else {
                el.textContent = email;
            }
        });

        // Populate address
        document.querySelectorAll('[data-address]').forEach(el => {
            const addr = company.contact?.address;
            if (addr) {
                const formatted = `${addr.street}, ${addr.city}, ${addr.postcode}`;
                el.textContent = formatted;
            }
        });

        // Populate copyright with current year
        document.querySelectorAll('[data-copyright]').forEach(el => {
            const year = new Date().getFullYear();
            el.textContent = `© ${year} ${company.name || 'Raiswell Building Services'}. All rights reserved.`;
        });

        // Populate social media links
        document.querySelectorAll('[data-social]').forEach(el => {
            const social = company.socialMedia;
            if (!social) return;

            let html = '';
            if (social.instagram) {
                html += `<a href="https://instagram.com/${social.instagram.replace('@', '')}" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>`;
            }
            if (social.facebook) {
                html += `<a href="https://facebook.com/${social.facebook}" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook"></i></a>`;
            }
            if (social.linkedin) {
                html += `<a href="https://linkedin.com/${social.linkedin}" target="_blank" rel="noopener" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>`;
            }
            el.innerHTML = html;
        });

        // Populate welcome content (homepage)
        const indexPage = this.getPageConfig('index');
        if (indexPage && indexPage.hero) {
            document.querySelectorAll('[data-welcome-title]').forEach(el => {
                el.textContent = indexPage.hero.title || '';
            });

            document.querySelectorAll('[data-welcome-content]').forEach(el => {
                if (indexPage.hero.description) {
                    el.innerHTML = `<p>${indexPage.hero.description}</p>`;
                }
            });
        }

        // Populate service cards
        document.querySelectorAll('[data-services]').forEach(el => {
            const services = this.getServices();
            let html = '';
            services.forEach(service => {
                html += `
                    <div class="service-card" data-service-id="${service.id}">
                        <div class="service-icon">${service.icon || ''}</div>
                        <h3>${service.name || ''}</h3>
                        <p>${service.description || ''}</p>
                        <div class="service-meta">
                            <span class="duration">${service.duration || ''}</span>
                            <span class="price">${service.priceRange || ''}</span>
                        </div>
                    </div>
                `;
            });
            el.innerHTML = html;
        });
    }
}

// Create global instance
window.siteConfig = new XMLConfigParser();

// Aliases for backwards compatibility
window.XMLParser = window.siteConfig;
window.xmlParser = window.siteConfig;

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.siteConfig.init();
    } catch (error) {
        console.warn('XML Parser auto-init failed:', error);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XMLConfigParser;
}
