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
            
            // Apply branding styles
            this.applyBrandingStyles();
            
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
            company: {
                name: "Colin's Professional Building Services",
                tagline: "Quality Construction You Can Trust",
                description: "Professional building services with over 15 years of experience. Specializing in home extensions, kitchen fitting, bathroom renovations, and general construction work across London and the South East.",
                logo: "images/hero/company-logo.png",
                established: "2008",
                projectsCompleted: "500+",
                contact: {
                    phone: "+44 7700 900123",
                    email: "colin@colinbuilds.co.uk",
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
                    instagram: "@colinbuilds",
                    facebook: "ColinBuildsUK",
                    linkedin: "company/colin-building-services"
                }
            },
            branding: {
                colors: {
                    primary: "#2C3E50",
                    secondary: "#27AE60",
                    accent: "#3498DB",
                    background: "#FFFFFF",
                    text: "#2C3E50",
                    "light-gray": "#ECF0F1"
                },
                typography: {
                    primaryFont: "Roboto, sans-serif",
                    headingFont: "Roboto Slab, serif",
                    baseSize: "16px"
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
                    location: "Sale, Manchester",
                    rating: 5,
                    text: "Colin transformed our dated kitchen into a stunning modern space. Professional, reliable, and excellent attention to detail. Highly recommended!",
                    projectType: "Kitchen Renovation",
                    date: "2024-01-15"
                },
                {
                    name: "Mike & Jenny Roberts",
                    location: "Chorlton, Manchester",
                    rating: 5,
                    text: "Our house extension was completed on time and within budget. Colin's expertise and communication throughout the project was exceptional.",
                    projectType: "Single Storey Extension",
                    date: "2023-11-30"
                },
                {
                    name: "David Wilson",
                    location: "Stockport",
                    rating: 5,
                    text: "Emergency roof repair completed quickly and professionally. Colin went above and beyond to ensure our home was weatherproof.",
                    projectType: "Emergency Repairs",
                    date: "2024-02-20"
                }
            ],
            gallery: {
                instagramHandle: "colinbuilds",
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
                        location: "Didsbury, Manchester",
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
                    title: "Colin's Professional Building Services | Manchester Builder",
                    description: "Professional building services in Manchester. Extensions, kitchens, bathrooms & general building work. Gas Safe registered, NICEIC approved. Free quotes.",
                    keywords: "builder manchester, home extensions, kitchen fitting, bathroom renovation, building services, gas safe, niceic",
                    author: "Colin's Professional Building Services"
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

        return config;
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
                date: this.getTextContent(testimonialNode, 'date')
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
            escalationTriggers: []
        };

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
     * @returns {Array} Testimonials array
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
     * Get page-specific content
     * @param {string} pageName - Page name (e.g., 'index', 'services')
     * @returns {Object} Page configuration
     */
    getPageContent(pageName) {
        if (this.useCompiledConfig && window.compiledConfig) {
            return window.compiledConfig.getPageContent(pageName);
        }
        
        const pages = this.config?.pages?.page;
        if (Array.isArray(pages)) {
            return pages.find(page => page.name === pageName) || {};
        }
        return pages?.name === pageName ? pages : {};
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
        if (!form?.fields?.field) return {};
        
        const fields = Array.isArray(form.fields.field) ? form.fields.field : [form.fields.field];
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
        if (!form?.fields?.field) return [];
        
        return Array.isArray(form.fields.field) ? form.fields.field : [form.fields.field];
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
}

// Create global instance
window.siteConfig = new XMLConfigParser();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XMLConfigParser;
}