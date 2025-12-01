/**
 * ChatGPT Integration for Colin's Professional Building Services
 * Stage 3: AI-Powered Customer Support and Lead Generation
 */

class ChatbotManager {
    constructor() {
        this.config = null;
        this.isOpen = false;
        this.conversationHistory = [];
        this.currentContext = 'general-inquiry';
        this.customerData = {};
        this.init();
    }

    /**
     * Initialize chatbot system
     */
    async init() {
        try {
            // Check if chatbot feature is enabled
            if (window.featureManager && !window.featureManager.isEnabled('chatbot')) {
                console.log('Chatbot feature disabled - skipping initialization');
                return;
            }
            
            // Load chatbot configuration from XML
            await this.loadChatbotConfig();
            
            // Create chatbot UI
            this.createChatbotUI();
            
            // Initialize conversation
            this.initializeConversation();
            
            // Add event listeners
            this.addEventListeners();
            
        } catch (error) {
            console.error('Chatbot initialization failed:', error);
            this.showError('Chatbot temporarily unavailable');
        }
    }

    /**
     * Load chatbot configuration from XML
     */
    async loadChatbotConfig() {
        try {
            const xmlParser = window.xmlParser;
            if (xmlParser && xmlParser.config && xmlParser.config.chatbot) {
                this.config = xmlParser.config.chatbot;
                console.log('Chatbot config loaded:', this.config);
            } else {
                // Fallback configuration
                this.config = this.getFallbackConfig();
            }
        } catch (error) {
            console.error('Failed to load chatbot config:', error);
            this.config = this.getFallbackConfig();
        }
    }

    /**
     * Fallback chatbot configuration
     */
    getFallbackConfig() {
        return {
            "api-key": "demo-mode",
            model: "gpt-4",
            "max-tokens": 500,
            temperature: 0.7,
            personality: {
                tone: "Professional yet friendly",
                expertise: "Building and construction",
                style: "Helpful and informative"
            },
            prompts: {
                "general-inquiry": `You are a professional assistant for Colin's Professional Building Services, a trusted builder in London with over 15 years of experience. You help customers understand our services, get quotes, and book consultations.

Our services include:
- Home Extensions (£15,000-£50,000, 4-12 weeks)
- Kitchen Fitting (£8,000-£25,000, 1-3 weeks)  
- Bathroom Renovations (£5,000-£15,000, 1-2 weeks)
- General Building work (£200-£5,000, 1 day-2 weeks)

We're Gas Safe registered, NICEIC approved, FMB members, and Checkatrade approved.
Use a friendly but professional tone. Focus on understanding their needs and guiding them toward booking a consultation.`,

                "quote-request": `You're helping gather information for a building project quote. Ask about:
- Project type and specific requirements
- Property details and access
- Timeline and urgency  
- Budget considerations
- Any planning permission needs

Guide the conversation toward booking a free site visit for an accurate quote.`,

                "emergency-service": `You're handling an urgent building issue. Prioritize:
- Safety assessment and immediate advice
- Emergency contact: +44 7700 900999
- Temporary solutions if safe
- Follow-up appointment scheduling

Always emphasize safety first and provide emergency contact details.`
            },
            "greeting-messages": {
                default: "Hi! I'm here to help with your building project needs. How can I assist you today?",
                emergency: "I understand this is urgent. Please describe the issue and I'll connect you with emergency support immediately."
            },
            "escalation-triggers": [
                "planning permission",
                "structural engineer", 
                "insurance claim",
                "complaint"
            ]
        };
    }

    /**
     * Create chatbot UI
     */
    createChatbotUI() {
        const chatbotHTML = `
            <div id="chatbot-container" class="chatbot-container">
                <div class="chatbot-toggle" id="chatbot-toggle">
                    <div class="chatbot-icon">💬</div>
                    <div class="chatbot-label">Chat with us</div>
                </div>
                
                <div class="chatbot-window" id="chatbot-window">
                    <div class="chatbot-header">
                        <div class="chatbot-title">
                            <div class="chatbot-avatar">🔨</div>
                            <div class="chatbot-info">
                                <h4>Colin's Assistant</h4>
                                <span class="chatbot-status">Online</span>
                            </div>
                        </div>
                        <button class="chatbot-close" id="chatbot-close">&times;</button>
                    </div>
                    
                    <div class="chatbot-messages" id="chatbot-messages">
                        <div class="chatbot-welcome">
                            <div class="welcome-message">
                                <h5>Welcome to Colin's Building Services! 👋</h5>
                                <p>I'm here to help you with:</p>
                                <div class="quick-options">
                                    <button class="quick-option" data-type="general">General Questions</button>
                                    <button class="quick-option" data-type="quote">Get a Quote</button>
                                    <button class="quick-option" data-type="emergency">Emergency Help</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="chatbot-input-area">
                        <div class="chatbot-suggestions" id="chatbot-suggestions"></div>
                        <div class="chatbot-input-container">
                            <input type="text" 
                                   id="chatbot-input" 
                                   placeholder="Type your message..."
                                   autocomplete="off">
                            <button id="chatbot-send" class="chatbot-send-btn">
                                <span class="send-icon">➤</span>
                            </button>
                        </div>
                        <div class="chatbot-footer">
                            <small>Powered by AI • Data handled securely</small>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }

    /**
     * Initialize conversation
     */
    initializeConversation() {
        const greeting = this.config['greeting-messages'].default;
        this.conversationHistory.push({
            role: 'assistant',
            content: greeting,
            timestamp: new Date()
        });
    }

    /**
     * Add event listeners
     */
    addEventListeners() {
        const toggle = document.getElementById('chatbot-toggle');
        const close = document.getElementById('chatbot-close');
        const input = document.getElementById('chatbot-input');
        const send = document.getElementById('chatbot-send');
        const quickOptions = document.querySelectorAll('.quick-option');

        toggle.addEventListener('click', () => this.toggleChatbot());
        close.addEventListener('click', () => this.closeChatbot());
        send.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        quickOptions.forEach(option => {
            option.addEventListener('click', () => {
                const type = option.dataset.type;
                this.handleQuickOption(type);
            });
        });

        // Auto-open chatbot after delay (demo purposes)
        setTimeout(() => {
            if (!this.isOpen) {
                this.showChatbotHint();
            }
        }, 30000);
    }

    /**
     * Toggle chatbot visibility
     */
    toggleChatbot() {
        const window = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            window.classList.add('active');
            toggle.classList.add('hidden');
            this.isOpen = true;
            
            // Focus input
            setTimeout(() => {
                document.getElementById('chatbot-input').focus();
            }, 300);
        }
    }

    /**
     * Close chatbot
     */
    closeChatbot() {
        const window = document.getElementById('chatbot-window');
        const toggle = document.getElementById('chatbot-toggle');
        
        window.classList.remove('active');
        toggle.classList.remove('hidden');
        this.isOpen = false;
    }

    /**
     * Handle quick option selection
     */
    handleQuickOption(type) {
        this.currentContext = type + '-inquiry';
        
        const messages = {
            general: "I'd like to learn more about your building services.",
            quote: "I need a quote for my building project.",
            emergency: "I have an urgent building issue that needs immediate attention."
        };

        const message = messages[type];
        this.addUserMessage(message);
        this.processMessage(message);
        
        // Hide welcome message
        const welcome = document.querySelector('.chatbot-welcome');
        if (welcome) {
            welcome.style.display = 'none';
        }
    }

    /**
     * Send user message
     */
    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        input.value = '';
        this.addUserMessage(message);
        this.processMessage(message);
    }

    /**
     * Add user message to chat
     */
    addUserMessage(message) {
        const messagesContainer = document.getElementById('chatbot-messages');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chatbot-message user-message';
        messageElement.innerHTML = `
            <div class="message-content">${this.sanitizeHTML(message)}</div>
            <div class="message-time">${this.formatTime(new Date())}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        // Add to conversation history
        this.conversationHistory.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });
    }

    /**
     * Add assistant message to chat
     */
    addAssistantMessage(message, isTyping = false) {
        const messagesContainer = document.getElementById('chatbot-messages');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'chatbot-message assistant-message';
        
        if (isTyping) {
            messageElement.innerHTML = `
                <div class="chatbot-avatar">🔨</div>
                <div class="message-content typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            `;
        } else {
            messageElement.innerHTML = `
                <div class="chatbot-avatar">🔨</div>
                <div class="message-content">${this.sanitizeHTML(message)}</div>
                <div class="message-time">${this.formatTime(new Date())}</div>
            `;
        }
        
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        if (!isTyping) {
            // Add to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                content: message,
                timestamp: new Date()
            });
        }
        
        return messageElement;
    }

    /**
     * Process user message with AI
     */
    async processMessage(message) {
        // Show typing indicator
        const typingElement = this.addAssistantMessage('', true);
        
        try {
            // Check for escalation triggers
            if (this.shouldEscalate(message)) {
                this.handleEscalation(message);
                typingElement.remove();
                return;
            }
            
            // Simulate AI processing delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Generate response based on context and message
            const response = await this.generateResponse(message);
            
            // Remove typing indicator and add response
            typingElement.remove();
            this.addAssistantMessage(response);
            
            // Check if we should show suggestions
            this.showSuggestions(message, response);
            
        } catch (error) {
            console.error('Message processing failed:', error);
            typingElement.remove();
            this.addAssistantMessage("I apologize, but I'm experiencing technical difficulties. Please call us directly at +44 7700 900123 for immediate assistance.");
        }
    }

    /**
     * Generate AI response (simulated for demo)
     */
    async generateResponse(message) {
        // In a real implementation, this would call the OpenAI API
        // For demo purposes, we'll generate contextual responses
        
        const lowerMessage = message.toLowerCase();
        
        // Emergency responses
        if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent') || lowerMessage.includes('leak') || lowerMessage.includes('flood')) {
            return `I understand this is urgent. For immediate emergency assistance, please call our emergency line at **+44 7700 900999** right away. 

In the meantime, if it's safe to do so:
- Turn off the water supply if there's a leak
- Ensure electrical safety
- Take photos for insurance if possible

I can also schedule a follow-up appointment once the emergency is resolved. Is this something I can help arrange?`;
        }
        
        // Quote requests
        if (lowerMessage.includes('quote') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
            return `I'd be happy to help you get an accurate quote! To provide the best estimate, I'll need some details about your project:

• What type of work are you considering? (Extension, Kitchen, Bathroom, or General building work)
• What's the approximate size or scope?
• What's your preferred timeline?
• Do you have a rough budget in mind?

We offer **free consultations** where Colin can visit your property and provide a detailed, no-obligation quote. Would you like me to arrange that for you?`;
        }
        
        // Service inquiries
        if (lowerMessage.includes('extension')) {
            return `Great choice! Home extensions are one of our specialties. We handle both single and double-storey extensions, with full planning permission support.

**Our extension services include:**
• Design consultation and planning
• Full project management
• Building regulations compliance
• Typical duration: 4-12 weeks
• Price range: £15,000 - £50,000

We've completed over 500+ projects across London and the South East. Would you like to book a free consultation to discuss your specific requirements?`;
        }
        
        if (lowerMessage.includes('kitchen')) {
            return `Excellent! Kitchen renovations are transformative projects. We provide complete design and installation services, from contemporary to traditional styles.

**Kitchen services include:**
• Full design consultation
• Plumbing and electrical work
• Premium appliance installation
• Typical duration: 1-3 weeks
• Price range: £8,000 - £25,000

We work with trusted suppliers to ensure quality materials and finishes. Would you like to see some examples of our recent kitchen projects, or shall we arrange a consultation?`;
        }
        
        if (lowerMessage.includes('bathroom')) {
            return `Perfect! Bathroom renovations are one of our most popular services. We specialize in both luxury upgrades and practical refurbishments.

**Bathroom services include:**
• Complete design and installation
• Wet room conversions
• Accessibility modifications
• High-end fixtures and fittings
• Typical duration: 1-2 weeks
• Price range: £5,000 - £15,000

All our work is fully guaranteed and we're Gas Safe registered for any heating work. Would you like to discuss your specific bathroom vision?`;
        }
        
        // Accreditations
        if (lowerMessage.includes('certified') || lowerMessage.includes('qualified') || lowerMessage.includes('accredited')) {
            return `Absolutely! We're fully certified and accredited with all major UK building organizations:

**Our Certifications:**
• **Gas Safe Registered** - All gas work fully certified
• **NICEIC Approved** - Electrical work by qualified contractors  
• **FMB Member** - Federation of Master Builders
• **Checkatrade Approved** - Verified customer reviews

We also carry full public liability insurance and provide written guarantees on all work. Your peace of mind is our priority!`;
        }
        
        // General responses
        const generalResponses = [
            `Thanks for reaching out! I'm here to help with any questions about our building services. We've been serving London and the South East for over 15 years, specializing in extensions, kitchens, bathrooms, and general building work.

What specific project do you have in mind? I can provide information about our services, typical timelines, and help arrange a free consultation.`,

            `Hello! Colin's Building Services has been creating beautiful, functional spaces for homeowners across London and Kent since 2008. We pride ourselves on quality workmanship and excellent customer service.

Is there a particular project you're considering? I can walk you through our process and help you understand what's involved.`,

            `Great to hear from you! Whether you're planning a major renovation or need help with smaller building work, we're here to help. Our team handles everything from initial design through to completion.

What would you like to know more about? Our services, process, or perhaps you'd like to arrange a consultation?`
        ];
        
        return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }

    /**
     * Check if message should trigger escalation
     */
    shouldEscalate(message) {
        const triggers = this.config['escalation-triggers'] || [];
        return triggers.some(trigger => 
            message.toLowerCase().includes(trigger.toLowerCase())
        );
    }

    /**
     * Handle escalation to human agent
     */
    handleEscalation(message) {
        const escalationMessage = `I understand your inquiry requires specialized attention. Let me connect you with Colin directly for the best assistance.

**Contact Colin directly:**
📞 **Phone:** +44 7700 900123
✉️ **Email:** colin@colinbuilds.co.uk

Or I can arrange for Colin to call you back within 2 hours during business hours. Would you prefer a callback?`;

        this.addAssistantMessage(escalationMessage);
        this.showContactForm();
    }

    /**
     * Show contact form for lead capture
     */
    showContactForm() {
        const messagesContainer = document.getElementById('chatbot-messages');
        
        const formElement = document.createElement('div');
        formElement.className = 'chatbot-message assistant-message';
        formElement.innerHTML = `
            <div class="chatbot-avatar">🔨</div>
            <div class="message-content">
                <div class="contact-form">
                    <h5>Quick Contact Form</h5>
                    <form id="chatbot-contact-form">
                        <input type="text" placeholder="Your Name" name="name" required>
                        <input type="tel" placeholder="Phone Number" name="phone" required>
                        <input type="email" placeholder="Email Address" name="email" required>
                        <textarea placeholder="Brief description of your project..." name="message" rows="3"></textarea>
                        <button type="submit" class="btn btn-primary btn-small">Request Callback</button>
                    </form>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(formElement);
        this.scrollToBottom();
        
        // Add form handler
        const form = formElement.querySelector('#chatbot-contact-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactFormSubmission(new FormData(form));
        });
    }

    /**
     * Handle contact form submission
     */
    async handleContactFormSubmission(formData) {
        const data = Object.fromEntries(formData);
        
        // Store customer data
        this.customerData = { ...this.customerData, ...data };
        
        // Show confirmation
        this.addAssistantMessage(`Thank you, ${data.name}! I've recorded your details and Colin will call you back at ${data.phone} within 2 hours during business hours (Mon-Fri 8AM-6PM, Sat 8AM-4PM).

**Your reference number:** CB${Date.now().toString().slice(-6)}

Is there anything else I can help you with while you wait?`);
        
        // In a real implementation, this would send data to your CRM/email system
        console.log('Lead captured:', data);
        
        // Show success analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'lead_generated', {
                'method': 'chatbot',
                'value': 1
            });
        }
    }

    /**
     * Show suggestions based on conversation
     */
    showSuggestions(userMessage, botResponse) {
        const suggestionsContainer = document.getElementById('chatbot-suggestions');
        
        let suggestions = [];
        
        if (botResponse.includes('consultation') || botResponse.includes('quote')) {
            suggestions = [
                'Book a free consultation',
                'View our gallery',
                'See our certifications'
            ];
        } else if (botResponse.includes('extension')) {
            suggestions = [
                'Planning permission help',
                'Extension timeline',
                'View extension gallery'
            ];
        } else if (botResponse.includes('kitchen') || botResponse.includes('bathroom')) {
            suggestions = [
                'See example projects',
                'Book consultation',
                'Material options'
            ];
        }
        
        if (suggestions.length > 0) {
            suggestionsContainer.innerHTML = suggestions.map(suggestion => 
                `<button class="suggestion-btn">${suggestion}</button>`
            ).join('');
            
            // Add click handlers
            suggestionsContainer.querySelectorAll('.suggestion-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.addUserMessage(btn.textContent);
                    this.processMessage(btn.textContent);
                    suggestionsContainer.innerHTML = '';
                });
            });
        }
    }

    /**
     * Show chatbot hint
     */
    showChatbotHint() {
        const toggle = document.getElementById('chatbot-toggle');
        toggle.classList.add('pulse');
        
        setTimeout(() => {
            toggle.classList.remove('pulse');
        }, 3000);
    }

    /**
     * Utility functions
     */
    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    scrollToBottom() {
        const container = document.getElementById('chatbot-messages');
        container.scrollTop = container.scrollHeight;
    }

    /**
     * Show error message
     */
    showError(message) {
        if (document.getElementById('chatbot-container')) {
            this.addAssistantMessage(`⚠️ ${message}`);
        }
    }

    /**
     * Get conversation summary for form integration
     */
    getConversationSummary() {
        return {
            context: this.currentContext,
            messageCount: this.conversationHistory.length,
            customerData: this.customerData,
            lastMessage: this.conversationHistory[this.conversationHistory.length - 1]?.content || '',
            duration: Date.now() - (this.conversationHistory[0]?.timestamp?.getTime() || Date.now())
        };
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for XML parser to load first
    setTimeout(() => {
        window.chatbotManager = new ChatbotManager();
    }, 1000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChatbotManager;
}