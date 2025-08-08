# Professional Builder Website - Feature Specification

## Project Overview
A modern, professional website for an independent builder featuring data-driven architecture, ChatGPT integration, and calendar booking system. All customization managed through a single XML configuration file.

## Core Requirements
- Professional landing page with hero section
- Gallery with Instagram integration
- UK industry accreditation display
- ChatGPT-powered chatbot with structured responses
- Calendar booking system (Google/Outlook integration)
- Single XML file for all customization
- Mobile-responsive design
- SEO optimization

## Architecture

### File Structure
```
colin-website/
├── index.html              # Main landing page
├── gallery.html            # Photo gallery page
├── services.html           # Services overview
├── accreditation.html      # UK certifications page
├── contact.html            # Contact information
├── booking.html            # Availability calendar page
├── config/
│   └── site-config.xml     # Master configuration file
├── css/
│   ├── main.css           # Main stylesheet
│   ├── responsive.css     # Mobile responsiveness
│   ├── gallery.css        # Gallery-specific styles
│   ├── chatbot.css        # Chatbot widget styles
│   └── calendar.css       # Calendar component styles
├── js/
│   ├── main.js            # Core functionality
│   ├── xml-parser.js      # XML data handling
│   ├── instagram.js       # Instagram integration
│   ├── chatbot.js         # ChatGPT integration
│   ├── form-handler.js    # Structured form submissions
│   └── calendar.js        # Calendar integration
├── images/
│   ├── hero/              # Landing page images
│   ├── gallery/           # Project photos
│   └── accreditation/     # Certification logos
└── favicon.ico
```

## Feature Specifications

### 1. XML Configuration System (site-config.xml)

#### Company Information
- Business name, tagline, description
- Logo and branding assets
- Contact details (phone, email, address)
- Business hours and emergency contact
- Social media links

#### Visual Branding
- Color scheme (primary, secondary, accent colors)
- Typography settings (fonts, sizes, weights)
- Layout preferences
- Custom CSS variables

#### Services Configuration
- Service categories and descriptions
- Pricing information (optional display)
- Service duration estimates
- Required materials/equipment
- Before/after photo associations

#### UK Accreditations
- Certification names and logos
- Issuing bodies
- Certificate numbers
- Validity dates and renewal reminders
- Compliance statements

#### Gallery Settings
- Instagram username/handle
- Gallery categories (kitchen, bathroom, extension, etc.)
- Featured project highlights
- Image metadata and descriptions

#### ChatGPT Configuration
- API key and model settings
- System prompts for different scenarios:
  - General inquiry prompt
  - Quote request prompt
  - Emergency service prompt
  - Booking assistance prompt
- Bot personality settings (tone, style, expertise level)
- Lead qualification questions
- Escalation triggers and responses
- Structured response templates

#### Calendar Integration
- Provider selection (Google/Outlook)
- API credentials and configuration
- Working hours and availability rules
- Appointment types and durations
- Buffer times between bookings
- Blackout dates and holidays
- Confirmation email templates

### 2. Landing Page Features

#### Hero Section
- Dynamic background images from XML
- Configurable headline and subtitle
- Call-to-action buttons (customizable text/links)
- Trust indicators (years in business, projects completed)

#### Services Overview
- Grid/card layout for service categories
- Dynamic content from XML configuration
- Service-specific imagery
- Quick quote buttons

#### Recent Projects Showcase
- Instagram feed integration
- Curated project highlights
- Before/after comparisons
- Project category filtering

#### Customer Testimonials
- Rotating testimonial carousel
- Star ratings and review text
- Customer names and project types
- Integration with Google Reviews (optional)

#### Trust Badges & Accreditations
- Dynamic certification display
- Validity status indicators
- Clickable verification links
- Insurance and warranty information

#### Integrated Chat Widget
- Floating chat button
- Customizable greeting message
- Company branding in chat interface
- Typing indicators and response timing

### 3. Gallery System

#### Instagram Integration
- OAuth authentication with Instagram Basic Display API
- Real-time feed synchronization
- Image caching for performance
- Fallback for API unavailability

#### Project Categorization
- XML-driven category system
- Filterable project types
- Tag-based organization
- Search functionality

#### Image Display
- Responsive grid layout
- Lightbox viewing with navigation
- Image lazy loading
- Mobile-optimized gestures

#### Project Details
- Project descriptions and specifications
- Client testimonials (with permission)
- Time duration and completion dates
- Materials and techniques used

### 4. ChatGPT Integration

#### Conversation Management
- Context-aware responses using XML data
- Multi-turn conversation handling
- Session persistence
- Conversation history

#### System Prompts (XML Configurable)
```xml
<chatbot-prompts>
    <general-inquiry>
        You are a professional assistant for [COMPANY_NAME], a trusted builder in [LOCATION]. 
        You help customers understand our services, get quotes, and book consultations.
        Use a friendly but professional tone. Reference our certifications and experience.
    </general-inquiry>
    <quote-request>
        You're helping gather information for a building project quote. Ask about:
        - Project type and scope
        - Property details and access
        - Timeline requirements
        - Budget considerations
        Guide the conversation toward booking a site visit.
    </quote-request>
    <emergency-service>
        You're handling an urgent building issue. Prioritize:
        - Safety assessment
        - Immediate containment advice
        - Emergency contact information
        - Follow-up appointment scheduling
    </emergency-service>
</chatbot-prompts>
```

#### Structured Response Generation
- Lead qualification data extraction
- Form field auto-population
- Contact preference capture
- Project categorization
- Urgency level assessment

#### Integration Features
- Service knowledge from XML
- Availability awareness from calendar
- Pricing guidance (if configured)
- Accreditation references
- Local area knowledge

### 5. Calendar Booking System

#### Multi-Provider Support
- Google Calendar API integration
- Microsoft Outlook/Office 365 integration
- XML-configurable provider selection
- Fallback booking form for API failures

#### Availability Management
- Real-time free/busy status
- Configurable working hours
- Service-specific time slots
- Buffer times between appointments
- Recurring availability patterns

#### Booking Types
- Initial consultations (30-60 minutes)
- Site surveys (1-2 hours)
- Quote presentations (30 minutes)
- Emergency callouts (immediate/priority)
- Follow-up meetings (30 minutes)

#### Confirmation System
- Automatic calendar event creation
- Email confirmations to customer and builder
- SMS notifications (optional)
- Calendar invites with project details
- Preparation instructions and requirements

#### Admin Features
- Booking dashboard
- Customer information management
- Appointment rescheduling
- Cancellation handling
- Reporting and analytics

### 6. Mobile Responsiveness

#### Responsive Design
- Mobile-first CSS approach
- Touch-friendly navigation
- Optimized image sizes
- Fast loading on mobile networks

#### Mobile-Specific Features
- Tap-to-call phone numbers
- One-tap email and messaging
- GPS integration for directions
- Mobile-optimized chat interface
- Swipe gestures in gallery

### 7. SEO & Performance

#### SEO Features
- XML-driven meta tags and descriptions
- Structured data markup (Local Business schema)
- Sitemap generation
- Open Graph tags for social sharing
- Analytics integration (Google Analytics/Tag Manager)

#### Performance Optimization
- Image lazy loading and optimization
- CSS and JavaScript minification
- Caching strategies
- CDN integration options
- Core Web Vitals optimization

## Implementation Stages

### Stage 1: Core Foundation
- HTML structure for all pages
- Basic CSS styling and responsive framework
- XML parser and configuration loader
- Static content rendering from XML
- Navigation and basic interactions

### Stage 2: Gallery & Visual Features
- Instagram API integration
- Image gallery with categories
- Responsive layouts and lightbox
- Project showcase components
- Visual branding implementation

### Stage 3: ChatGPT Integration
- ChatGPT API integration
- Conversation flow management
- XML-driven system prompts
- Structured response handling
- Form auto-population

### Stage 4: Calendar & Booking
- Calendar API integrations
- Availability display
- Booking form and confirmation
- Email notification system
- Admin booking management

## Success Metrics
- Professional appearance and user experience
- Fast loading times (< 3 seconds)
- Mobile usability score > 95
- SEO score > 90
- Chat engagement rate
- Booking conversion rate
- Customer satisfaction scores

## Maintenance & Updates
- XML configuration allows non-technical updates
- Regular API integration testing
- Certificate expiry monitoring
- Performance monitoring
- Security updates and patches