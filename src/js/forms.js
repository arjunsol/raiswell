/**
 * Enhanced Form System for Colin's Professional Building Services
 * Stage 3: Integration with ChatGPT and structured lead generation
 */

class FormManager {
    constructor() {
        this.forms = new Map();
        this.submissions = [];
        this.config = null;
        this.chatbotData = null;
        this.init();
    }

    /**
     * Initialize form system
     */
    async init() {
        try {
            await this.loadConfiguration();
            this.setupForms();
            this.addEventListeners();
            this.initializeValidation();
        } catch (error) {
            console.error('Form system initialization failed:', error);
        }
    }

    /**
     * Load configuration from XML
     */
    async loadConfiguration() {
        try {
            const xmlParser = window.xmlParser;
            if (xmlParser && xmlParser.config) {
                this.config = xmlParser.config;
            }
        } catch (error) {
            console.error('Failed to load form configuration:', error);
        }
    }

    /**
     * Setup all forms on the page
     */
    setupForms() {
        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            this.setupContactForm(contactForm);
        }

        // Booking form
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            this.setupBookingForm(bookingForm);
        }

        // Newsletter forms
        const newsletterForms = document.querySelectorAll('.newsletter-form');
        newsletterForms.forEach(form => this.setupNewsletterForm(form));

        // Quick quote forms
        const quoteActivators = document.querySelectorAll('[data-quote-trigger]');
        quoteActivators.forEach(element => {
            element.addEventListener('click', () => {
                this.showQuickQuoteModal();
            });
        });
    }

    /**
     * Setup contact form with enhanced functionality
     */
    setupContactForm(form) {
        // Pre-fill with chatbot data if available
        this.prefillFromChatbot(form);
        
        // Add dynamic field visibility
        this.setupDynamicFields(form);
        
        // Register form
        this.forms.set('contact', {
            element: form,
            type: 'contact',
            config: {
                requiredFields: ['name', 'email', 'message'],
                optionalFields: ['phone', 'project-type', 'budget-range'],
                successMessage: 'Thank you! We\'ll respond within 24 hours.',
                redirectUrl: null
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission('contact', new FormData(form));
        });
    }

    /**
     * Setup booking form with consultation integration
     */
    setupBookingForm(form) {
        // Pre-fill with chatbot data if available
        this.prefillFromChatbot(form);
        
        // Add real-time availability checking (simulated)
        this.setupAvailabilityCheck(form);
        
        // Register form
        this.forms.set('booking', {
            element: form,
            type: 'booking',
            config: {
                requiredFields: ['name', 'email', 'phone', 'address', 'preferred-date', 'preferred-time'],
                optionalFields: ['alternative-date', 'project-type', 'message'],
                successMessage: 'Booking request received! We\'ll confirm within 2 hours.',
                redirectUrl: null
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission('booking', new FormData(form));
        });
    }

    /**
     * Setup newsletter subscription forms
     */
    setupNewsletterForm(form) {
        const formId = 'newsletter-' + Math.random().toString(36).substr(2, 9);
        
        this.forms.set(formId, {
            element: form,
            type: 'newsletter',
            config: {
                requiredFields: ['email'],
                optionalFields: ['name'],
                successMessage: 'Successfully subscribed to our newsletter!',
                redirectUrl: null
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(formId, new FormData(form));
        });
    }

    /**
     * Pre-fill form with chatbot data
     */
    prefillFromChatbot(form) {
        if (window.chatbotManager) {
            const chatbotData = window.chatbotManager.customerData || {};
            
            Object.keys(chatbotData).forEach(key => {
                const field = form.querySelector(`[name="${key}"]`);
                if (field && chatbotData[key]) {
                    field.value = chatbotData[key];
                    field.classList.add('prefilled');
                }
            });

            // Add chatbot context to form
            if (Object.keys(chatbotData).length > 0) {
                this.addHiddenField(form, 'source', 'chatbot');
                this.addHiddenField(form, 'chatbot_context', JSON.stringify(chatbotData));
            }
        }
    }

    /**
     * Setup dynamic field visibility based on selections
     */
    setupDynamicFields(form) {
        const projectTypeField = form.querySelector('[name="project-type"]');
        if (projectTypeField) {
            projectTypeField.addEventListener('change', (e) => {
                this.handleProjectTypeChange(form, e.target.value);
            });
        }

        const urgencyField = form.querySelector('[name="urgency"]');
        if (urgencyField) {
            urgencyField.addEventListener('change', (e) => {
                this.handleUrgencyChange(form, e.target.value);
            });
        }
    }

    /**
     * Handle project type change to show relevant fields
     */
    handleProjectTypeChange(form, projectType) {
        // Hide all dynamic sections first
        const dynamicSections = form.querySelectorAll('.dynamic-section');
        dynamicSections.forEach(section => {
            section.style.display = 'none';
        });

        // Show relevant section
        const relevantSection = form.querySelector(`[data-project="${projectType}"]`);
        if (relevantSection) {
            relevantSection.style.display = 'block';
            this.animateFieldEntry(relevantSection);
        }

        // Update form labels and help text
        this.updateFormLabels(form, projectType);
    }

    /**
     * Handle urgency change for emergency services
     */
    handleUrgencyChange(form, urgency) {
        const emergencySection = form.querySelector('.emergency-section');
        if (emergencySection) {
            if (urgency === 'emergency') {
                emergencySection.style.display = 'block';
                this.showEmergencyContact(form);
            } else {
                emergencySection.style.display = 'none';
            }
        }
    }

    /**
     * Setup availability checking for booking form
     */
    setupAvailabilityCheck(form) {
        const dateField = form.querySelector('[name="preferred-date"]');
        const timeField = form.querySelector('[name="preferred-time"]');
        
        if (dateField && timeField) {
            const checkAvailability = () => {
                const date = dateField.value;
                const time = timeField.value;
                
                if (date && time) {
                    this.checkSlotAvailability(date, time, form);
                }
            };

            dateField.addEventListener('change', checkAvailability);
            timeField.addEventListener('change', checkAvailability);
        }
    }

    /**
     * Check slot availability (simulated)
     */
    async checkSlotAvailability(date, time, form) {
        const availabilityIndicator = form.querySelector('.availability-indicator') || 
            this.createAvailabilityIndicator(form);

        availabilityIndicator.innerHTML = '<span class="checking">Checking availability...</span>';

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate availability check
        const isAvailable = this.simulateAvailabilityCheck(date, time);
        
        if (isAvailable) {
            availabilityIndicator.innerHTML = `
                <span class="available">✅ Available</span>
                <small>This slot is available for booking</small>
            `;
        } else {
            availabilityIndicator.innerHTML = `
                <span class="unavailable">❌ Unavailable</span>
                <small>Please choose an alternative time</small>
            `;
            this.suggestAlternativeTimes(form, date);
        }
    }

    /**
     * Simulate availability checking
     */
    simulateAvailabilityCheck(date, time) {
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay();
        
        // Sunday is unavailable
        if (dayOfWeek === 0) return false;
        
        // Saturday after 4 PM is unavailable
        if (dayOfWeek === 6 && time >= '16:00') return false;
        
        // Random unavailability for demo
        return Math.random() > 0.3;
    }

    /**
     * Handle form submission
     */
    async handleFormSubmission(formId, formData) {
        const formConfig = this.forms.get(formId);
        if (!formConfig) return;

        const form = formConfig.element;
        
        try {
            // Show loading state
            this.setFormLoading(form, true);
            
            // Validate form
            const validation = this.validateForm(formConfig, formData);
            if (!validation.valid) {
                this.showValidationErrors(form, validation.errors);
                return;
            }

            // Process submission
            const submission = await this.processSubmission(formConfig, formData);
            
            // Show success
            this.showSubmissionSuccess(form, formConfig.config.successMessage);
            
            // Store submission
            this.submissions.push(submission);
            
            // Analytics tracking
            this.trackFormSubmission(formConfig.type, submission);
            
            // Integration with chatbot
            if (window.chatbotManager) {
                const chatbotSummary = window.chatbotManager.getConversationSummary();
                submission.chatbotData = chatbotSummary;
            }
            
            // Redirect if configured
            if (formConfig.config.redirectUrl) {
                setTimeout(() => {
                    window.location.href = formConfig.config.redirectUrl;
                }, 2000);
            }
            
        } catch (error) {
            console.error('Form submission failed:', error);
            this.showSubmissionError(form, 'Submission failed. Please try again or call us directly.');
        } finally {
            this.setFormLoading(form, false);
        }
    }

    /**
     * Validate form data
     */
    validateForm(formConfig, formData) {
        const errors = [];
        const data = Object.fromEntries(formData);
        
        // Check required fields
        formConfig.config.requiredFields.forEach(field => {
            if (!data[field] || data[field].trim() === '') {
                errors.push({
                    field: field,
                    message: `${this.getFieldLabel(field)} is required`
                });
            }
        });

        // Email validation
        if (data.email && !this.isValidEmail(data.email)) {
            errors.push({
                field: 'email',
                message: 'Please enter a valid email address'
            });
        }

        // Phone validation
        if (data.phone && !this.isValidPhone(data.phone)) {
            errors.push({
                field: 'phone',
                message: 'Please enter a valid UK phone number'
            });
        }

        // Date validation (not in the past)
        if (data['preferred-date']) {
            const selectedDate = new Date(data['preferred-date']);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                errors.push({
                    field: 'preferred-date',
                    message: 'Please select a future date'
                });
            }
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Process form submission
     */
    async processSubmission(formConfig, formData) {
        const data = Object.fromEntries(formData);
        
        const submission = {
            id: this.generateSubmissionId(),
            type: formConfig.type,
            timestamp: new Date().toISOString(),
            data: data,
            status: 'submitted',
            source: data.source || 'website'
        };

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // In a real implementation, this would:
        // - Send email notifications
        // - Save to database/CRM
        // - Trigger automated workflows
        // - Send SMS confirmations

        console.log('Form submission processed:', submission);
        
        return submission;
    }

    /**
     * Show quick quote modal
     */
    showQuickQuoteModal() {
        const modal = this.createQuickQuoteModal();
        document.body.appendChild(modal);
        
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    /**
     * Create quick quote modal
     */
    createQuickQuoteModal() {
        const modal = document.createElement('div');
        modal.className = 'quote-modal-overlay';
        modal.innerHTML = `
            <div class="quote-modal">
                <div class="quote-modal-header">
                    <h3>Get Your Free Quote</h3>
                    <button class="quote-modal-close">&times;</button>
                </div>
                <form id="quick-quote-form" class="quote-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="quote-name">Your Name *</label>
                            <input type="text" id="quote-name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="quote-phone">Phone Number *</label>
                            <input type="tel" id="quote-phone" name="phone" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="quote-email">Email Address *</label>
                        <input type="email" id="quote-email" name="email" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="quote-project">Project Type *</label>
                        <select id="quote-project" name="project-type" required>
                            <option value="">Select project type</option>
                            <option value="extension">Home Extension</option>
                            <option value="kitchen">Kitchen Renovation</option>
                            <option value="bathroom">Bathroom Renovation</option>
                            <option value="general">General Building Work</option>
                            <option value="other">Other/Multiple Projects</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="quote-budget">Approximate Budget</label>
                        <select id="quote-budget" name="budget-range">
                            <option value="">Select budget range</option>
                            <option value="under-5k">Under £5,000</option>
                            <option value="5k-15k">£5,000 - £15,000</option>
                            <option value="15k-30k">£15,000 - £30,000</option>
                            <option value="30k-50k">£30,000 - £50,000</option>
                            <option value="over-50k">Over £50,000</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="quote-timeline">Preferred Timeline</label>
                        <select id="quote-timeline" name="timeline">
                            <option value="">Select timeline</option>
                            <option value="asap">As soon as possible</option>
                            <option value="1-3months">1-3 months</option>
                            <option value="3-6months">3-6 months</option>
                            <option value="6months-plus">6+ months</option>
                            <option value="planning">Still planning</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="quote-details">Project Details</label>
                        <textarea id="quote-details" name="message" rows="3" 
                                  placeholder="Brief description of your project..."></textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary btn-large">
                            Get Free Quote
                        </button>
                    </div>
                </form>
            </div>
        `;

        // Add event listeners
        modal.querySelector('.quote-modal-close').addEventListener('click', () => {
            this.closeQuickQuoteModal(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeQuickQuoteModal(modal);
            }
        });

        const form = modal.querySelector('#quick-quote-form');
        this.setupQuickQuoteForm(form);

        return modal;
    }

    /**
     * Setup quick quote form
     */
    setupQuickQuoteForm(form) {
        // Pre-fill with chatbot data
        this.prefillFromChatbot(form);
        
        const formId = 'quick-quote';
        this.forms.set(formId, {
            element: form,
            type: 'quote',
            config: {
                requiredFields: ['name', 'phone', 'email', 'project-type'],
                optionalFields: ['budget-range', 'timeline', 'message'],
                successMessage: 'Quote request received! We\'ll contact you within 24 hours.',
                redirectUrl: null
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission(formId, new FormData(form));
        });
    }

    /**
     * Close quick quote modal
     */
    closeQuickQuoteModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }

    /**
     * Utility functions
     */
    generateSubmissionId() {
        return 'CB' + Date.now().toString(36).toUpperCase();
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidPhone(phone) {
        // UK phone number validation (simplified)
        return /^(\+44|0)[1-9][0-9]{8,9}$/.test(phone.replace(/\s/g, ''));
    }

    getFieldLabel(fieldName) {
        const labels = {
            'name': 'Name',
            'email': 'Email',
            'phone': 'Phone',
            'message': 'Message',
            'project-type': 'Project Type',
            'preferred-date': 'Preferred Date',
            'preferred-time': 'Preferred Time'
        };
        return labels[fieldName] || fieldName;
    }

    setFormLoading(form, loading) {
        const submitBtn = form.querySelector('[type="submit"]');
        if (submitBtn) {
            if (loading) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="loading-spinner"></span> Processing...';
            } else {
                submitBtn.disabled = false;
                submitBtn.innerHTML = submitBtn.getAttribute('data-original-text') || 'Submit';
            }
        }
    }

    showValidationErrors(form, errors) {
        // Clear previous errors
        form.querySelectorAll('.error-message').forEach(msg => msg.remove());
        form.querySelectorAll('.error').forEach(field => field.classList.remove('error'));

        // Show new errors
        errors.forEach(error => {
            const field = form.querySelector(`[name="${error.field}"]`);
            if (field) {
                field.classList.add('error');
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = error.message;
                field.parentNode.appendChild(errorMsg);
            }
        });
    }

    showSubmissionSuccess(form, message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success';
        successDiv.innerHTML = `
            <div class="success-icon">✅</div>
            <h4>Success!</h4>
            <p>${message}</p>
        `;
        
        form.style.display = 'none';
        form.parentNode.appendChild(successDiv);
    }

    showSubmissionError(form, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        errorDiv.innerHTML = `
            <div class="error-icon">❌</div>
            <p>${message}</p>
            <button onclick="this.parentNode.remove(); this.closest('form').style.display = 'block';">
                Try Again
            </button>
        `;
        
        form.style.display = 'none';
        form.parentNode.appendChild(errorDiv);
    }

    trackFormSubmission(type, submission) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submission', {
                'form_type': type,
                'submission_id': submission.id,
                'value': 1
            });
        }
    }

    addHiddenField(form, name, value) {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = name;
        hiddenField.value = value;
        form.appendChild(hiddenField);
    }

    createAvailabilityIndicator(form) {
        const indicator = document.createElement('div');
        indicator.className = 'availability-indicator';
        
        const timeField = form.querySelector('[name="preferred-time"]');
        if (timeField) {
            timeField.parentNode.appendChild(indicator);
        }
        
        return indicator;
    }

    animateFieldEntry(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 10);
    }

    updateFormLabels(form, projectType) {
        // Update form elements based on project type
        const messageField = form.querySelector('[name="message"]');
        if (messageField) {
            const placeholders = {
                'extension': 'Tell us about your extension project - size, style, any specific requirements...',
                'kitchen': 'Describe your ideal kitchen - style, appliances, special features...',
                'bathroom': 'Share your bathroom vision - style, fixtures, accessibility needs...',
                'general': 'Describe the work you need - repairs, maintenance, improvements...'
            };
            
            messageField.placeholder = placeholders[projectType] || messageField.placeholder;
        }
    }

    suggestAlternativeTimes(form, date) {
        // This would show alternative available times
        // Implementation depends on your booking system
        console.log('Suggesting alternative times for', date);
    }

    showEmergencyContact(form) {
        const emergencyDiv = document.createElement('div');
        emergencyDiv.className = 'emergency-contact';
        emergencyDiv.innerHTML = `
            <div class="emergency-alert">
                <h4>🚨 Emergency Contact</h4>
                <p>For urgent issues, call our emergency line:</p>
                <a href="tel:+447700900999" class="btn btn-danger">📞 +44 7700 900999</a>
                <small>Available 24/7 for genuine emergencies</small>
            </div>
        `;
        
        form.appendChild(emergencyDiv);
    }

    addEventListeners() {
        // Global form enhancements
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.handleFieldInput(e.target);
            }
        });
    }

    handleFieldInput(field) {
        // Real-time validation and formatting
        field.classList.remove('error');
        
        const errorMsg = field.parentNode.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    initializeValidation() {
        // Add real-time validation styles
        const style = document.createElement('style');
        style.textContent = `
            .form-group input.error,
            .form-group textarea.error,
            .form-group select.error {
                border-color: #e74c3c;
                box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
            }
            
            .error-message {
                color: #e74c3c;
                font-size: 0.85rem;
                margin-top: 0.25rem;
            }
            
            .form-success,
            .form-error {
                text-align: center;
                padding: 2rem;
                border-radius: var(--border-radius);
                margin-top: 1rem;
            }
            
            .form-success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .form-error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .loading-spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2px solid #ffffff33;
                border-radius: 50%;
                border-top-color: #ffffff;
                animation: spin 1s ease-in-out infinite;
            }
            
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize form system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.formManager = new FormManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormManager;
}