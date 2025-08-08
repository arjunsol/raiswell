# Colin's Professional Building Services Website

A professional, data-driven website for an independent builder with XML-based configuration, responsive design, and modern features.

## 🚀 Quick Start

### Option 1: Simple Python Server (Recommended)
1. Open Command Prompt or Terminal in this folder
2. Run the server:
   ```bash
   python server.py
   ```
3. Open your browser to: `http://localhost:8000`

### Option 2: Windows Batch File
1. Double-click `run-server.bat`
2. Your browser should open automatically

### Option 3: Node.js Server (if you have Node.js)
```bash
npx http-server . -p 8000 -c-1
```

## 🛠️ Features

### Stage 1: Core Foundation ✅
- **XML-Driven Configuration**: All content managed through `config/site-config.xml`
- **Responsive Design**: Mobile-first approach with modern CSS
- **Professional Landing Page**: Hero section, services, testimonials, contact
- **Services Page**: Detailed service descriptions with pricing
- **Dynamic Content**: All text, images, and branding from XML
- **SEO Optimized**: Meta tags, structured data, accessibility features

### Stage 2: Gallery & Instagram (Coming Soon)
- Instagram API integration
- Project gallery with categories
- Image lightbox and lazy loading

### Stage 3: ChatGPT Integration (Coming Soon)
- AI-powered chatbot
- Lead qualification
- Form auto-population

### Stage 4: Calendar Booking (Coming Soon)
- Google/Outlook calendar integration
- Online appointment booking
- Automated confirmations

## 📁 Project Structure

```
colin-website/
├── config/
│   └── site-config.xml     # Master configuration file
├── css/
│   ├── main.css           # Main styles
│   └── responsive.css     # Mobile responsiveness
├── js/
│   ├── xml-parser.js      # XML configuration loader
│   └── main.js           # Core functionality
├── images/
│   ├── hero/             # Landing page images
│   ├── gallery/          # Project photos
│   └── accreditation/    # Certification logos
├── index.html            # Landing page
├── services.html         # Services page
├── server.py            # Local development server
└── README.md            # This file
```

## ⚙️ Customization

### Editing Content
All website content is managed through the single `config/site-config.xml` file:

- **Company Information**: Name, tagline, contact details
- **Branding**: Colors, fonts, logo
- **Services**: Descriptions, pricing, images
- **Testimonials**: Customer reviews and ratings
- **Accreditations**: Certifications and validity dates
- **Gallery**: Instagram handle, project categories
- **SEO**: Meta tags, analytics IDs

### Changing Colors and Fonts
The XML file controls CSS custom properties:
```xml
<branding>
    <colors>
        <primary>#2C3E50</primary>
        <secondary>#E67E22</secondary>
        <accent>#3498DB</accent>
    </colors>
    <typography>
        <primary-font>Roboto, sans-serif</primary-font>
        <heading-font>Roboto Slab, serif</heading-font>
    </typography>
</branding>
```

### Adding Services
Add new services to the XML configuration:
```xml
<service id="new-service">
    <name>New Service</name>
    <description>Service description</description>
    <icon>🔧</icon>
    <duration>1-2 weeks</duration>
    <price-range>£1,000 - £5,000</price-range>
    <featured-image>images/gallery/new-service.jpg</featured-image>
</service>
```

## 🔧 Technical Details

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

### Performance Features
- CSS custom properties for theming
- Image lazy loading
- Intersection Observer for animations
- Minified and optimized code

### Security Features
- CORS headers configured
- Input validation on forms
- No external dependencies for core functionality

## 🚨 Troubleshooting

### "Failed to load site configuration" Error
This happens when opening HTML files directly in the browser. Solutions:

1. **Use the Python server** (recommended):
   ```bash
   python server.py
   ```

2. **Fallback mode**: The website will automatically use hardcoded data if XML loading fails

3. **Alternative servers**:
   - Node.js: `npx http-server . -p 8000`
   - PHP: `php -S localhost:8000`

### Images Not Loading
- Add your images to the appropriate folders (`images/hero/`, `images/gallery/`, etc.)
- Update the XML configuration with correct image paths
- Placeholder images are provided for development

### Mobile Menu Not Working
- Ensure JavaScript is enabled
- Check browser console for errors
- Try refreshing the page

## 📝 Development Notes

### Stage 1 Complete
- ✅ XML configuration system
- ✅ Responsive CSS framework
- ✅ JavaScript content loader
- ✅ Landing and services pages
- ✅ Error handling and fallbacks

### Next Stages
- **Stage 2**: Instagram gallery integration
- **Stage 3**: ChatGPT chatbot with form automation
- **Stage 4**: Calendar booking system

## 📞 Support

For technical issues or customization requests, refer to:
- `FEATURES.md` - Complete feature specification
- `config/site-config.xml` - Configuration reference
- Browser developer tools for debugging

---

**Version**: 1.0 (Stage 1 Complete)  
**Last Updated**: January 2025