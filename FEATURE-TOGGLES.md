# Feature Toggle System

## Overview

The Colin's Building Services website includes a comprehensive feature toggle system that allows you to enable/disable specific features and components through XML configuration. This provides flexibility for customization, testing, and gradual feature rollouts.

## How It Works

### 1. XML Configuration

Feature toggles are configured in `config/site-config.xml` under the `<feature-toggles>` section:

```xml
<feature-toggles>
    <!-- Core Page Components -->
    <hero-section enabled="true" />
    <services-section enabled="true" />
    <testimonials-section enabled="true" />
    <chatbot enabled="true" />
    
    <!-- Page-Specific Features -->
    <services-page>
        <service-cards enabled="true" />
        <pricing-display enabled="true" />
    </services-page>
</feature-toggles>
```

### 2. JavaScript Integration

The feature manager (`js/feature-manager.js`) handles:
- Loading feature toggles from XML
- Applying toggles to page elements
- Providing API for checking feature states
- Graceful fallbacks when XML isn't available

### 3. Component Integration

Individual components check their feature flags before initializing:

```javascript
// Example from chatbot.js
if (window.featureManager && !window.featureManager.isEnabled('chatbot')) {
    console.log('Chatbot feature disabled - skipping initialization');
    return;
}
```

## Available Feature Toggles

### Core Page Components
- `hero-section` - Main hero section on homepage
- `services-section` - Services overview section
- `testimonials-section` - Customer testimonials
- `why-choose-us-section` - Why choose us section
- `accreditations-section` - Certifications and accreditations
- `gallery-section` - Photo gallery section
- `contact-section` - Contact information section

### Interactive Features
- `chatbot` - AI-powered customer chatbot
- `calendar-booking` - Interactive booking calendar
- `quick-quote-modal` - Quick quote request modal
- `theme-switcher` - Theme selection dropdown
- `instagram-integration` - Instagram feed integration

### Advanced Features
- `analytics-tracking` - Google Analytics tracking
- `booking-analytics` - Booking conversion tracking
- `automated-workflows` - Automated follow-up systems
- `emergency-booking` - Emergency booking functionality

### Page-Specific Features

#### Services Page (`services-page`)
- `service-cards` - Individual service cards
- `pricing-display` - Price ranges on services
- `duration-display` - Project duration information
- `service-icons` - Service category icons

#### Gallery Page (`gallery-page`)
- `image-gallery` - Main image gallery grid
- `category-filter` - Filter buttons for categories
- `lightbox-viewer` - Full-screen image viewer
- `instagram-feed` - Instagram photos section

#### Booking Page (`booking-page`)
- `consultation-types` - Consultation type selection
- `calendar-widget` - Interactive calendar
- `time-slot-selector` - Available time slots
- `appointment-booking` - Booking form system
- `emergency-section` - Emergency booking section

#### Contact Page (`contact-page`)
- `contact-form` - Contact form
- `business-hours` - Operating hours display
- `location-map` - Location/address information
- `emergency-contact` - Emergency contact details

### UI Components

#### Navigation (`navigation`)
- `mobile-menu` - Mobile hamburger menu
- `theme-dropdown` - Theme selection in header
- `active-page-highlighting` - Current page highlighting

#### Footer (`footer`)
- `social-links` - Social media links
- `quick-links` - Footer navigation links
- `contact-info` - Footer contact information
- `copyright` - Copyright notice

## Usage Examples

### 1. Disable Chatbot
```xml
<chatbot enabled="false" />
```

### 2. Hide Pricing on Services
```xml
<services-page>
    <pricing-display enabled="false" />
</services-page>
```

### 3. Disable Instagram Integration
```xml
<instagram-integration enabled="false" />
<gallery-page>
    <instagram-feed enabled="false" />
</gallery-page>
```

### 4. Minimal Configuration (Basic Website)
```xml
<feature-toggles>
    <!-- Enable only essential features -->
    <hero-section enabled="true" />
    <services-section enabled="true" />
    <contact-section enabled="true" />
    
    <!-- Disable advanced features -->
    <chatbot enabled="false" />
    <calendar-booking enabled="false" />
    <instagram-integration enabled="false" />
    <analytics-tracking enabled="false" />
    
    <!-- Keep basic UI -->
    <navigation>
        <mobile-menu enabled="true" />
        <theme-dropdown enabled="false" />
    </navigation>
</feature-toggles>
```

## Development Tools

### Development Panel
Add `?dev=true` to any page URL to see the feature toggle development panel:
```
http://localhost:8000/index.html?dev=true
```

The dev panel allows you to:
- See current feature states
- Toggle features on/off in real-time
- Reset all toggles
- Test different configurations

### Demo Page
Visit `feature-toggle-demo.html` for an interactive demonstration of the toggle system with a visual control panel.

## API Reference

### FeatureManager Class

#### Methods
- `isEnabled(featurePath)` - Check if a feature is enabled
- `toggleElement(element, featurePath)` - Show/hide element based on feature
- `toggleElements(elementFeatureMap)` - Toggle multiple elements
- `applyPageToggles()` - Apply all relevant toggles to current page

#### Usage
```javascript
// Check if feature is enabled
if (window.featureManager.isEnabled('chatbot')) {
    initializeChatbot();
}

// Toggle element visibility
window.featureManager.toggleElement('#my-element', 'my-feature');

// Toggle multiple elements
window.featureManager.toggleElements({
    '.chatbot-container': 'chatbot',
    '.calendar-widget': 'calendar-booking'
});
```

### XMLConfigParser Integration

#### Methods
- `isFeatureEnabled(featurePath)` - Check feature state from XML config

#### Usage
```javascript
// Check feature directly from XML parser
const xmlParser = window.xmlParser;
if (xmlParser.isFeatureEnabled('services-page.pricing-display')) {
    showPricing();
}
```

## Best Practices

### 1. Graceful Degradation
Always provide fallbacks when features are disabled:
```javascript
if (featureManager.isEnabled('analytics-tracking')) {
    initializeAnalytics();
} else {
    console.log('Analytics disabled - using basic tracking');
}
```

### 2. Feature Grouping
Group related features logically:
```xml
<!-- All booking-related features together -->
<booking-features>
    <calendar-widget enabled="true" />
    <time-slots enabled="true" />
    <confirmation-emails enabled="true" />
</booking-features>
```

### 3. Progressive Enhancement
Use toggles to enable advanced features while keeping core functionality:
```javascript
// Core functionality always works
initializeBasicForm();

// Enhanced features are optional
if (featureManager.isEnabled('form-validation-advanced')) {
    initializeAdvancedValidation();
}
```

### 4. Performance Optimization
Disable expensive features in development or for specific deployments:
```xml
<!-- Disable heavy features for demo environment -->
<analytics-tracking enabled="false" />
<instagram-integration enabled="false" />
<automated-workflows enabled="false" />
```

## Testing Scenarios

### Scenario 1: Basic Business Website
```xml
<!-- Essential features only -->
<hero-section enabled="true" />
<services-section enabled="true" />
<contact-section enabled="true" />
<chatbot enabled="false" />
<calendar-booking enabled="false" />
```

### Scenario 2: Full-Featured Platform
```xml
<!-- All features enabled -->
<chatbot enabled="true" />
<calendar-booking enabled="true" />
<instagram-integration enabled="true" />
<analytics-tracking enabled="true" />
<automated-workflows enabled="true" />
```

### Scenario 3: Mobile-Optimized
```xml
<!-- Streamlined for mobile -->
<gallery-page>
    <lightbox-viewer enabled="false" />
    <category-filter enabled="false" />
</gallery-page>
<navigation>
    <theme-dropdown enabled="false" />
</navigation>
```

## Troubleshooting

### Feature Not Toggling
1. Check XML syntax is valid
2. Verify feature path matches exactly
3. Ensure feature-manager.js is loaded before other scripts
4. Check browser console for JavaScript errors

### Fallback Not Working
1. Verify fallback configuration in `getFallbackConfig()`
2. Check that component has proper feature checking
3. Ensure graceful degradation is implemented

### Performance Issues
1. Disable expensive features like analytics
2. Reduce Instagram integration polling
3. Disable automated workflows in development

## Future Enhancements

- Server-side feature toggle management
- A/B testing integration
- User-specific feature toggles
- Feature usage analytics
- Automated feature rollout schedules