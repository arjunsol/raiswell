# Site Redesign Implementation Plan
## KJS-Style Rebuild for Raiswell Building Services

**Branch:** `feature/site-redesign`
**Reference Site:** kjsloftsandextensions.co.uk
**Architecture:** XML-driven content externalization (preserved)

---

## Executive Summary

Complete site rebuild following the KJS Lofts & Extensions design pattern while maintaining our XML-driven architecture. The new design features a professional construction company aesthetic with light blue accent color, full-width hero sliders, masonry image galleries, and reusable testimonial components.

---

## 1. Design Specifications

### 1.1 Color Palette
```css
--color-primary: #212121;      /* Dark footer/text */
--color-secondary: #0fb6ee;    /* Accent blue - CTAs, links, highlights */
--color-background: #f7f7f7;   /* Page background */
--color-white: #ffffff;        /* Cards, header */
--color-text: #000000;         /* Body text */
--color-text-light: #ffffff;   /* Footer text */
```

### 1.2 Typography
```css
--font-heading: 'Montserrat', sans-serif;  /* 700 weight for headings */
--font-body: 'Open Sans', sans-serif;       /* 400/600 for body */
--font-size-base: 14px;
```

### 1.3 Breakpoints
```css
--breakpoint-desktop: 960px;
--breakpoint-tablet: 768px;
--breakpoint-mobile: 480px;
```

---

## 2. Global Components

### 2.1 Top Bar (NEW)
**Desktop:** Fixed bar above header
- Left: Phone icon + number, Email icon + address
- Right: Social icons (Twitter, Facebook, Instagram)

**Mobile:** Hidden or collapsed

**XML Config Addition:**
```xml
<top-bar>
    <enabled>true</enabled>
    <show-on-mobile>false</show-on-mobile>
</top-bar>
```

### 2.2 Header
**Desktop:**
- White background
- Logo (left) - max-width 350px
- Navigation (right) - horizontal menu
- Sticky on scroll

**Mobile (< 960px):**
- Logo centered or left
- Hamburger menu toggle with "Menu" text
- Full-screen slide-out menu

**Navigation Items:**
1. Home
2. About
3. Services (replaces separate Loft/Extensions pages)
4. Portfolio/Gallery
5. Testimonials
6. Contact

### 2.3 Footer
**Structure:** Dark background (#212121), 4-column grid

| Column 1 | Column 2 | Column 3 | Column 4 |
|----------|----------|----------|----------|
| Contact Us | Company Name + Address | Quick Links | Follow Us |
| Phone, Email, Form link | Full address | Service links | Large social icons |

**Mobile:** Stack to single column, centered text

### 2.4 Page Header (Inner Pages)
- Light gray background
- Page title (accent color)
- Breadcrumb navigation (Home > Current Page)
- Padding: 40px top

---

## 3. Page Structures

### 3.1 Homepage (index.html)

```
┌─────────────────────────────────────────┐
│           TOP BAR                       │
├─────────────────────────────────────────┤
│           HEADER + NAV                  │
├─────────────────────────────────────────┤
│                                         │
│     HERO IMAGE SLIDER (Full-width)      │
│     - Auto-rotating images              │
│     - No text overlay (images only)     │
│     - Height: ~600-900px desktop        │
│                                         │
├─────────────────────────────────────────┤
│  WELCOME SECTION (White bg)             │
│  ┌──────────────────┬─────────────┐     │
│  │  Welcome Text    │  Company    │     │
│  │  (8 columns)     │  Badge/Logo │     │
│  │                  │  (4 columns)│     │
│  │  H1 + paragraphs │  [Image]    │     │
│  └──────────────────┴─────────────┘     │
├─────────────────────────────────────────┤
│  SERVICES PREVIEW (Optional)            │
│  - 3-4 service cards with images        │
│  - Link to full services page           │
├─────────────────────────────────────────┤
│  TESTIMONIALS SLIDER (Dark skin)        │
│  - Centered quotes                      │
│  - Author name below                    │
│  - Dot navigation                       │
├─────────────────────────────────────────┤
│           FOOTER                        │
└─────────────────────────────────────────┘
```

**Mobile Adaptations:**
- Hero slider: reduced height (300-400px)
- Welcome section: stack to single column (text above badge)
- Services: 1 column cards

### 3.2 About Page (about.html)

```
┌─────────────────────────────────────────┐
│  PAGE HEADER: "About Us" + Breadcrumb   │
├─────────────────────────────────────────┤
│  CONTENT SECTION                        │
│  ┌──────────────────┬─────────────┐     │
│  │  About Text      │  Image      │     │
│  │  (8 columns)     │  Slider     │     │
│  │                  │  (4 columns)│     │
│  │  Who we are      │  [Gallery]  │     │
│  │  History         │             │     │
│  │  Values          │             │     │
│  │                  │             │     │
│  │  [Contact CTA]   │             │     │
│  └──────────────────┴─────────────┘     │
├─────────────────────────────────────────┤
│           FOOTER                        │
└─────────────────────────────────────────┘
```

### 3.3 Services Page (services.html)

```
┌─────────────────────────────────────────┐
│  PAGE HEADER: "Our Services"            │
├─────────────────────────────────────────┤
│  INTRO TEXT (Full width, centered)      │
├─────────────────────────────────────────┤
│  SERVICE SECTIONS (Alternating layout)  │
│                                         │
│  ┌─────────────┬───────────────────┐    │
│  │   IMAGE     │    Service 1      │    │
│  │             │    Description    │    │
│  └─────────────┴───────────────────┘    │
│                                         │
│  ┌───────────────────┬─────────────┐    │
│  │    Service 2      │   IMAGE     │    │
│  │    Description    │             │    │
│  └───────────────────┴─────────────┘    │
│                                         │
│  (Repeat for each service)              │
├─────────────────────────────────────────┤
│  IMAGE GALLERY (Masonry grid)           │
│  - 4 columns desktop                    │
│  - 2 columns tablet                     │
│  - 1 column mobile                      │
├─────────────────────────────────────────┤
│  TESTIMONIALS SLIDER                    │
├─────────────────────────────────────────┤
│           FOOTER                        │
└─────────────────────────────────────────┘
```

### 3.4 Portfolio/Gallery Page (gallery.html)

```
┌─────────────────────────────────────────┐
│  PAGE HEADER: "Portfolio"               │
├─────────────────────────────────────────┤
│  MASONRY IMAGE GRID (Full-width)        │
│  ┌─────┬─────┬─────┬─────┐              │
│  │     │     │     │     │              │
│  ├─────┼─────┼─────┼─────┤              │
│  │     │     │     │     │              │
│  ├─────┼─────┼─────┼─────┤              │
│  │     │     │     │     │              │
│  └─────┴─────┴─────┴─────┘              │
│  - No gaps between images               │
│  - Lightbox on click                    │
│  - Category filter (optional)           │
├─────────────────────────────────────────┤
│           FOOTER                        │
└─────────────────────────────────────────┘
```

### 3.5 Testimonials Page (testimonials.html)

```
┌─────────────────────────────────────────┐
│  PAGE HEADER: "Testimonials"            │
├─────────────────────────────────────────┤
│  TESTIMONIAL CARDS (3-column masonry)   │
│  ┌─────────┬─────────┬─────────┐        │
│  │  Quote  │  Quote  │  Quote  │        │
│  │  ───    │  ───    │  ───    │        │
│  │  Author │  Author │  Author │        │
│  │  Place  │  Place  │  Place  │        │
│  └─────────┴─────────┴─────────┘        │
│                                         │
│  Card Design:                           │
│  - White background                     │
│  - Speech bubble caret pointing down    │
│  - Quote text                           │
│  - Author name (bold)                   │
│  - Location (accent color)              │
├─────────────────────────────────────────┤
│           FOOTER                        │
└─────────────────────────────────────────┘
```

### 3.6 Contact Page (contact.html)

```
┌─────────────────────────────────────────┐
│  PAGE HEADER: "Contact Us"              │
├─────────────────────────────────────────┤
│  GOOGLE MAP (Full-width embed)          │
│  Height: 450px                          │
├─────────────────────────────────────────┤
│  CONTACT SECTION                        │
│  ┌──────────────────┬─────────────┐     │
│  │  CONTACT FORM    │  DETAILS    │     │
│  │  (8 columns)     │  (4 columns)│     │
│  │                  │             │     │
│  │  - Name          │  Office:    │     │
│  │  - Email         │  Address    │     │
│  │  - Phone         │             │     │
│  │  - Message       │  Phone:     │     │
│  │  - Submit        │  Number     │     │
│  │                  │             │     │
│  │                  │  Email:     │     │
│  │                  │  Address    │     │
│  └──────────────────┴─────────────┘     │
├─────────────────────────────────────────┤
│  TESTIMONIALS SLIDER                    │
├─────────────────────────────────────────┤
│           FOOTER                        │
└─────────────────────────────────────────┘
```

### 3.7 Booking Page (booking.html) - KEEP EXISTING
Maintain current booking functionality with updated styling to match new theme.

---

## 4. XML Configuration Updates

### 4.1 New Sections to Add

```xml
<!-- Add to site-config.xml -->

<design>
    <theme>kjs-style</theme>
    <colors>
        <primary>#212121</primary>
        <secondary>#0fb6ee</secondary>
        <background>#f7f7f7</background>
        <text>#000000</text>
    </colors>
    <fonts>
        <heading>Montserrat</heading>
        <body>Open Sans</body>
    </fonts>
</design>

<top-bar>
    <enabled>true</enabled>
    <phone-icon>true</phone-icon>
    <email-icon>true</email-icon>
    <social-position>right</social-position>
    <show-on-mobile>false</show-on-mobile>
</top-bar>

<hero-slider>
    <enabled>true</enabled>
    <auto-play>true</auto-play>
    <interval>5000</interval>
    <height-desktop>900px</height-desktop>
    <height-mobile>400px</height-mobile>
    <slides>
        <slide>
            <image>images/hero/slide-1.jpg</image>
            <alt>Project showcase 1</alt>
        </slide>
        <slide>
            <image>images/hero/slide-2.jpg</image>
            <alt>Project showcase 2</alt>
        </slide>
        <!-- Add more slides -->
    </slides>
</hero-slider>

<pages>
    <page name="index">
        <hero-type>slider</hero-type>
        <sections>
            <section type="welcome" enabled="true" />
            <section type="services-preview" enabled="true" />
            <section type="testimonials-slider" enabled="true" />
        </sections>
    </page>

    <page name="about">
        <layout>two-column</layout>
        <content-width>8</content-width>
        <sidebar-width>4</sidebar-width>
        <sidebar-type>image-slider</sidebar-type>
    </page>

    <!-- Update other pages similarly -->
</pages>
```

---

## 5. File Structure (New/Modified)

```
raiswell/
├── index.html              [REBUILD]
├── about.html              [NEW]
├── services.html           [REBUILD]
├── gallery.html            [REBUILD - was portfolio]
├── testimonials.html       [NEW]
├── contact.html            [REBUILD]
├── booking.html            [UPDATE STYLING]
│
├── css/
│   ├── main.css            [REBUILD]
│   ├── responsive.css      [REBUILD]
│   ├── components/
│   │   ├── top-bar.css     [NEW]
│   │   ├── header.css      [NEW]
│   │   ├── hero-slider.css [NEW]
│   │   ├── page-header.css [NEW]
│   │   ├── testimonials.css[NEW]
│   │   ├── masonry-grid.css[NEW]
│   │   ├── footer.css      [NEW]
│   │   └── cards.css       [NEW]
│   └── themes.css          [UPDATE]
│
├── js/
│   ├── main.js             [UPDATE]
│   ├── hero-slider.js      [NEW]
│   ├── masonry-grid.js     [NEW]
│   ├── testimonials-slider.js [NEW]
│   ├── mobile-menu.js      [NEW]
│   └── xml-parser.js       [UPDATE]
│
├── config/
│   └── site-config.xml     [UPDATE]
│
└── images/
    ├── hero/               [ADD SLIDER IMAGES]
    ├── gallery/            [ORGANIZE BY CATEGORY]
    ├── about/              [NEW - ABOUT PAGE IMAGES]
    └── services/           [SERVICE IMAGES]
```

---

## 6. Component Specifications

### 6.1 Hero Slider Component

```html
<section class="hero-slider">
    <div class="slider-container">
        <div class="slides">
            <div class="slide active" style="background-image: url('...')"></div>
            <div class="slide" style="background-image: url('...')"></div>
        </div>
        <div class="slider-nav">
            <button class="prev"></button>
            <button class="next"></button>
        </div>
        <div class="slider-dots"></div>
    </div>
</section>
```

**CSS Requirements:**
- Full viewport width
- Configurable height (900px desktop, 400px mobile)
- Smooth crossfade transitions
- Touch swipe support for mobile

### 6.2 Testimonials Slider Component

```html
<section class="testimonials-slider dark-skin">
    <div class="container">
        <h3>What our clients say</h3>
        <div class="slider">
            <div class="testimonial-slide">
                <blockquote>"Quote text..."</blockquote>
                <cite>Author Name</cite>
            </div>
        </div>
        <div class="slider-dots"></div>
    </div>
</section>
```

**Reusable on:** Homepage, Services, Contact pages

### 6.3 Masonry Grid Component

```html
<div class="masonry-grid cols-4">
    <div class="grid-item">
        <img src="..." alt="..." loading="lazy">
    </div>
    <!-- More items -->
</div>
```

**Responsive columns:**
- Desktop: 4 columns
- Tablet: 2 columns
- Mobile: 1 column

### 6.4 Page Header Component

```html
<header class="page-header">
    <div class="container">
        <h1 class="page-title">Page Title</h1>
        <nav class="breadcrumbs">
            <a href="/">Home</a> &raquo; <span>Current Page</span>
        </nav>
    </div>
</header>
```

### 6.5 Mobile Menu Component

```html
<div class="mobile-menu-toggle">
    <button class="menu-btn">
        <span class="icon">&#9776;</span>
        <span class="text">Menu</span>
    </button>
</div>

<nav class="mobile-menu">
    <div class="menu-header">
        <button class="close-btn">&times;</button>
    </div>
    <ul class="menu-items">
        <!-- Populated from XML -->
    </ul>
</nav>
```

---

## 7. Implementation Phases

### Phase 1: Foundation (CSS Framework + Global Components)
1. Create new CSS architecture with component files
2. Implement color variables and typography
3. Build Top Bar component
4. Build Header component (desktop + mobile)
5. Build Footer component
6. Build Page Header component

### Phase 2: Homepage
1. Build Hero Slider component
2. Create Welcome section layout
3. Implement Testimonials Slider
4. Update XML configuration for homepage

### Phase 3: Inner Pages
1. Build About page
2. Build Services page with alternating layout
3. Build Testimonials page with card grid
4. Build Contact page with map + form

### Phase 4: Gallery System
1. Build Masonry Grid component
2. Implement Lightbox functionality
3. Build Gallery/Portfolio page
4. Add category filtering (optional)

### Phase 5: Integration & Polish
1. Update XML parser for new config structure
2. Connect all dynamic content to XML
3. Responsive testing across devices
4. Performance optimization
5. Cross-browser testing

---

## 8. Mobile Considerations

### 8.1 Breakpoint Behavior

| Component | Desktop (>960px) | Tablet (768-959px) | Mobile (<768px) |
|-----------|------------------|--------------------| ----------------|
| Top Bar | Visible | Visible | Hidden |
| Navigation | Horizontal | Horizontal | Hamburger menu |
| Hero Slider | 900px height | 600px height | 400px height |
| Welcome | 2 columns (8/4) | 2 columns (6/6) | 1 column stacked |
| Services | Alternating | Alternating | Stacked |
| Gallery Grid | 4 columns | 2 columns | 1 column |
| Testimonials | 3 columns | 2 columns | 1 column |
| Contact Form | 2 columns (8/4) | 1 column | 1 column |
| Footer | 4 columns | 2 columns | 1 column |

### 8.2 Touch Interactions
- Hero slider: swipe left/right
- Gallery: tap to open lightbox, swipe in lightbox
- Mobile menu: swipe from edge to open (optional)

### 8.3 Performance
- Lazy load images below fold
- Responsive images with srcset
- Minimize JS on mobile
- Touch-optimized tap targets (min 44px)

---

## 9. Preserved Features from Current Site

- XML-driven content externalization
- Feature toggle system
- Chatbot integration
- Calendar booking functionality
- Theme switcher (updated styling)
- Form validation
- Contact form submission

---

## 10. Removed/Deprecated

- Current hero section with text overlay (replaced by image slider)
- Why Choose Us section on homepage (moved to About or removed)
- Accreditations section as separate block (integrate into footer or about)
- Current card-heavy design

---

## 11. Image Requirements

### Hero Slider Images
- **Dimensions:** 1920x1080px minimum (landscape)
- **Format:** JPG, optimized for web
- **Quantity:** 5-8 images minimum
- **Content:** Completed project photos, exterior shots

### Gallery Images
- **Dimensions:** 600x500px (can be larger, will be cropped)
- **Format:** JPG
- **Naming:** `project-name-01.jpg`, `project-name-02.jpg`

### About Page Slider
- **Dimensions:** 500x600px (portrait orientation)
- **Quantity:** 4-6 images
- **Content:** Team, work in progress, completed projects

---

## 12. Testing Checklist

- [ ] All pages render correctly on Chrome, Firefox, Safari, Edge
- [ ] Mobile menu functions on iOS and Android
- [ ] Hero slider auto-plays and responds to controls
- [ ] Touch gestures work on mobile devices
- [ ] Forms submit correctly
- [ ] XML content loads and displays
- [ ] Images lazy load properly
- [ ] Page speed score > 80 on mobile
- [ ] Accessibility: keyboard navigation, screen reader compatibility
- [ ] All links work correctly
- [ ] 404 page styled appropriately

---

## Appendix: Quick Reference

### CSS Class Naming Convention
```
.component-name
.component-name__element
.component-name--modifier
```

### XML Content Binding
```html
<element data-xml="path.to.content">Fallback</element>
```

### Accent Color Usage
- Links (default and hover)
- Button backgrounds
- Page titles
- Social icons
- Testimonial author location
- Active navigation state
