# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a professional website for Colin's Building Services - a static HTML/CSS/JavaScript website with XML-driven configuration. The site features a data-driven architecture where all content, branding, and features are controlled through a single XML configuration file.

## Development Commands

### Building the Configuration (Required for Performance)
```bash
python build-config.py
# Or use NPM scripts:
npm run build        # Standard build
npm run dev         # Development mode with debug info
npm run watch       # Auto-rebuild on XML changes (requires: pip install watchdog)
# Or Windows batch file:
build.bat
```
This compiles the XML configuration to optimized JavaScript (`js/compiled-config.js`) for ~100-400ms faster page loads.

### Starting the Development Server
```bash
python server.py
# Or use NPM:
npm start
# Or Windows batch file:
run-server.bat
```
The server runs on port 80 and opens automatically in the browser at `http://localhost:80`.

### Alternative Servers
If Python server fails:
```bash
npx http-server . -p 8000 -c-1
```

### Git Workflow
This project uses **Git Flow**. All changes must be made in feature branches:
```bash
git flow feature start feature-name    # Creates and switches to feature/feature-name
git flow feature finish feature-name   # Merges back to develop
```
**Never commit directly to develop or master branches.**

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

**Critical Initialization Chain**:
1. `js/compiled-config.js` loads first (if built) → creates `window.compiledConfig`
2. `js/xml-parser.js` loads → creates `window.siteConfig`, uses compiled config if available
3. `js/feature-manager.js` waits for config to be ready → applies feature toggles
4. Component scripts initialize conditionally based on feature flags

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

## Deployment

### Azure Static Web Apps
The site is configured for Azure deployment via `staticwebapp.config.json`:
- Routes are configured for SPA-like behavior
- Security headers (CSP, X-Frame-Options) are set
- MIME types for `.xml` and `.svg` files are properly configured
- Python 3.9 runtime is specified for API functions

### Build for Azure
```bash
npm run build:azure
# This is an alias for: python build-config.py
```
Ensure `js/compiled-config.js` is committed for production deployments to get optimal performance.

## Important Files to Understand
- `config/site-config.xml` - Master configuration controlling everything
- `build-config.py` - XML to JavaScript compiler with template pre-compilation
- `js/compiled-config.js` - Generated optimized configuration (git-tracked for production)
- `js/xml-parser.js` - Configuration loader with compiled fallback
- `js/feature-manager.js` - Feature toggle system with dev panel (`?dev=true`)
- `js/main.js` - Site initialization orchestration
- `server.py` - Development server with CORS headers
- `staticwebapp.config.json` - Azure Static Web App deployment configuration