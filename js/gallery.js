/**
 * Gallery System for Colin's Professional Building Services
 * Stage 2: Gallery Management and Instagram Integration
 */

class GalleryManager {
    constructor() {
        this.galleryData = null;
        this.instagramData = null;
        this.currentLightboxIndex = 0;
        this.filteredItems = [];
        this.init();
    }

    /**
     * Initialize gallery system
     */
    async init() {
        try {
            // Check if gallery features are enabled
            const fm = window.featureManager;
            if (fm && !fm.isEnabled('gallery-section')) {
                console.log('Gallery feature disabled - skipping initialization');
                return;
            }
            
            // Load gallery configuration from XML
            await this.loadGalleryConfig();
            
            // Populate gallery items (if enabled)
            if (!fm || fm.isEnabled('gallery-page.image-gallery')) {
                this.populateGallery();
            }
            
            // Initialize Instagram feed (if enabled)
            if (!fm || fm.isEnabled('gallery-page.instagram-feed')) {
                this.initInstagramFeed();
            }
            
            // Setup filtering (if enabled)
            if (!fm || fm.isEnabled('gallery-page.category-filter')) {
                this.setupFiltering();
            }
            
            // Setup lightbox
            this.setupLightbox();
            
            // Load Instagram posts (simulated for demo)
            this.loadInstagramPosts();
            
        } catch (error) {
            console.error('Gallery initialization failed:', error);
            this.showGalleryError();
        }
    }

    /**
     * Load gallery configuration from XML
     */
    async loadGalleryConfig() {
        try {
            const xmlParser = window.xmlParser;
            if (xmlParser && xmlParser.config) {
                this.galleryData = xmlParser.config.gallery;
                console.log('Gallery config loaded:', this.galleryData);
            } else {
                // Fallback gallery data
                this.galleryData = this.getFallbackGalleryData();
            }
        } catch (error) {
            console.error('Failed to load gallery config:', error);
            this.galleryData = this.getFallbackGalleryData();
        }
    }

    /**
     * Fallback gallery data
     */
    getFallbackGalleryData() {
        return {
            "instagram-handle": "colinbuilds",
            categories: {
                extensions: "Extensions",
                kitchens: "Kitchens", 
                bathrooms: "Bathrooms",
                general: "General Work",
                "before-after": "Before & After"
            },
            "featured-projects": [
                {
                    id: "modern-extension-1",
                    title: "Modern Two-Storey Extension",
                    description: "Contemporary glass and steel extension adding 40sqm of living space",
                    category: "extensions",
                    location: "Beckenham, Kent",
                    duration: "8 weeks",
                    year: "2024",
                    images: [
                        "images/gallery/ext-modern-1.jpg",
                        "images/gallery/ext-modern-2.jpg",
                        "images/gallery/ext-modern-3.jpg"
                    ],
                    thumbnail: "images/services/extension-placeholder.svg"
                },
                {
                    id: "contemporary-kitchen",
                    title: "Contemporary Kitchen Renovation",
                    description: "Complete kitchen transformation with island and premium appliances",
                    category: "kitchens",
                    location: "Orpington, Kent",
                    duration: "3 weeks",
                    year: "2024",
                    images: [
                        "images/gallery/kitchen-modern-1.jpg",
                        "images/gallery/kitchen-modern-2.jpg"
                    ],
                    thumbnail: "images/services/kitchen-placeholder.svg"
                },
                {
                    id: "luxury-bathroom",
                    title: "Luxury Master Bathroom",
                    description: "High-end bathroom renovation with underfloor heating and rainfall shower",
                    category: "bathrooms",
                    location: "Bromley, Kent", 
                    duration: "2 weeks",
                    year: "2024",
                    images: [
                        "images/gallery/bathroom-luxury-1.jpg",
                        "images/gallery/bathroom-luxury-2.jpg"
                    ],
                    thumbnail: "images/services/bathroom-placeholder.svg"
                },
                {
                    id: "single-storey-ext",
                    title: "Single Storey Rear Extension",
                    description: "Open plan kitchen-dining extension with bi-fold doors to garden",
                    category: "extensions",
                    location: "Croydon, Surrey",
                    duration: "6 weeks", 
                    year: "2023",
                    images: [
                        "images/gallery/ext-single-1.jpg",
                        "images/gallery/ext-single-2.jpg"
                    ],
                    thumbnail: "images/services/extension-placeholder.svg"
                },
                {
                    id: "property-renovation",
                    title: "Whole House Renovation",
                    description: "Complete renovation including roof, electrics, plumbing and interior",
                    category: "general",
                    location: "Greenwich, London",
                    duration: "12 weeks",
                    year: "2023",
                    images: [
                        "images/gallery/renovation-1.jpg",
                        "images/gallery/renovation-2.jpg"
                    ],
                    thumbnail: "images/services/general-placeholder.svg"
                },
                {
                    id: "traditional-kitchen",
                    title: "Traditional Country Kitchen",
                    description: "Classic Shaker-style kitchen with farmhouse sink and butcher block counters",
                    category: "kitchens",
                    location: "Sidcup, Kent",
                    duration: "2 weeks",
                    year: "2023",
                    images: [
                        "images/gallery/kitchen-traditional-1.jpg",
                        "images/gallery/kitchen-traditional-2.jpg"
                    ],
                    thumbnail: "images/services/kitchen-placeholder.svg"
                }
            ]
        };
    }

    /**
     * Populate gallery with project items
     */
    populateGallery() {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (!galleryGrid || !this.galleryData) return;

        galleryGrid.innerHTML = '';

        this.galleryData['featured-projects'].forEach((project, index) => {
            const galleryItem = this.createGalleryItem(project, index);
            galleryGrid.appendChild(galleryItem);
        });

        this.filteredItems = [...this.galleryData['featured-projects']];
    }

    /**
     * Create individual gallery item
     */
    createGalleryItem(project, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-category', project.category);
        item.setAttribute('data-index', index);
        
        item.innerHTML = `
            <img src="${project.thumbnail}" alt="${project.title}" class="gallery-image" loading="lazy">
            <div class="gallery-overlay">
                <h3>${project.title}</h3>
                <p>${project.location} • ${project.year}</p>
                <button class="btn btn-primary btn-small gallery-view-btn" data-project-id="${project.id}">
                    View Details
                </button>
            </div>
        `;

        // Add click handler for lightbox
        item.addEventListener('click', () => {
            this.openLightbox(index);
        });

        return item;
    }

    /**
     * Setup gallery filtering
     */
    setupFiltering() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active button
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Filter gallery items
                const filter = btn.dataset.filter;
                this.filterGallery(filter);
            });
        });
    }

    /**
     * Filter gallery items
     */
    filterGallery(filter) {
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            const category = item.dataset.category;
            const shouldShow = filter === 'all' || category === filter;
            
            if (shouldShow) {
                item.classList.remove('filtered-out');
                item.classList.add('filtered-in');
                item.style.display = 'block';
            } else {
                item.classList.remove('filtered-in');
                item.classList.add('filtered-out');
                setTimeout(() => {
                    if (item.classList.contains('filtered-out')) {
                        item.style.display = 'none';
                    }
                }, 300);
            }
        });

        // Update filtered items for lightbox
        if (filter === 'all') {
            this.filteredItems = [...this.galleryData['featured-projects']];
        } else {
            this.filteredItems = this.galleryData['featured-projects'].filter(
                project => project.category === filter
            );
        }
    }

    /**
     * Setup lightbox functionality
     */
    setupLightbox() {
        // Create lightbox HTML if it doesn't exist
        if (!document.querySelector('.lightbox')) {
            this.createLightbox();
        }

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            const lightbox = document.querySelector('.lightbox');
            if (lightbox && lightbox.classList.contains('active')) {
                switch(e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        this.previousImage();
                        break;
                    case 'ArrowRight':
                        this.nextImage();
                        break;
                }
            }
        });
    }

    /**
     * Create lightbox HTML structure
     */
    createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <button class="lightbox-nav lightbox-prev">&#8249;</button>
                <button class="lightbox-nav lightbox-next">&#8250;</button>
                <img class="lightbox-image" src="" alt="">
                <div class="lightbox-info">
                    <h3 class="lightbox-title"></h3>
                    <p class="lightbox-description"></p>
                    <div class="project-details">
                        <div class="project-info">
                            <h4>Project Details</h4>
                            <p class="project-location"></p>
                            <p class="project-duration"></p>
                            <p class="project-year"></p>
                        </div>
                        <div class="project-specs">
                            <h4>Specifications</h4>
                            <div class="project-specs-content"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(lightbox);

        // Add event listeners
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
            this.closeLightbox();
        });

        lightbox.querySelector('.lightbox-prev').addEventListener('click', () => {
            this.previousImage();
        });

        lightbox.querySelector('.lightbox-next').addEventListener('click', () => {
            this.nextImage();
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                this.closeLightbox();
            }
        });
    }

    /**
     * Open lightbox with project details
     */
    openLightbox(index) {
        const project = this.filteredItems[index];
        if (!project) return;

        this.currentLightboxIndex = index;
        const lightbox = document.querySelector('.lightbox');
        
        // Update lightbox content
        this.updateLightboxContent(project);
        
        // Show lightbox
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Update lightbox content
     */
    updateLightboxContent(project) {
        const lightbox = document.querySelector('.lightbox');
        
        lightbox.querySelector('.lightbox-image').src = project.thumbnail;
        lightbox.querySelector('.lightbox-image').alt = project.title;
        lightbox.querySelector('.lightbox-title').textContent = project.title;
        lightbox.querySelector('.lightbox-description').textContent = project.description;
        lightbox.querySelector('.project-location').textContent = `Location: ${project.location}`;
        lightbox.querySelector('.project-duration').textContent = `Duration: ${project.duration}`;
        lightbox.querySelector('.project-year').textContent = `Completed: ${project.year}`;

        // Update specs (if available)
        const specsContent = lightbox.querySelector('.project-specs-content');
        specsContent.innerHTML = `
            <ul>
                <li><strong>Project Type:</strong> ${this.getCategoryName(project.category)}</li>
                <li><strong>Status:</strong> Completed</li>
                <li><strong>Client:</strong> Private Residence</li>
                <li><strong>Photos:</strong> ${project.images ? project.images.length : 1} images</li>
            </ul>
        `;
    }

    /**
     * Get category display name
     */
    getCategoryName(category) {
        const categoryMap = {
            extensions: 'Home Extension',
            kitchens: 'Kitchen Renovation',
            bathrooms: 'Bathroom Renovation',
            general: 'General Building Work'
        };
        return categoryMap[category] || category;
    }

    /**
     * Close lightbox
     */
    closeLightbox() {
        const lightbox = document.querySelector('.lightbox');
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Navigate to previous image
     */
    previousImage() {
        this.currentLightboxIndex = this.currentLightboxIndex > 0 
            ? this.currentLightboxIndex - 1 
            : this.filteredItems.length - 1;
        
        const project = this.filteredItems[this.currentLightboxIndex];
        this.updateLightboxContent(project);
    }

    /**
     * Navigate to next image
     */
    nextImage() {
        this.currentLightboxIndex = this.currentLightboxIndex < this.filteredItems.length - 1 
            ? this.currentLightboxIndex + 1 
            : 0;
        
        const project = this.filteredItems[this.currentLightboxIndex];
        this.updateLightboxContent(project);
    }

    /**
     * Initialize Instagram feed
     */
    initInstagramFeed() {
        const instagramSection = document.querySelector('.instagram-feed');
        if (!instagramSection) return;

        // Clear existing content
        instagramSection.innerHTML = `
            <div class="instagram-header">
                <h3>Latest from Instagram</h3>
                <p>Follow <strong>@${this.galleryData['instagram-handle']}</strong> for daily updates</p>
            </div>
            <div class="instagram-grid" id="instagram-grid">
                <div class="gallery-loading">Loading Instagram posts...</div>
            </div>
            <div class="instagram-cta">
                <a href="https://instagram.com/${this.galleryData['instagram-handle']}" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   class="btn btn-primary">
                    📸 Follow @${this.galleryData['instagram-handle']}
                </a>
            </div>
        `;
    }

    /**
     * Load Instagram posts (simulated for demo)
     */
    async loadInstagramPosts() {
        const instagramGrid = document.getElementById('instagram-grid');
        if (!instagramGrid) return;

        try {
            // Simulate loading delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create demo Instagram posts
            const demoPosts = this.createDemoInstagramPosts();
            
            instagramGrid.innerHTML = '';
            demoPosts.forEach(post => {
                const postElement = this.createInstagramPost(post);
                instagramGrid.appendChild(postElement);
            });

        } catch (error) {
            console.error('Failed to load Instagram posts:', error);
            instagramGrid.innerHTML = `
                <div class="gallery-error">
                    <h4>Instagram Feed Temporarily Unavailable</h4>
                    <p>Follow us directly on Instagram for the latest updates</p>
                </div>
            `;
        }
    }

    /**
     * Create demo Instagram posts
     */
    createDemoInstagramPosts() {
        return [
            {
                id: '1',
                image: 'images/services/extension-placeholder.svg',
                caption: 'Progress update on the Beckenham extension project! 🏠 #extension #progress',
                link: `https://instagram.com/p/demo1`
            },
            {
                id: '2', 
                image: 'images/services/kitchen-placeholder.svg',
                caption: 'Beautiful kitchen transformation complete! ✨ #kitchen #renovation',
                link: `https://instagram.com/p/demo2`
            },
            {
                id: '3',
                image: 'images/services/bathroom-placeholder.svg', 
                caption: 'Luxury bathroom installation in Orpington 🛁 #bathroom #luxury',
                link: `https://instagram.com/p/demo3`
            },
            {
                id: '4',
                image: 'images/services/general-placeholder.svg',
                caption: 'Team hard at work on another quality project 👷‍♂️ #building #craftsmanship',
                link: `https://instagram.com/p/demo4`
            },
            {
                id: '5',
                image: 'images/services/extension-placeholder.svg',
                caption: 'Before and after - amazing transformation! #beforeandafter #renovation',
                link: `https://instagram.com/p/demo5`
            },
            {
                id: '6',
                image: 'images/services/kitchen-placeholder.svg',
                caption: 'Another satisfied customer in Kent! 🎉 #satisfied #quality',
                link: `https://instagram.com/p/demo6`
            }
        ];
    }

    /**
     * Create Instagram post element
     */
    createInstagramPost(post) {
        const postElement = document.createElement('div');
        postElement.className = 'instagram-item';
        
        postElement.innerHTML = `
            <img src="${post.image}" alt="Instagram post" loading="lazy">
            <div class="instagram-overlay">
                <div class="instagram-icon">📷</div>
            </div>
        `;

        postElement.addEventListener('click', () => {
            window.open(post.link, '_blank', 'noopener,noreferrer');
        });

        return postElement;
    }

    /**
     * Show gallery error state
     */
    showGalleryError() {
        const galleryGrid = document.querySelector('.gallery-grid');
        if (galleryGrid) {
            galleryGrid.innerHTML = `
                <div class="gallery-error">
                    <h3>Unable to Load Gallery</h3>
                    <p>Please try refreshing the page. If the problem persists, contact us directly.</p>
                    <a href="contact.html" class="btn btn-primary">Contact Us</a>
                </div>
            `;
        }
    }

    /**
     * Refresh gallery data
     */
    async refresh() {
        await this.loadGalleryConfig();
        this.populateGallery();
        this.loadInstagramPosts();
    }
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for XML parser to load first
    setTimeout(() => {
        window.galleryManager = new GalleryManager();
    }, 500);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GalleryManager;
}