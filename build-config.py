#!/usr/bin/env python3
"""
XML Configuration Compiler for Colin's Building Services Website
Compiles XML configuration to optimized JavaScript for improved performance

Usage:
    python build-config.py [--watch] [--dev]
    
Options:
    --watch     Watch for XML changes and auto-rebuild
    --dev       Development mode with source maps and debug info
"""

import xml.etree.ElementTree as ET
import json
import sys
import os
import time
import argparse
from pathlib import Path

# Optional watchdog import for file watching
try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False
    print("WARNING: watchdog not available - install with 'pip install watchdog' for --watch mode")

class ConfigCompiler:
    def __init__(self, source_path='config/site-config.xml', output_path='js/compiled-config.js', dev_mode=False):
        self.source_path = Path(source_path)
        self.output_path = Path(output_path)
        self.dev_mode = dev_mode
        
    def compile_xml_to_js(self):
        """Main compilation function"""
        try:
            print(f"Compiling {self.source_path} -> {self.output_path}")
            start_time = time.time()
            
            # Parse XML
            tree = ET.parse(self.source_path)
            root = tree.getroot()
            
            # Convert to JavaScript object
            config = self.xml_to_dict(root)
            
            # Generate optimized templates
            templates = self.generate_templates(config)
            
            # Generate CSS variables
            css_vars = self.extract_css_variables(config)
            
            # Generate feature toggle map
            feature_map = self.generate_feature_map(config)
            
            # Create JavaScript module
            js_content = self.generate_js_module(config, templates, css_vars, feature_map)
            
            # Write to file
            self.output_path.parent.mkdir(exist_ok=True)
            with open(self.output_path, 'w', encoding='utf-8') as f:
                f.write(js_content)
                
            compile_time = (time.time() - start_time) * 1000
            file_size = self.output_path.stat().st_size / 1024
            
            print(f"SUCCESS: Compilation successful!")
            print(f"   Time: {compile_time:.1f}ms")
            print(f"   Size: {file_size:.1f}KB")
            print(f"   Features: {len(feature_map)} toggles")
            print(f"   Templates: {len(templates)} pre-compiled")
            
            return True
            
        except ET.ParseError as e:
            print(f"ERROR: XML Parse Error: {e}")
            return False
        except Exception as e:
            print(f"ERROR: Compilation Error: {e}")
            if self.dev_mode:
                import traceback
                traceback.print_exc()
            return False
    
    def xml_to_dict(self, element):
        """Convert XML element to dictionary recursively"""
        result = {}
        
        # Handle attributes
        if element.attrib:
            result.update(element.attrib)
        
        # Handle text content
        if element.text and element.text.strip():
            if len(element) == 0:  # Leaf node
                return element.text.strip()
            else:
                result['_text'] = element.text.strip()
        
        # Handle children
        for child in element:
            child_data = self.xml_to_dict(child)
            
            # Handle multiple children with same tag
            if child.tag in result:
                if not isinstance(result[child.tag], list):
                    result[child.tag] = [result[child.tag]]
                result[child.tag].append(child_data)
            else:
                result[child.tag] = child_data
        
        return result
    
    def generate_templates(self, config):
        """Generate pre-compiled HTML templates"""
        templates = {}
        
        # Service card template
        if 'services' in config and 'service' in config['services']:
            services = config['services']['service']
            if not isinstance(services, list):
                services = [services]
            
            templates['service-card'] = []
            for service in services:
                template = f'''
                <div class="service-card" data-service="{service.get('id', '')}">
                    <div class="service-image" style="background-image: url('{service.get('featured-image', '')}')"></div>
                    <div class="card-header">
                        <div class="card-icon">{service.get('icon', '')}</div>
                        <h3 class="card-title">{service.get('name', '')}</h3>
                    </div>
                    <div class="card-content">
                        <p>{service.get('description', '')}</p>
                        <div class="service-meta">
                            <span class="duration">Duration: {service.get('duration', '')}</span>
                            <span class="price-range">From: {service.get('price-range', '')}</span>
                        </div>
                    </div>
                </div>
                '''.strip()
                templates['service-card'].append(template)
        
        # Testimonial template
        if 'testimonials' in config and 'testimonial' in config['testimonials']:
            testimonials = config['testimonials']['testimonial']
            if not isinstance(testimonials, list):
                testimonials = [testimonials]
            
            templates['testimonial'] = []
            for testimonial in testimonials:
                stars = '★' * int(testimonial.get('rating', 5))
                template = f'''
                <div class="testimonial-card">
                    <div class="testimonial-rating">
                        <span class="stars">{stars}</span>
                    </div>
                    <blockquote class="testimonial-text">"{testimonial.get('text', '')}"</blockquote>
                    <div class="testimonial-author">
                        <strong>{testimonial.get('name', '')}</strong>
                        <div class="testimonial-location">{testimonial.get('location', '')}</div>
                        <div class="testimonial-project">{testimonial.get('project-type', '')}</div>
                    </div>
                </div>
                '''.strip()
                templates['testimonial'].append(template)
        
        # Accreditation template
        if 'accreditations' in config and 'certification' in config['accreditations']:
            certifications = config['accreditations']['certification']
            if not isinstance(certifications, list):
                certifications = [certifications]
            
            templates['accreditation'] = []
            for cert in certifications:
                template = f'''
                <div class="accreditation-item" data-cert="{cert.get('id', '')}">
                    <img src="{cert.get('logo', '')}" alt="{cert.get('name', '')}" class="accreditation-logo">
                    <div class="accreditation-name">{cert.get('name', '')}</div>
                    <div class="accreditation-number">No: {cert.get('number', '')}</div>
                    <div class="accreditation-validity">Valid until: {cert.get('valid-until', '')}</div>
                </div>
                '''.strip()
                templates['accreditation'].append(template)
        
        return templates
    
    def extract_css_variables(self, config):
        """Extract CSS custom properties from branding configuration"""
        css_vars = {}
        
        if 'branding' in config:
            branding = config['branding']
            
            # Colors
            if 'colors' in branding:
                colors = branding['colors']
                for key, value in colors.items():
                    css_key = f"--color-{key.replace('_', '-').lower()}"
                    css_vars[css_key] = value
            
            # Typography
            if 'typography' in branding:
                typography = branding['typography']
                for key, value in typography.items():
                    css_key = f"--font-{key.replace('_', '-').lower()}"
                    css_vars[css_key] = value
        
        return css_vars
    
    def generate_feature_map(self, config):
        """Generate optimized feature toggle map"""
        feature_map = {}
        
        def process_toggles(toggles, prefix=''):
            for key, value in toggles.items():
                if key == 'enabled':
                    continue
                
                current_key = f"{prefix}.{key}" if prefix else key
                
                if isinstance(value, dict):
                    if 'enabled' in value:
                        # Convert string boolean to actual boolean
                        enabled = value['enabled']
                        if isinstance(enabled, str):
                            enabled = enabled.lower() == 'true'
                        feature_map[current_key] = enabled
                    
                    # Recurse for nested toggles
                    process_toggles(value, current_key)
                elif isinstance(value, bool):
                    feature_map[current_key] = value
        
        if 'feature-toggles' in config:
            process_toggles(config['feature-toggles'])
        
        return feature_map
    
    def generate_js_module(self, config, templates, css_vars, feature_map):
        """Generate the final JavaScript module"""
        
        # Create a clean config without circular references
        clean_config = json.dumps(config, indent=2 if self.dev_mode else None, ensure_ascii=False)
        templates_json = json.dumps(templates, indent=2 if self.dev_mode else None, ensure_ascii=False)
        css_vars_json = json.dumps(css_vars, indent=2 if self.dev_mode else None, ensure_ascii=False)
        feature_map_json = json.dumps(feature_map, indent=2 if self.dev_mode else None, ensure_ascii=False)
        
        timestamp = int(time.time())
        
        js_content = f'''/**
 * Compiled Configuration for Colin's Building Services Website
 * Generated automatically from config/site-config.xml
 * 
 * DO NOT EDIT THIS FILE DIRECTLY
 * Make changes to the XML configuration and run build-config.py
 * 
 * Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}
 * Timestamp: {timestamp}
 */

class CompiledConfig {{
    constructor() {{
        this.timestamp = {timestamp};
        this.config = {clean_config};
        this.templates = {templates_json};
        this.cssVars = {css_vars_json};
        this.featureMap = {feature_map_json};
        this.loaded = true;
    }}

    /**
     * Get configuration value by path
     * @param {{string}} path - Dot notation path (e.g., 'company.name')
     * @returns {{any}} Configuration value
     */
    getValue(path) {{
        return path.split('.').reduce((obj, key) => obj && obj[key], this.config);
    }}

    /**
     * Check if a feature is enabled
     * @param {{string}} featurePath - Feature path (e.g., 'hero-section')
     * @returns {{boolean}} True if feature is enabled
     */
    isFeatureEnabled(featurePath) {{
        return this.featureMap[featurePath] !== false;
    }}

    /**
     * Get pre-compiled template
     * @param {{string}} templateName - Template name
     * @param {{number}} index - Template index (for arrays)
     * @returns {{string}} HTML template
     */
    getTemplate(templateName, index = 0) {{
        const template = this.templates[templateName];
        if (Array.isArray(template)) {{
            return template[index] || template[0] || '';
        }}
        return template || '';
    }}

    /**
     * Get all templates for a type
     * @param {{string}} templateName - Template name
     * @returns {{string[]}} Array of HTML templates
     */
    getAllTemplates(templateName) {{
        const template = this.templates[templateName];
        return Array.isArray(template) ? template : [template || ''];
    }}

    /**
     * Apply branding styles to CSS custom properties
     */
    applyBrandingStyles() {{
        const root = document.documentElement;
        Object.entries(this.cssVars).forEach(([property, value]) => {{
            root.style.setProperty(property, value);
        }});
    }}

    /**
     * Get company information
     * @returns {{object}} Company configuration
     */
    getCompany() {{
        return this.config.company || {{}};
    }}

    /**
     * Get services list
     * @returns {{array}} Services array
     */
    getServices() {{
        const services = this.config.services?.service;
        return Array.isArray(services) ? services : [services || {{}}];
    }}

    /**
     * Get testimonials list
     * @returns {{array}} Testimonials array
     */
    getTestimonials() {{
        const testimonials = this.config.testimonials?.testimonial;
        return Array.isArray(testimonials) ? testimonials : [testimonials || {{}}];
    }}

    /**
     * Get accreditations list
     * @returns {{array}} Accreditations array
     */
    getAccreditations() {{
        const accreditations = this.config.accreditations?.certification;
        return Array.isArray(accreditations) ? accreditations : [accreditations || {{}}];
    }}

    /**
     * Get page-specific content
     * @param {{string}} pageName - Page name (e.g., 'index', 'services')
     * @returns {{object}} Page configuration
     */
    getPageContent(pageName) {{
        const pages = this.config.pages?.page;
        if (Array.isArray(pages)) {{
            return pages.find(page => page.name === pageName) || {{}};
        }}
        return pages?.name === pageName ? pages : {{}};
    }}

    /**
     * Get form configuration
     * @param {{string}} formName - Form name (e.g., 'contact-form')
     * @returns {{object}} Form configuration
     */
    getFormConfig(formName) {{
        return this.config.forms?.[formName] || {{}};
    }}

    /**
     * Get service areas
     * @returns {{object}} Service areas configuration
     */
    getServiceAreas() {{
        return this.config['service-areas'] || {{}};
    }}

    /**
     * Get business policies
     * @returns {{object}} Business policies configuration
     */
    getBusinessPolicies() {{
        return this.config['business-policies'] || {{}};
    }}

    /**
     * Get UI navigation items
     * @returns {{object}} Navigation configuration
     */
    getNavigation() {{
        return this.config.ui?.navigation || {{}};
    }}

    /**
     * Get UI button text
     * @param {{string}} buttonKey - Button key (e.g., 'get-quote')
     * @returns {{string}} Button text
     */
    getButtonText(buttonKey) {{
        return this.config.ui?.buttons?.[buttonKey] || buttonKey;
    }}

    /**
     * Get UI message
     * @param {{string}} messagePath - Message path (e.g., 'error.general')
     * @returns {{string}} Message text
     */
    getMessage(messagePath) {{
        const pathParts = messagePath.split('.');
        let current = this.config.ui?.messages;
        
        for (const part of pathParts) {{
            if (!current || !current[part]) {{
                return messagePath; // Return path if not found
            }}
            current = current[part];
        }}
        
        return current || messagePath;
    }}

    /**
     * Get UI label
     * @param {{string}} labelKey - Label key (e.g., 'call-us')
     * @returns {{string}} Label text
     */
    getLabel(labelKey) {{
        return this.config.ui?.labels?.[labelKey] || labelKey;
    }}

    /**
     * Get chatbot UI configuration
     * @returns {{object}} Chatbot UI configuration
     */
    getChatbotUI() {{
        // Handle both old and new chatbot structure
        if (Array.isArray(this.config.chatbot)) {{
            return this.config.chatbot.find(c => c.ui)?.ui || {{}};
        }}
        return this.config.chatbot?.ui || {{}};
    }}

    /**
     * Get form field configuration
     * @param {{string}} formName - Form name (e.g., 'contact-form')
     * @param {{string}} fieldName - Field name (e.g., 'name')
     * @returns {{object}} Field configuration
     */
    getFormField(formName, fieldName) {{
        const form = this.config.forms?.[formName];
        if (!form?.fields?.field) return {{}};
        
        const fields = Array.isArray(form.fields.field) ? form.fields.field : [form.fields.field];
        return fields.find(field => field.name === fieldName) || {{}};
    }}

    /**
     * Get all form fields for a form
     * @param {{string}} formName - Form name (e.g., 'contact-form')
     * @returns {{array}} Array of field configurations
     */
    getFormFields(formName) {{
        const form = this.config.forms?.[formName];
        if (!form?.fields?.field) return [];
        
        return Array.isArray(form.fields.field) ? form.fields.field : [form.fields.field];
    }}
}}

// Create global instance
window.compiledConfig = new CompiledConfig();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = CompiledConfig;
}}

{"// Development mode - additional debugging" if self.dev_mode else ""}
{"console.log('SUCCESS: Compiled configuration loaded successfully');" if self.dev_mode else ""}
'''

        return js_content

if WATCHDOG_AVAILABLE:
    class XMLWatcher(FileSystemEventHandler):
        def __init__(self, compiler):
            self.compiler = compiler
            
        def on_modified(self, event):
            if event.src_path.endswith('site-config.xml'):
                print(f"\nDetected changes in {event.src_path}")
                self.compiler.compile_xml_to_js()

def main():
    parser = argparse.ArgumentParser(description='Compile XML configuration to JavaScript')
    parser.add_argument('--watch', action='store_true', help='Watch for changes and auto-rebuild')
    parser.add_argument('--dev', action='store_true', help='Development mode with debug info')
    parser.add_argument('--source', default='config/site-config.xml', help='Source XML file path')
    parser.add_argument('--output', default='js/compiled-config.js', help='Output JavaScript file path')
    
    args = parser.parse_args()
    
    # Check if source file exists
    if not Path(args.source).exists():
        print(f"ERROR: Source file not found: {args.source}")
        sys.exit(1)
    
    compiler = ConfigCompiler(args.source, args.output, args.dev)
    
    # Initial compilation
    success = compiler.compile_xml_to_js()
    if not success:
        sys.exit(1)
    
    # Watch mode
    if args.watch:
        if not WATCHDOG_AVAILABLE:
            print("ERROR: Watch mode requires watchdog. Install with: pip install watchdog")
            sys.exit(1)
            
        print(f"\nWatching {args.source} for changes...")
        print("Press Ctrl+C to stop")
        
        try:
            event_handler = XMLWatcher(compiler)
            observer = Observer()
            observer.schedule(event_handler, str(Path(args.source).parent), recursive=False)
            observer.start()
            
            while True:
                time.sleep(1)
                
        except KeyboardInterrupt:
            print(f"\nStopping watcher...")
            observer.stop()
        
        observer.join()

if __name__ == '__main__':
    main()