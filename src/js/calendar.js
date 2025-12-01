/**
 * Calendar Integration System for Colin's Professional Building Services
 * Stage 4: Advanced Booking and Calendar Management
 */

class CalendarManager {
    constructor() {
        this.config = null;
        this.appointments = new Map();
        this.availableSlots = new Map();
        this.currentMonth = new Date();
        this.selectedDate = null;
        this.selectedTime = null;
        this.appointmentTypes = new Map();
        this.init();
    }

    /**
     * Initialize calendar system
     */
    async init() {
        try {
            // Check if calendar features are enabled
            const fm = window.featureManager;
            if (fm && !fm.isEnabled('calendar-booking')) {
                console.log('Calendar booking feature disabled - skipping initialization');
                return;
            }
            
            await this.loadCalendarConfig();
            this.generateAppointmentSlots();
            
            // Setup calendar UI components based on feature toggles
            if (!fm || fm.isEnabled('booking-page.calendar-widget')) {
                this.setupCalendarUI();
            }
            
            this.loadExistingAppointments();
            this.initializeEventListeners();
        } catch (error) {
            console.error('Calendar initialization failed:', error);
            this.showCalendarError();
        }
    }

    /**
     * Load calendar configuration from XML
     */
    async loadCalendarConfig() {
        try {
            const xmlParser = window.xmlParser;
            if (xmlParser && xmlParser.config && xmlParser.config.calendar) {
                this.config = xmlParser.config.calendar;
                this.processAppointmentTypes();
                console.log('Calendar config loaded:', this.config);
            } else {
                this.config = this.getFallbackConfig();
                this.processAppointmentTypes();
            }
        } catch (error) {
            console.error('Failed to load calendar config:', error);
            this.config = this.getFallbackConfig();
            this.processAppointmentTypes();
        }
    }

    /**
     * Fallback calendar configuration
     */
    getFallbackConfig() {
        return {
            provider: "google",
            "google-calendar": {
                "calendar-id": "primary",
                "client-id": "demo-client-id",
                "client-secret": "demo-client-secret"
            },
            availability: {
                "working-hours": {
                    monday: { start: "08:00", end: "18:00" },
                    tuesday: { start: "08:00", end: "18:00" },
                    wednesday: { start: "08:00", end: "18:00" },
                    thursday: { start: "08:00", end: "18:00" },
                    friday: { start: "08:00", end: "18:00" },
                    saturday: { start: "08:00", end: "16:00" },
                    sunday: { available: false }
                },
                "buffer-time": 30,
                "advance-booking-days": 60,
                "minimum-notice-hours": 24
            },
            "appointment-types": [
                {
                    id: "consultation",
                    name: "Initial Consultation",
                    duration: 60,
                    description: "Free consultation to discuss your project needs",
                    price: 0
                },
                {
                    id: "site-survey",
                    name: "Site Survey",
                    duration: 120,
                    description: "Detailed property survey for accurate quotation",
                    price: 0
                },
                {
                    id: "quote-presentation",
                    name: "Quote Presentation",
                    duration: 45,
                    description: "Detailed project quote and timeline discussion",
                    price: 0
                },
                {
                    id: "emergency",
                    name: "Emergency Callout",
                    duration: 60,
                    description: "Urgent building issues requiring immediate attention",
                    price: 150,
                    "available-247": true
                }
            ],
            "blackout-dates": [
                "2024-12-25",
                "2024-12-26", 
                "2025-01-01"
            ]
        };
    }

    /**
     * Process appointment types from config
     */
    processAppointmentTypes() {
        this.appointmentTypes.clear();
        if (this.config && this.config['appointment-types']) {
            this.config['appointment-types'].forEach(type => {
                this.appointmentTypes.set(type.id, type);
            });
        }
    }

    /**
     * Generate available appointment slots
     */
    generateAppointmentSlots() {
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + (this.config.availability['advance-booking-days'] || 60));

        // Clear existing slots
        this.availableSlots.clear();

        // Generate slots for each day
        for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateKey = this.formatDateKey(date);
            const dayName = this.getDayName(date.getDay());
            
            // Check if day is available
            const dayConfig = this.config.availability['working-hours'][dayName.toLowerCase()];
            if (!dayConfig || dayConfig.available === false) {
                continue;
            }

            // Check blackout dates
            if (this.config['blackout-dates'] && this.config['blackout-dates'].includes(dateKey)) {
                continue;
            }

            // Generate time slots for the day
            const slots = this.generateDaySlots(date, dayConfig);
            if (slots.length > 0) {
                this.availableSlots.set(dateKey, slots);
            }
        }
    }

    /**
     * Generate time slots for a specific day
     */
    generateDaySlots(date, dayConfig) {
        const slots = [];
        const startHour = parseInt(dayConfig.start.split(':')[0]);
        const startMinute = parseInt(dayConfig.start.split(':')[1]);
        const endHour = parseInt(dayConfig.end.split(':')[0]);
        const endMinute = parseInt(dayConfig.end.split(':')[1]);

        const slotDuration = 60; // minutes
        const bufferTime = this.config.availability['buffer-time'] || 30;

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += slotDuration) {
                // Don't start in the middle of working hours
                if (hour === startHour && minute < startMinute) continue;
                if (hour === endHour - 1 && minute + slotDuration > endMinute) break;

                const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                const slotDate = new Date(date);
                slotDate.setHours(hour, minute, 0, 0);

                // Check minimum notice period
                const now = new Date();
                const minNoticeHours = this.config.availability['minimum-notice-hours'] || 24;
                const minBookingTime = new Date(now.getTime() + (minNoticeHours * 60 * 60 * 1000));

                if (slotDate < minBookingTime) continue;

                slots.push({
                    time: slotTime,
                    datetime: slotDate,
                    available: true,
                    booked: false
                });
            }
        }

        return slots;
    }

    /**
     * Setup calendar UI
     */
    setupCalendarUI() {
        const calendarContainer = document.getElementById('calendar-container');
        if (!calendarContainer) return;

        calendarContainer.innerHTML = `
            <div class="calendar-widget">
                <div class="calendar-header">
                    <button class="calendar-nav-btn" id="prev-month">‹</button>
                    <h3 class="calendar-title" id="calendar-title"></h3>
                    <button class="calendar-nav-btn" id="next-month">›</button>
                </div>
                <div class="calendar-grid" id="calendar-grid">
                    <!-- Calendar days will be generated here -->
                </div>
            </div>
            
            <div class="appointment-selector" id="appointment-selector" style="display: none;">
                <h4>Available Times for <span id="selected-date-display"></span></h4>
                <div class="time-slots" id="time-slots">
                    <!-- Time slots will be generated here -->
                </div>
            </div>
            
            <div class="appointment-types" id="appointment-types" style="display: none;">
                <h4>Select Appointment Type</h4>
                <div class="appointment-type-grid">
                    <!-- Appointment types will be generated here -->
                </div>
            </div>
            
            <div class="booking-summary" id="booking-summary" style="display: none;">
                <h4>Booking Summary</h4>
                <div class="summary-details">
                    <!-- Booking details will be shown here -->
                </div>
                <div class="booking-actions">
                    <button class="btn btn-secondary" id="edit-booking">Edit Details</button>
                    <button class="btn btn-primary" id="confirm-booking">Confirm Booking</button>
                </div>
            </div>
        `;

        this.renderCalendar();
        this.renderAppointmentTypes();
    }

    /**
     * Render calendar grid
     */
    renderCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        const calendarTitle = document.getElementById('calendar-title');
        
        if (!calendarGrid || !calendarTitle) return;

        // Update title
        const monthName = this.currentMonth.toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
        });
        calendarTitle.textContent = monthName;

        // Clear grid
        calendarGrid.innerHTML = '';

        // Add day headers
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Get first day of month and number of days
        const firstDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
        const lastDay = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        // Generate calendar days
        for (let i = 0; i < 42; i++) { // 6 weeks x 7 days
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = this.createCalendarDay(date);
            calendarGrid.appendChild(dayElement);
        }
    }

    /**
     * Create individual calendar day element
     */
    createCalendarDay(date) {
        const dayElement = document.createElement('div');
        const dateKey = this.formatDateKey(date);
        const isCurrentMonth = date.getMonth() === this.currentMonth.getMonth();
        const isToday = this.isToday(date);
        const isPast = date < new Date();
        const hasSlots = this.availableSlots.has(dateKey);
        
        dayElement.className = 'calendar-day';
        
        if (!isCurrentMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        if (isPast) {
            dayElement.classList.add('past');
        }
        
        if (hasSlots && !isPast) {
            dayElement.classList.add('available');
            dayElement.addEventListener('click', () => {
                this.selectDate(date);
            });
        }
        
        if (!hasSlots && !isPast && isCurrentMonth) {
            dayElement.classList.add('unavailable');
        }

        dayElement.innerHTML = `
            <span class="day-number">${date.getDate()}</span>
            ${hasSlots && !isPast ? '<span class="availability-indicator">●</span>' : ''}
        `;
        
        return dayElement;
    }

    /**
     * Select a date
     */
    selectDate(date) {
        this.selectedDate = date;
        this.selectedTime = null;
        
        // Update UI
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.classList.remove('selected');
        });
        
        event.currentTarget.classList.add('selected');
        
        // Show time slots
        this.showTimeSlots(date);
    }

    /**
     * Show available time slots for selected date
     */
    showTimeSlots(date) {
        const appointmentSelector = document.getElementById('appointment-selector');
        const selectedDateDisplay = document.getElementById('selected-date-display');
        const timeSlotsContainer = document.getElementById('time-slots');
        
        if (!appointmentSelector || !selectedDateDisplay || !timeSlotsContainer) return;

        const dateKey = this.formatDateKey(date);
        const slots = this.availableSlots.get(dateKey) || [];
        
        selectedDateDisplay.textContent = date.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Clear existing slots
        timeSlotsContainer.innerHTML = '';
        
        if (slots.length === 0) {
            timeSlotsContainer.innerHTML = '<p class="no-slots">No available slots for this date.</p>';
        } else {
            slots.forEach(slot => {
                if (slot.available && !slot.booked) {
                    const slotElement = document.createElement('button');
                    slotElement.className = 'time-slot';
                    slotElement.textContent = this.formatTime(slot.time);
                    slotElement.addEventListener('click', () => {
                        this.selectTimeSlot(slot);
                    });
                    timeSlotsContainer.appendChild(slotElement);
                }
            });
        }
        
        appointmentSelector.style.display = 'block';
        appointmentSelector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Select a time slot
     */
    selectTimeSlot(slot) {
        this.selectedTime = slot;
        
        // Update UI
        document.querySelectorAll('.time-slot').forEach(button => {
            button.classList.remove('selected');
        });
        
        event.currentTarget.classList.add('selected');
        
        // Show appointment types
        this.showAppointmentTypes();
    }

    /**
     * Show appointment type selection
     */
    showAppointmentTypes() {
        const appointmentTypesContainer = document.getElementById('appointment-types');
        if (!appointmentTypesContainer) return;

        appointmentTypesContainer.style.display = 'block';
        appointmentTypesContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Render appointment types
     */
    renderAppointmentTypes() {
        const container = document.querySelector('.appointment-type-grid');
        if (!container) return;

        container.innerHTML = '';

        this.appointmentTypes.forEach(type => {
            const typeElement = document.createElement('div');
            typeElement.className = 'appointment-type-card';
            typeElement.innerHTML = `
                <div class="type-header">
                    <h5>${type.name}</h5>
                    <span class="type-duration">${type.duration} min</span>
                </div>
                <p class="type-description">${type.description}</p>
                <div class="type-footer">
                    <span class="type-price">${type.price === 0 ? 'Free' : '£' + type.price}</span>
                    <button class="btn btn-secondary btn-small select-type-btn" data-type-id="${type.id}">
                        Select
                    </button>
                </div>
            `;
            
            const selectBtn = typeElement.querySelector('.select-type-btn');
            selectBtn.addEventListener('click', () => {
                this.selectAppointmentType(type);
            });
            
            container.appendChild(typeElement);
        });
    }

    /**
     * Select appointment type
     */
    selectAppointmentType(type) {
        this.selectedAppointmentType = type;
        
        // Update UI
        document.querySelectorAll('.appointment-type-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        event.currentTarget.closest('.appointment-type-card').classList.add('selected');
        
        // Show booking summary
        this.showBookingSummary();
    }

    /**
     * Show booking summary
     */
    showBookingSummary() {
        const summaryContainer = document.getElementById('booking-summary');
        const summaryDetails = document.querySelector('.summary-details');
        
        if (!summaryContainer || !summaryDetails) return;

        const formattedDate = this.selectedDate.toLocaleDateString('en-GB', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const formattedTime = this.formatTime(this.selectedTime.time);
        const endTime = this.calculateEndTime(this.selectedTime.time, this.selectedAppointmentType.duration);

        summaryDetails.innerHTML = `
            <div class="summary-row">
                <span class="summary-label">Date:</span>
                <span class="summary-value">${formattedDate}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Time:</span>
                <span class="summary-value">${formattedTime} - ${endTime}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Service:</span>
                <span class="summary-value">${this.selectedAppointmentType.name}</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Duration:</span>
                <span class="summary-value">${this.selectedAppointmentType.duration} minutes</span>
            </div>
            <div class="summary-row">
                <span class="summary-label">Cost:</span>
                <span class="summary-value">${this.selectedAppointmentType.price === 0 ? 'Free consultation' : '£' + this.selectedAppointmentType.price}</span>
            </div>
        `;

        summaryContainer.style.display = 'block';
        summaryContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Calendar navigation
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
                this.renderCalendar();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
                this.renderCalendar();
            });
        }

        // Booking actions
        const editBtn = document.getElementById('edit-booking');
        const confirmBtn = document.getElementById('confirm-booking');
        
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.resetBookingFlow();
            });
        }
        
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmBooking();
            });
        }
    }

    /**
     * Confirm booking
     */
    async confirmBooking() {
        if (!this.selectedDate || !this.selectedTime || !this.selectedAppointmentType) {
            alert('Please complete all booking selections.');
            return;
        }

        try {
            // Show loading state
            const confirmBtn = document.getElementById('confirm-booking');
            if (confirmBtn) {
                confirmBtn.disabled = true;
                confirmBtn.innerHTML = '<span class="loading-spinner"></span> Confirming...';
            }

            // Get customer data from form or chatbot
            const customerData = this.getCustomerData();
            
            // Create booking
            const booking = await this.createBooking(customerData);
            
            // Update UI
            this.showBookingConfirmation(booking);
            
            // Mark slot as booked
            this.markSlotAsBooked(this.selectedDate, this.selectedTime);
            
            // Send confirmation (simulated)
            await this.sendBookingConfirmation(booking);
            
        } catch (error) {
            console.error('Booking confirmation failed:', error);
            alert('Booking failed. Please try again or call us directly.');
        } finally {
            const confirmBtn = document.getElementById('confirm-booking');
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.innerHTML = 'Confirm Booking';
            }
        }
    }

    /**
     * Create booking record
     */
    async createBooking(customerData) {
        const bookingId = this.generateBookingId();
        const booking = {
            id: bookingId,
            customerId: customerData.id || null,
            date: this.formatDateKey(this.selectedDate),
            time: this.selectedTime.time,
            datetime: this.selectedTime.datetime,
            appointmentType: this.selectedAppointmentType,
            customer: customerData,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            notes: customerData.notes || ''
        };

        // Store booking
        this.appointments.set(bookingId, booking);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return booking;
    }

    /**
     * Get customer data from form or chatbot
     */
    getCustomerData() {
        // Try to get data from booking form first
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

        // Fallback to chatbot data
        if (window.chatbotManager && window.chatbotManager.customerData) {
            const chatData = window.chatbotManager.customerData;
            return {
                id: this.generateCustomerId(),
                name: chatData.name || '',
                email: chatData.email || '',
                phone: chatData.phone || '',
                address: chatData.address || '',
                projectType: chatData.projectType || '',
                notes: chatData.message || ''
            };
        }

        // Prompt for basic info if no data available
        return this.promptForCustomerData();
    }

    /**
     * Prompt for customer data if not available
     */
    promptForCustomerData() {
        const name = prompt('Please enter your name:') || '';
        const phone = prompt('Please enter your phone number:') || '';
        const email = prompt('Please enter your email address:') || '';

        return {
            id: this.generateCustomerId(),
            name: name,
            email: email,
            phone: phone,
            address: '',
            projectType: '',
            notes: 'Booking made via calendar widget'
        };
    }

    /**
     * Show booking confirmation
     */
    showBookingConfirmation(booking) {
        const summaryContainer = document.getElementById('booking-summary');
        if (!summaryContainer) return;

        summaryContainer.innerHTML = `
            <div class="booking-confirmation">
                <div class="confirmation-icon">✅</div>
                <h3>Booking Confirmed!</h3>
                <div class="confirmation-details">
                    <p><strong>Booking Reference:</strong> ${booking.id}</p>
                    <p><strong>Date & Time:</strong> ${this.selectedDate.toLocaleDateString('en-GB')} at ${this.formatTime(this.selectedTime.time)}</p>
                    <p><strong>Service:</strong> ${booking.appointmentType.name}</p>
                    <p><strong>Duration:</strong> ${booking.appointmentType.duration} minutes</p>
                </div>
                <div class="confirmation-actions">
                    <button class="btn btn-primary" onclick="window.print()">Print Confirmation</button>
                    <button class="btn btn-secondary" onclick="location.reload()">Book Another</button>
                </div>
                <div class="confirmation-note">
                    <p><small>A confirmation email has been sent to ${booking.customer.email}. 
                    If you need to reschedule, please call us at least 24 hours in advance.</small></p>
                </div>
            </div>
        `;
    }

    /**
     * Reset booking flow
     */
    resetBookingFlow() {
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedAppointmentType = null;

        // Hide sections
        document.getElementById('appointment-selector').style.display = 'none';
        document.getElementById('appointment-types').style.display = 'none';
        document.getElementById('booking-summary').style.display = 'none';

        // Reset calendar selection
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });
    }

    /**
     * Load existing appointments (simulated)
     */
    async loadExistingAppointments() {
        // Simulate loading appointments from server
        const demoAppointments = [
            {
                id: 'CB001',
                date: this.formatDateKey(new Date(2024, 11, 15)), // December 15, 2024
                time: '10:00',
                appointmentType: this.appointmentTypes.get('consultation'),
                customer: { name: 'John Smith', phone: '+44 7700 900123' }
            },
            {
                id: 'CB002', 
                date: this.formatDateKey(new Date(2024, 11, 18)), // December 18, 2024
                time: '14:00',
                appointmentType: this.appointmentTypes.get('site-survey'),
                customer: { name: 'Sarah Jones', phone: '+44 7700 900456' }
            }
        ];

        // Mark these slots as booked
        demoAppointments.forEach(appointment => {
            this.appointments.set(appointment.id, appointment);
            const date = new Date(appointment.date);
            this.markSlotAsBooked(date, { time: appointment.time });
        });
    }

    /**
     * Mark a slot as booked
     */
    markSlotAsBooked(date, timeSlot) {
        const dateKey = this.formatDateKey(date);
        const slots = this.availableSlots.get(dateKey);
        
        if (slots) {
            const slot = slots.find(s => s.time === timeSlot.time);
            if (slot) {
                slot.booked = true;
                slot.available = false;
            }
        }
    }

    /**
     * Send booking confirmation (simulated)
     */
    async sendBookingConfirmation(booking) {
        // Simulate sending confirmation email/SMS
        console.log('Sending booking confirmation:', booking);
        
        // In a real implementation, this would:
        // - Send confirmation email
        // - Send SMS reminder
        // - Add to Google/Outlook calendar
        // - Update CRM system
        // - Trigger automated workflows

        return new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Utility functions
     */
    formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    formatTime(time24) {
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    }

    calculateEndTime(startTime, durationMinutes) {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        
        const endDate = new Date(startDate.getTime() + (durationMinutes * 60 * 1000));
        
        return this.formatTime(endDate.toTimeString().slice(0, 5));
    }

    getDayName(dayIndex) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayIndex];
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    generateBookingId() {
        return 'CB' + Date.now().toString(36).toUpperCase();
    }

    generateCustomerId() {
        return 'CUST' + Date.now().toString(36).toUpperCase();
    }

    showCalendarError() {
        const container = document.getElementById('calendar-container');
        if (container) {
            container.innerHTML = `
                <div class="calendar-error">
                    <h4>Calendar Temporarily Unavailable</h4>
                    <p>Please call us directly at +44 7700 900123 to book your appointment.</p>
                    <a href="tel:+447700900123" class="btn btn-primary">Call Now</a>
                </div>
            `;
        }
    }

    /**
     * Public methods for external integration
     */
    getAvailableSlots(date) {
        const dateKey = this.formatDateKey(date);
        return this.availableSlots.get(dateKey) || [];
    }

    getBookings(date = null) {
        if (date) {
            const dateKey = this.formatDateKey(date);
            return Array.from(this.appointments.values()).filter(apt => apt.date === dateKey);
        }
        return Array.from(this.appointments.values());
    }

    isSlotAvailable(date, time) {
        const dateKey = this.formatDateKey(date);
        const slots = this.availableSlots.get(dateKey);
        if (!slots) return false;
        
        const slot = slots.find(s => s.time === time);
        return slot && slot.available && !slot.booked;
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if calendar container exists
    if (document.getElementById('calendar-container')) {
        setTimeout(() => {
            window.calendarManager = new CalendarManager();
        }, 1000);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarManager;
}