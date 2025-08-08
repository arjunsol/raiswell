/**
 * Booking Integration System for Colin's Professional Building Services
 * Stage 4: Advanced integration between Calendar, Forms, and Chatbot systems
 */

class BookingIntegration {
    constructor() {
        this.systems = {
            calendar: null,
            forms: null,
            chatbot: null
        };
        this.bookingData = {
            consultation: null,
            customer: null,
            appointment: null,
            preferences: {}
        };
        this.init();
    }

    /**
     * Initialize booking integration
     */
    async init() {
        try {
            // Wait for all systems to be available
            await this.waitForSystems();
            
            // Setup cross-system integration
            this.setupIntegrations();
            
            // Initialize booking analytics
            this.initializeAnalytics();
            
            // Setup automated workflows
            this.setupAutomatedWorkflows();
            
            console.log('Booking integration initialized successfully');
        } catch (error) {
            console.error('Booking integration initialization failed:', error);
        }
    }

    /**
     * Wait for all required systems to be available
     */
    async waitForSystems() {
        const maxAttempts = 20;
        let attempts = 0;

        while (attempts < maxAttempts) {
            // Check for calendar system
            if (window.calendarManager) {
                this.systems.calendar = window.calendarManager;
            }

            // Check for form system
            if (window.formManager) {
                this.systems.forms = window.formManager;
            }

            // Check for chatbot system
            if (window.chatbotManager) {
                this.systems.chatbot = window.chatbotManager;
            }

            // Check if all systems are available
            if (this.systems.calendar && this.systems.forms && this.systems.chatbot) {
                return;
            }

            attempts++;
            await new Promise(resolve => setTimeout(resolve, 250));
        }

        console.warn('Some booking systems not available:', {
            calendar: !!this.systems.calendar,
            forms: !!this.systems.forms,
            chatbot: !!this.systems.chatbot
        });
    }

    /**
     * Setup cross-system integrations
     */
    setupIntegrations() {
        // Integrate calendar with chatbot
        this.setupCalendarChatbotIntegration();
        
        // Integrate forms with calendar
        this.setupFormsCalendarIntegration();
        
        // Integrate chatbot with forms
        this.setupChatbotFormsIntegration();
        
        // Setup unified booking flow
        this.setupUnifiedBookingFlow();
    }

    /**
     * Setup calendar and chatbot integration
     */
    setupCalendarChatbotIntegration() {
        if (!this.systems.calendar || !this.systems.chatbot) return;

        // When user interacts with calendar, update chatbot context
        this.systems.calendar.onDateSelected = (date) => {
            this.updateChatbotContext('date_selected', {
                date: date.toLocaleDateString('en-GB'),
                available_slots: this.systems.calendar.getAvailableSlots(date)
            });
        };

        this.systems.calendar.onTimeSelected = (slot) => {
            this.updateChatbotContext('time_selected', {
                time: slot.time,
                datetime: slot.datetime
            });
        };

        this.systems.calendar.onAppointmentTypeSelected = (type) => {
            this.updateChatbotContext('service_selected', {
                service: type.name,
                duration: type.duration,
                price: type.price
            });
        };

        // When user books via calendar, create chatbot conversation record
        this.systems.calendar.onBookingConfirmed = (booking) => {
            this.createChatbotBookingRecord(booking);
        };
    }

    /**
     * Setup forms and calendar integration
     */
    setupFormsCalendarIntegration() {
        if (!this.systems.forms || !this.systems.calendar) return;

        // Pre-fill calendar customer data from forms
        const originalGetCustomerData = this.systems.calendar.getCustomerData;
        this.systems.calendar.getCustomerData = () => {
            // Try to get data from active forms first
            const formData = this.getActiveFormData();
            if (formData) {
                return formData;
            }
            
            // Fallback to original method
            return originalGetCustomerData.call(this.systems.calendar);
        };

        // Update form validation to check calendar availability
        this.enhanceFormValidation();
    }

    /**
     * Setup chatbot and forms integration
     */
    setupChatbotFormsIntegration() {
        if (!this.systems.chatbot || !this.systems.forms) return;

        // This integration is already handled by the form system
        // but we can add additional enhancements here
        
        // Add booking-specific chatbot responses
        this.addBookingChatbotResponses();
        
        // Setup intelligent form pre-population
        this.setupIntelligentFormFilling();
    }

    /**
     * Setup unified booking flow
     */
    setupUnifiedBookingFlow() {
        // Create booking flow coordinator
        this.bookingFlowCoordinator = new BookingFlowCoordinator(this);
        
        // Setup booking analytics tracking
        this.setupBookingAnalytics();
        
        // Setup automated follow-ups
        this.setupAutomatedFollowUps();
    }

    /**
     * Update chatbot context with booking information
     */
    updateChatbotContext(event, data) {
        if (!this.systems.chatbot) return;

        const contextMessage = this.generateContextMessage(event, data);
        
        // Add hidden context to chatbot (not shown to user)
        this.systems.chatbot.conversationHistory.push({
            role: 'system',
            content: `[BOOKING_CONTEXT] ${event}: ${JSON.stringify(data)}`,
            timestamp: new Date(),
            hidden: true
        });

        // Optionally show relevant message to user
        if (this.shouldShowContextMessage(event)) {
            this.systems.chatbot.addAssistantMessage(contextMessage);
        }
    }

    /**
     * Generate context message for chatbot
     */
    generateContextMessage(event, data) {
        const messages = {
            date_selected: `Great choice! I can see you've selected ${data.date}. There are ${data.available_slots.length} available time slots for that day.`,
            time_selected: `Perfect! You've selected ${data.time}. Now you just need to choose the type of consultation you'd like.`,
            service_selected: `Excellent! You've chosen "${data.service}" which takes ${data.duration} minutes and ${data.price === 0 ? 'is completely free' : 'costs £' + data.price}.`
        };

        return messages[event] || '';
    }

    /**
     * Determine if context message should be shown to user
     */
    shouldShowContextMessage(event) {
        // Only show messages for significant booking events
        return ['date_selected', 'service_selected'].includes(event);
    }

    /**
     * Create chatbot booking record
     */
    createChatbotBookingRecord(booking) {
        if (!this.systems.chatbot) return;

        const confirmationMessage = `🎉 **Booking Confirmed!**

**Reference:** ${booking.id}
**Date & Time:** ${booking.date} at ${booking.time}
**Service:** ${booking.appointmentType.name}
**Duration:** ${booking.appointmentType.duration} minutes

A confirmation email has been sent to ${booking.customer.email}. If you need to make any changes, please call us at +44 7700 900123.

Is there anything else I can help you with today?`;

        this.systems.chatbot.addAssistantMessage(confirmationMessage);
        
        // Store booking reference in chatbot data
        this.systems.chatbot.customerData.lastBooking = {
            id: booking.id,
            date: booking.date,
            time: booking.time,
            service: booking.appointmentType.name
        };
    }

    /**
     * Get active form data
     */
    getActiveFormData() {
        if (!this.systems.forms) return null;

        // Check booking form first
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            const formData = new FormData(bookingForm);
            return {
                id: this.generateCustomerId(),
                name: formData.get('name') || '',
                email: formData.get('email') || '',
                phone: formData.get('phone') || '',
                address: formData.get('address') || '',
                projectType: formData.get('project-type') || '',
                notes: formData.get('message') || ''
            };
        }

        // Check other forms
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            const formData = new FormData(contactForm);
            return {
                id: this.generateCustomerId(),
                name: formData.get('name') || '',
                email: formData.get('email') || '',
                phone: formData.get('phone') || '',
                address: '',
                projectType: formData.get('project-type') || '',
                notes: formData.get('message') || ''
            };
        }

        return null;
    }

    /**
     * Enhance form validation with calendar checking
     */
    enhanceFormValidation() {
        if (!this.systems.forms || !this.systems.calendar) return;

        // Override form validation to include availability checking
        const originalValidateForm = this.systems.forms.validateForm;
        this.systems.forms.validateForm = (formConfig, formData) => {
            const result = originalValidateForm.call(this.systems.forms, formConfig, formData);
            
            // Add calendar-specific validation
            const data = Object.fromEntries(formData);
            
            if (data['preferred-date'] && data['preferred-time']) {
                const date = new Date(data['preferred-date']);
                const time = data['preferred-time'];
                
                if (!this.systems.calendar.isSlotAvailable(date, time)) {
                    result.errors.push({
                        field: 'preferred-time',
                        message: 'Selected time slot is no longer available. Please choose another time.'
                    });
                    result.valid = false;
                }
            }
            
            return result;
        };
    }

    /**
     * Add booking-specific chatbot responses
     */
    addBookingChatbotResponses() {
        if (!this.systems.chatbot) return;

        // Add booking-specific response patterns
        const originalGenerateResponse = this.systems.chatbot.generateResponse;
        this.systems.chatbot.generateResponse = async (message) => {
            const lowerMessage = message.toLowerCase();
            
            // Handle booking-specific queries
            if (lowerMessage.includes('reschedule') || lowerMessage.includes('change appointment')) {
                return `I can help you reschedule your appointment. You'll need to call us at **+44 7700 900123** at least 24 hours before your scheduled appointment.

If you have a booking reference number, please have it ready when you call. Our team can help you find a new suitable time.

Would you like me to show you our available times, or is there anything else I can help with?`;
            }
            
            if (lowerMessage.includes('cancel') && lowerMessage.includes('appointment')) {
                return `I understand you need to cancel your appointment. Please call us at **+44 7700 900123** to cancel your booking.

**Cancellation Policy:**
• Free cancellation up to 24 hours before appointment
• Same-day cancellations may incur charges for emergency callouts

If you're experiencing an emergency, please call our emergency line at **+44 7700 900999**.

Is there anything else I can help you with?`;
            }
            
            if (lowerMessage.includes('available') || lowerMessage.includes('appointment') || lowerMessage.includes('book')) {
                return `I'd be happy to help you find an available appointment time! 

You can either:
📅 **Use our interactive calendar** below to see real-time availability and book instantly
📞 **Call us** at +44 7700 900123 during business hours
💬 **Continue chatting** with me to find the right time for you

What type of consultation are you looking for?
• Initial Consultation (60 min, Free)
• Site Survey (120 min, Free) 
• Quote Presentation (45 min, Free)
• Emergency Callout (60 min, £150)`;
            }
            
            // Fallback to original response
            return await originalGenerateResponse.call(this.systems.chatbot, message);
        };
    }

    /**
     * Setup intelligent form filling
     */
    setupIntelligentFormFilling() {
        // Monitor chatbot conversations for booking intent
        if (!this.systems.chatbot || !this.systems.forms) return;

        setInterval(() => {
            this.analyzeConversationForBookingIntent();
        }, 5000);
    }

    /**
     * Analyze conversation for booking intent
     */
    analyzeConversationForBookingIntent() {
        if (!this.systems.chatbot.conversationHistory.length) return;

        const recentMessages = this.systems.chatbot.conversationHistory.slice(-5);
        const hasBookingIntent = recentMessages.some(msg => 
            msg.content.toLowerCase().includes('book') ||
            msg.content.toLowerCase().includes('appointment') ||
            msg.content.toLowerCase().includes('consultation')
        );

        if (hasBookingIntent && !this.bookingIntentDetected) {
            this.bookingIntentDetected = true;
            this.suggestCalendarBooking();
        }
    }

    /**
     * Suggest calendar booking to user
     */
    suggestCalendarBooking() {
        if (!this.systems.chatbot) return;

        const suggestion = `💡 **Quick Tip:** You can book your appointment instantly using our interactive calendar below! 

Just scroll down to see available dates and times. The calendar shows real-time availability and you can book immediately without waiting for confirmation.

Would you prefer to use the calendar or continue our conversation?`;

        this.systems.chatbot.addAssistantMessage(suggestion);
    }

    /**
     * Initialize booking analytics
     */
    initializeAnalytics() {
        this.analytics = {
            bookingStarts: 0,
            bookingCompletions: 0,
            chatbotBookings: 0,
            calendarBookings: 0,
            formBookings: 0,
            conversionRate: 0,
            averageBookingTime: 0,
            popularTimes: new Map(),
            popularServices: new Map()
        };

        this.trackingStartTime = null;
        this.setupAnalyticsTracking();
    }

    /**
     * Setup analytics tracking
     */
    setupAnalyticsTracking() {
        // Track booking flow starts
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-quote-trigger], .calendar-day.available, .time-slot')) {
                this.trackBookingStart();
            }
        });

        // Track booking completions
        if (this.systems.calendar) {
            this.systems.calendar.onBookingConfirmed = (booking) => {
                this.trackBookingCompletion('calendar', booking);
            };
        }

        // Track form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('#booking-form, #contact-form')) {
                this.trackBookingCompletion('form', null);
            }
        });
    }

    /**
     * Track booking flow start
     */
    trackBookingStart() {
        this.analytics.bookingStarts++;
        this.trackingStartTime = Date.now();
        
        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'booking_started', {
                'booking_method': 'website',
                'timestamp': new Date().toISOString()
            });
        }
    }

    /**
     * Track booking completion
     */
    trackBookingCompletion(method, booking) {
        this.analytics.bookingCompletions++;
        this.analytics[method + 'Bookings']++;
        
        if (this.trackingStartTime) {
            const duration = Date.now() - this.trackingStartTime;
            this.updateAverageBookingTime(duration);
            this.trackingStartTime = null;
        }

        if (booking) {
            this.trackPopularTimes(booking.time);
            this.trackPopularServices(booking.appointmentType.name);
        }

        this.updateConversionRate();

        // Google Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'booking_completed', {
                'booking_method': method,
                'booking_id': booking ? booking.id : 'unknown',
                'service_type': booking ? booking.appointmentType.name : 'unknown',
                'value': booking ? booking.appointmentType.price : 0
            });
        }
    }

    /**
     * Update average booking time
     */
    updateAverageBookingTime(duration) {
        const currentAvg = this.analytics.averageBookingTime;
        const completions = this.analytics.bookingCompletions;
        
        this.analytics.averageBookingTime = 
            (currentAvg * (completions - 1) + duration) / completions;
    }

    /**
     * Track popular booking times
     */
    trackPopularTimes(time) {
        const hour = time.split(':')[0];
        const count = this.analytics.popularTimes.get(hour) || 0;
        this.analytics.popularTimes.set(hour, count + 1);
    }

    /**
     * Track popular services
     */
    trackPopularServices(service) {
        const count = this.analytics.popularServices.get(service) || 0;
        this.analytics.popularServices.set(service, count + 1);
    }

    /**
     * Update conversion rate
     */
    updateConversionRate() {
        if (this.analytics.bookingStarts > 0) {
            this.analytics.conversionRate = 
                (this.analytics.bookingCompletions / this.analytics.bookingStarts) * 100;
        }
    }

    /**
     * Setup automated workflows
     */
    setupAutomatedWorkflows() {
        // Setup reminder system
        this.setupBookingReminders();
        
        // Setup follow-up system
        this.setupFollowUpSystem();
        
        // Setup feedback collection
        this.setupFeedbackCollection();
    }

    /**
     * Setup booking reminders
     */
    setupBookingReminders() {
        // Check for upcoming appointments every hour
        setInterval(() => {
            this.checkUpcomingAppointments();
        }, 60 * 60 * 1000);
    }

    /**
     * Check for upcoming appointments
     */
    checkUpcomingAppointments() {
        if (!this.systems.calendar) return;

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const upcomingBookings = this.systems.calendar.getBookings(tomorrow);
        
        upcomingBookings.forEach(booking => {
            this.sendBookingReminder(booking);
        });
    }

    /**
     * Send booking reminder (simulated)
     */
    sendBookingReminder(booking) {
        console.log('Sending reminder for booking:', booking.id);
        
        // In a real implementation, this would:
        // - Send email reminder
        // - Send SMS reminder
        // - Show browser notification
        // - Update CRM system
    }

    /**
     * Setup follow-up system
     */
    setupFollowUpSystem() {
        // Setup post-appointment follow-ups
        // This would typically run as a backend service
        console.log('Follow-up system initialized');
    }

    /**
     * Setup feedback collection
     */
    setupFeedbackCollection() {
        // Setup post-service feedback collection
        // This would typically integrate with review platforms
        console.log('Feedback collection system initialized');
    }

    /**
     * Get booking analytics
     */
    getAnalytics() {
        return {
            ...this.analytics,
            popularTimes: Object.fromEntries(this.analytics.popularTimes),
            popularServices: Object.fromEntries(this.analytics.popularServices)
        };
    }

    /**
     * Utility functions
     */
    generateCustomerId() {
        return 'CUST' + Date.now().toString(36).toUpperCase();
    }

    /**
     * Setup automated follow-ups
     */
    setupAutomatedFollowUps() {
        // This would integrate with email marketing and CRM systems
        console.log('Automated follow-up system initialized');
    }
}

/**
 * Booking Flow Coordinator
 */
class BookingFlowCoordinator {
    constructor(integration) {
        this.integration = integration;
        this.currentStep = 0;
        this.maxSteps = 5;
        this.setupFlowTracking();
    }

    setupFlowTracking() {
        // Track user progress through booking flow
        this.steps = [
            'landing',      // User arrives on booking page
            'intent',       // User shows booking intent
            'date',         // User selects date
            'time',         // User selects time
            'service',      // User selects service type
            'details',      // User provides contact details
            'confirmation'  // Booking confirmed
        ];
    }

    advanceStep(stepName) {
        const stepIndex = this.steps.indexOf(stepName);
        if (stepIndex > this.currentStep) {
            this.currentStep = stepIndex;
            this.trackStepProgress();
        }
    }

    trackStepProgress() {
        const progress = (this.currentStep / (this.steps.length - 1)) * 100;
        
        // Update progress indicator if it exists
        const progressBar = document.querySelector('.booking-progress');
        if (progressBar) {
            progressBar.style.width = progress + '%';
        }

        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'booking_step_completed', {
                'step_name': this.steps[this.currentStep],
                'step_number': this.currentStep + 1,
                'progress_percentage': progress
            });
        }
    }
}

// Initialize booking integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure all other systems are initialized
    setTimeout(() => {
        window.bookingIntegration = new BookingIntegration();
    }, 2000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BookingIntegration, BookingFlowCoordinator };
}