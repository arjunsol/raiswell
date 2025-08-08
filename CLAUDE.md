# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a professional website for Colin's Building Services - a static HTML/CSS/JavaScript website with XML-driven configuration. The site features a data-driven architecture where all content, branding, and features are controlled through a single XML configuration file.

## Development Commands

### Building the Configuration (Required for Performance)
```bash
python build-config.py
```
Or alternatively:
```bash
build.bat
```
This compiles the XML configuration to optimized JavaScript for ~100-400ms faster page loads.

### Build Options
```bash
build.bat --dev      # Development mode with debug info
build.bat --watch    # Auto-rebuild on XML changes (requires: pip install watchdog)
```

### Starting the Development Server
```bash
python server.py
```
Or alternatively:
```bash
run-server.bat
```
The server runs on port 80 and opens automatically in the browser at `http://localhost:80`.

### Alternative Servers
If Python server fails:
```bash
npx http-server . -p 8000 -c-1
```

## Architecture Overview

### XML-Driven Configuration System
The entire site is controlled through `config/site-config.xml` which contains:
- Company information and branding
- Service definitions with pricing
- Feature toggles for all components
- UI color schemes and typography
- ChatGPT prompts and calendar settings
- SEO metadata and analytics IDs
- Page-specific content (hero sections, process steps, form configurations)
- Business policies (response times, insurance details, service areas)

### Performance Optimization System
**XML Compilation**: The build system (`build-config.py`) compiles the XML configuration into optimized JavaScript:
- Eliminates runtime XML parsing (~50-200ms improvement)
- Pre-compiles HTML templates for dynamic content
- Extracts and inlines CSS custom properties
- Optimizes feature toggle lookups
- Provides fallback to XML loading for development

### Feature Toggle System
All features can be enabled/disabled via XML configuration in the `<feature-toggles>` section. The feature manager (`js/feature-manager.js`) reads these toggles and conditionally initializes components.

Core toggleable features include:
- Interactive components (chatbot, calendar booking, modals)
- Page sections (hero, services, testimonials, gallery)
- UI elements (mobile menu, theme switcher, social links)
- Analytics and tracking features

### File Structure
- **HTML Pages**: Static pages that get populated with XML data
- **CSS**: Modular stylesheets (main.css, responsive.css, themes.css, etc.)
- **JavaScript**: Component-based architecture with XML integration
  - `xml-parser.js` - Loads and parses site configuration
  - `feature-manager.js` - Handles feature toggles
  - `main.js` - Core site initialization and management
  - Component-specific JS files (chatbot.js, calendar.js, etc.)
- **Images**: Organized by purpose (hero/, gallery/, services/, accreditation/)

### Branding and Theming
CSS custom properties are dynamically set from XML configuration, allowing complete visual customization without code changes. The branding section in XML controls colors, fonts, and other visual elements.

## Development Workflow

### Making Content Changes
Edit `config/site-config.xml` - no code changes required for:
- Company details and contact information
- Service descriptions and pricing
- Testimonials and project showcases
- Color schemes and fonts
- Feature enabling/disabling

### Adding New Features
1. Add feature toggle to XML configuration
2. Check feature state in component initialization
3. Implement graceful degradation for disabled features
4. Update feature manager if needed

### Testing Feature Toggles
- Use `feature-toggle-demo.html` for interactive testing
- Add `?dev=true` to any page URL for development panel
- Test with various feature combinations

## Error Handling
The site includes comprehensive fallback systems:
- If XML loading fails, hardcoded fallback data is used
- Feature toggles gracefully disable components
- CORS issues are handled by the Python server
- Components check for dependencies before initializing

## Performance Considerations
- Images use lazy loading
- CSS/JS loading is optimized for critical path
- Feature toggles allow disabling expensive components (analytics, Instagram integration)
- XML parsing is cached client-side

## Important Files to Understand
- `config/site-config.xml` - Master configuration controlling everything
- `js/xml-parser.js` - Core XML loading and parsing logic
- `js/feature-manager.js` - Feature toggle implementation
- `js/main.js` - Site initialization orchestration
- `server.py` - Development server with CORS headers