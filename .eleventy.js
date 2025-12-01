/**
 * Eleventy Configuration for Raiswell Building Services
 *
 * This config sets up 11ty to compile Nunjucks templates into static HTML,
 * ensuring component consistency across all pages.
 */

module.exports = function(eleventyConfig) {
    // Pass through static assets (don't process these)
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/images");
    eleventyConfig.addPassthroughCopy("src/config");
    eleventyConfig.addPassthroughCopy("src/fonts");

    // Copy Azure Static Web Apps config to output root
    eleventyConfig.addPassthroughCopy({ "staticwebapp.config.json": "staticwebapp.config.json" });

    // Watch for changes in these directories
    eleventyConfig.addWatchTarget("src/css/");
    eleventyConfig.addWatchTarget("src/js/");
    eleventyConfig.addWatchTarget("src/config/");

    // Custom filter for current year
    eleventyConfig.addFilter("year", () => {
        return new Date().getFullYear();
    });

    // Custom filter for phone formatting
    eleventyConfig.addFilter("phoneFormat", (phone) => {
        return phone.replace(/(\+44)(\d{4})(\d{6})/, '$1 $2 $3');
    });

    // Shortcode for SVG icons
    eleventyConfig.addShortcode("icon", function(name, width = 16, height = 16) {
        const icons = {
            phone: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
            email: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
            chevronLeft: `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
            chevronRight: `<svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`
        };
        return icons[name] || '';
    });

    // Configure input/output directories
    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            layouts: "_layouts",
            data: "_data"
        },
        templateFormats: ["njk", "html", "md"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk"
    };
};
