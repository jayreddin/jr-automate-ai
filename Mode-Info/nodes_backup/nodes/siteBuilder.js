/**
 * Site Builder Node Module
 * Generates complete HTML websites using AI based on text descriptions
 *
 * @module SiteBuilderNode
 */
export default {
    /**
     * Node Configuration
     */
    title: 'Site Builder',
    icon: '🌐',
    category: 'Web & Media',
    color: '#6366f1',
    inputs: 1,
    outputs: 1,

    /**
     * Default node settings
     * @type {Object}
     * @property {string} description - Website description/requirements
     * @property {string} model - AI model to use for generation
     * @property {number} temperature - AI creativity level (0-1)
     */
    defaultSettings: {
        description: '',
        model: 'claude-3-5-sonnet',
        temperature: 0.7
    },
    
    // Add help documentation
    help: {
        title: "Site Builder",
        description: "Generates a complete HTML website based on a text description using AI. This node transforms natural language requirements into functional web pages with responsive design.",
        sections: [
            {
                title: "Basic Usage",
                content: "Enter a description of the website you want to create, or connect the node to receive a description from a previous node. The Site Builder will generate complete HTML code that can be previewed, saved, or published."
            },
            {
                title: "Description Tips",
                content: "Be specific about design elements, colors, and content you want\nMention the purpose and target audience of the website\nInclude any navigation structure or page sections needed\nSpecify if you want certain features like contact forms or galleries\n\nExample: \"Create a professional portfolio website for a photographer with a dark theme, gallery section, about page, and contact form\""
            },
            {
                title: "Output",
                content: "The node outputs complete HTML code with inline CSS styling. This code can be:\n- Saved as an HTML file using the File Operations node\n- Published directly using the Hosting node\n- Previewed using a Web Preview node\n- Modified with a Transform node"
            },
            {
                title: "Best Practices",
                content: "Start with a clear, detailed description for best results\nConsider using AI node before Site Builder to refine your requirements\nTest generated sites across different screen sizes\nFor complex sites, consider generating separate components and assembling them"
            }
        ]
    },
    
    // Format log messages
    /**
     * Formats log messages for site generation
     * @param {string} message - The message to format
     * @param {string} type - Message type (info/success)
     * @param {Object} node - Node instance
     * @returns {string} Formatted message with generation details
     */
    formatLogMessage: (message, type, node) => {
        if (type === 'info' && message.includes('Executing')) {
            return `Generating website...`;
        }
        
        if (type === 'success') {
            if (typeof message === 'string' && message.length > 300) {
                // For HTML responses, show truncated version with character count
                return `Generated HTML website (${message.length} characters)`;
            }
            return message;
        }
        
        return message;
    },
    
    // Add execution state hooks
    /**
     * Sets up visual spinner for site generation
     * @param {HTMLElement} element - Node's DOM element
     * @param {Object} node - Node instance
     */
    onExecutionStart: (element, node) => {
        // Show spinner
        const spinner = element.querySelector('.site-builder-spinner');
        if (spinner) {
            spinner.classList.add('active');
        } else {
            // Create spinner if it doesn't exist
            const newSpinner = document.createElement('div');
            newSpinner.className = 'site-builder-spinner active';
            newSpinner.id = `spinner-${node.id}`;
            element.querySelector('.node-content').appendChild(newSpinner);
        }
        
        // Add spinner styles if needed
        if (!document.getElementById('site-builder-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'site-builder-spinner-style';
            style.textContent = `
                .site-builder-spinner {
                    display: none;
                    width: 24px;
                    height: 24px;
                    border: 2px solid rgba(99, 102, 241, 0.2);
                    border-radius: 50%;
                    border-top-color: #6366f1;
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    animation: site-builder-spin 1s linear infinite;
                }
                
                .site-builder-spinner.active {
                    display: block;
                }
                
                @keyframes site-builder-spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Hide spinner
        const spinner = element.querySelector('.site-builder-spinner');
        if (spinner) spinner.classList.remove('active');
        
        // Standard success/error handling with additional visual feedback
        if (success) {
            // For successful site generation, add a brief "preview" animation
            const previewFlash = document.createElement('div');
            previewFlash.className = 'site-preview-flash';
            previewFlash.style.position = 'absolute';
            previewFlash.style.top = '0';
            previewFlash.style.left = '0';
            previewFlash.style.width = '100%';
            previewFlash.style.height = '100%';
            previewFlash.style.backgroundColor = 'rgba(99, 102, 241, 0.2)';
            previewFlash.style.borderRadius = '8px';
            previewFlash.style.pointerEvents = 'none';
            previewFlash.style.opacity = '0';
            previewFlash.style.animation = 'preview-flash 1s ease-in-out';
            
            // Add animation if not already exists
            if (!document.getElementById('site-builder-preview-animation')) {
                const style = document.createElement('style');
                style.id = 'site-builder-preview-animation';
                style.textContent = `
                    @keyframes preview-flash {
                        0% { opacity: 0; }
                        30% { opacity: 0.7; }
                        100% { opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            element.appendChild(previewFlash);
            setTimeout(() => {
                if (previewFlash.parentNode) {
                    previewFlash.parentNode.removeChild(previewFlash);
                }
                element.classList.remove('success');
            }, 1000);
        } else {
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    /**
     * Creates the node's UI content
     * @param {Object} node - Node instance
     * @returns {string} HTML content for site builder configuration
     */
    createContent: (node) => {
        const nodeStyleId = `site-builder-node-style-${node.id}`;
        
        if (document.getElementById(nodeStyleId)) {
            document.getElementById(nodeStyleId).remove();
        }
        
        const styleEl = document.createElement('style');
        styleEl.id = nodeStyleId;
        styleEl.textContent = `
            #${node.id} .node-content {
                padding: 0.5rem;
            }
            
            #${node.id} .node-label {
                margin-bottom: 0.2rem;
                font-size: 0.7rem;
                color: var(--text-secondary);
            }
            
            #${node.id} .node-input {
                padding: 0.35rem;
                font-size: 0.8rem;
                min-height: 80px;
                resize: vertical;
            }
            
            #${node.id} .model-settings {
                margin-top: 8px;
                display: flex;
                gap: 8px;
            }
            
            #${node.id} .model-settings > div {
                flex: 1;
            }
        `;
        document.head.appendChild(styleEl);
        
        // Get current settings with defaults
        const description = node.settings?.description || '';
        const model = node.settings?.model || 'claude-3-5-sonnet';
        const temperature = node.settings?.temperature || 0.7;
        
        return `
            <div class="node-content">
                <div class="node-label">Website Description</div>
                <textarea class="node-input" 
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'description', this.value)"
                    placeholder="Describe the website you want to create..."
                >${description}</textarea>
                
                <div class="model-settings">
                    <div>
                        <div class="node-label">AI Model</div>
                        <select class="node-select" 
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'model', this.value)">
                            <option value="claude-3-5-sonnet" ${model === 'claude-3-5-sonnet' ? 'selected' : ''}>Claude 3.5 Sonnet</option>
                            <option value="gpt-4o" ${model === 'gpt-4o' ? 'selected' : ''}>GPT-4o</option>
                            <option value="gpt-4o-mini" ${model === 'gpt-4o-mini' ? 'selected' : ''}>GPT-4o Mini</option>
                        </select>
                    </div>
                    
                    <div>
                        <div class="node-label">Creativity</div>
                        <input type="range" class="node-input" 
                            min="0" max="1" step="0.1" 
                            value="${temperature}"
                            style="min-height: unset; width: 100%;"
                            oninput="window.flowBuilder.updateNodeSetting('${node.id}', 'temperature', parseFloat(this.value))">
                    </div>
                </div>
                
                <div class="site-builder-spinner" id="spinner-${node.id}"></div>
            </div>
        `;
    },
    
    /**
     * Executes the site generation
     * Uses AI to generate complete HTML website
     * @param {Object} node - Node instance
     * @param {string} input - Site description input
     * @param {Object} context - Execution context
     * @returns {Promise<string>} Generated HTML code
     * @throws {Error} If site generation fails
     */
    execute: async (node, input, context) => {
        try {
            const description = input || node.settings?.description;
            if (!description) {
                throw new Error('No site description provided');
            }
            
            // Get model settings
            const model = node.settings?.model || 'claude-3-5-sonnet';
            const temperature = parseFloat(node.settings?.temperature) || 0.7;

            // Generate website using AI
            const htmlResponse = await puter.ai.chat([
                {
                    role: "system",
                    content: "Generate a complete, responsive HTML website. Include viewport meta tag and inline CSS. Keep it under 3000 characters."
                },
                {
                    role: "user",
                    content: description
                }
            ], {
                model: model,
                temperature: temperature
            });

            let html;
            if (typeof htmlResponse === 'string') {
                html = htmlResponse;
            } else if (htmlResponse?.message?.content) {
                html = typeof htmlResponse.message.content === 'string'
                    ? htmlResponse.message.content
                    : htmlResponse.message.content[0]?.text || '';
            } else {
                html = htmlResponse?.text || '';
            }
            
            // Log the successful generation with a character count
            context.flowBuilder.log('success', `Generated HTML website (${html.length} characters)`, node.id);

            return html;
        } catch (error) {
            throw new Error(`Site generation failed: ${error.message}`);
        }
    }
};