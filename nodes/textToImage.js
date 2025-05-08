export default {
    title: 'Text to Image',
    icon: '🎨',
    category: 'Web & Media',
    color: '#ec4899', // Changed from CSS variable to direct hex value
    inputs: 1,
    outputs: 1,
    defaultSettings: {
        prompt: '',
        style: 'natural',
        testMode: true // Added test mode as default to avoid using credits during development
    },
    
    // Add help documentation
    help: {
        title: "Text to Image",
        description: "Generates images from text descriptions using AI. This node converts natural language prompts into visual content using DALL-E technology.",
        sections: [
            {
                title: "Basic Usage",
                content: "Enter a text prompt describing the image you want to create, or connect the node to receive a prompt from a previous node. The Text to Image node will generate an image based on your description and display a preview."
            },
            {
                title: "Writing Effective Prompts",
                content: "Be specific about content, style, lighting, and composition\nInclude details about what should be included or excluded\nReference artistic styles or photographic techniques\nMention colors, textures, and mood\n\nExample: \"A serene mountain lake at sunset with snow-capped peaks reflected in still water, golden light, photorealistic style\""
            },
            {
                title: "Style Settings",
                content: "Natural: Balanced, realistic images with natural proportions and lighting\n\nArtistic: More creative interpretation with stylized elements\n\nPhotographic: Emphasis on realism and photographic qualities"
            },
            {
                title: "Tips & Best Practices",
                content: "Use Test Mode during development to avoid consuming API credits\nCombine with Transform nodes to dynamically create prompts\nUse File Operations to save generated images\nFor consistent results, be as descriptive and specific as possible\nTry different styles to find the best match for your needs"
            }
        ]
    },
    
    // Format log messages
    formatLogMessage: (message, type, node) => {
        if (type === 'info' && message.includes('Executing')) {
            return `Generating image from prompt...`;
        }
        
        if (type === 'success') {
            // For image generation success
            const style = node.settings?.style || 'natural';
            const testMode = node.settings?.testMode !== false;
            
            return `Image generated successfully ${testMode ? '[TEST MODE]' : ''} (Style: ${style})`;
        }
        
        return message;
    },
    
    // Add execution state hooks
    onExecutionStart: (element, node) => {
        // Clear any existing preview
        const preview = document.getElementById(`preview-${node.id}`);
        if (preview) {
            preview.innerHTML = '';
        }
        
        // Add loading animation
        const loadingContainer = document.createElement('div');
        loadingContainer.className = 'image-loading-container';
        loadingContainer.style.marginTop = '10px';
        loadingContainer.style.padding = '10px';
        loadingContainer.style.background = 'rgba(236, 72, 153, 0.1)';
        loadingContainer.style.borderRadius = '4px';
        loadingContainer.style.textAlign = 'center';
        loadingContainer.style.height = '120px';
        loadingContainer.style.display = 'flex';
        loadingContainer.style.alignItems = 'center';
        loadingContainer.style.justifyContent = 'center';
        loadingContainer.style.flexDirection = 'column';
        
        // Add palette animation
        const palette = document.createElement('div');
        palette.className = 'palette-animation';
        palette.style.display = 'flex';
        palette.style.gap = '5px';
        palette.style.marginBottom = '10px';
        
        const colors = ['#f472b6', '#ec4899', '#db2777', '#be185d', '#9d174d'];
        
        for (let i = 0; i < 5; i++) {
            const colorDot = document.createElement('div');
            colorDot.className = 'color-dot';
            colorDot.style.width = '12px';
            colorDot.style.height = '12px';
            colorDot.style.borderRadius = '50%';
            colorDot.style.background = colors[i];
            colorDot.style.animation = `dot-bounce 1.5s ${i * 0.15}s infinite ease-in-out`;
            palette.appendChild(colorDot);
        }
        
        // Add loading text
        const loadingText = document.createElement('div');
        loadingText.textContent = 'Generating image...';
        loadingText.style.fontSize = '12px';
        loadingText.style.color = '#ec4899';
        
        // Add animation styles
        if (!document.getElementById('image-gen-animations')) {
            const style = document.createElement('style');
            style.id = 'image-gen-animations';
            style.textContent = `
                @keyframes dot-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        loadingContainer.appendChild(palette);
        loadingContainer.appendChild(loadingText);
        
        // Add to preview container
        if (preview) {
            preview.appendChild(loadingContainer);
        }
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Remove loading animation
        const loadingContainer = element.querySelector('.image-loading-container');
        if (loadingContainer) {
            loadingContainer.remove();
        }
        
        // For successful image generation
        if (success) {
            // Image preview should already be updated in execute function
            setTimeout(() => element.classList.remove('success'), 1000);
        } else {
            // On error, clear preview with error message
            const preview = document.getElementById(`preview-${node.id}`);
            if (preview) {
                preview.innerHTML = `
                    <div style="margin-top: 10px; padding: 10px; background: rgba(255, 0, 0, 0.1); 
                                border-radius: 4px; color: #ff0000; font-size: 12px;">
                        Image generation failed
                    </div>
                `;
            }
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    createContent: (node) => {
        // Add node-specific styling
        const nodeStyleId = `image-node-style-${node.id}`;
        
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
            
            #${node.id} .node-select,
            #${node.id} .node-input {
                padding: 0.35rem;
                font-size: 0.8rem;
                min-height: 60px;
                margin-bottom: 0.5rem;
                width: 100%;
            }
            
            #${node.id} .preview-container {
                min-height: 20px;
            }
            
            #${node.id} .checkbox-option {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 8px;
                font-size: 0.8rem;
            }
            
            #${node.id} .checkbox-option input {
                margin: 0;
            }
        `;
        document.head.appendChild(styleEl);
        
        return `
            <div class="node-content">
                <div class="node-label">Image Prompt</div>
                <textarea class="node-input" 
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'prompt', this.value)"
                    placeholder="Describe the image you want to generate..."
                >${node.settings?.prompt || ''}</textarea>
                
                <div class="node-label">Style</div>
                <select class="node-select" 
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'style', this.value)">
                    <option value="natural" ${(!node.settings?.style || node.settings?.style === 'natural') ? 'selected' : ''}>Natural</option>
                    <option value="artistic" ${node.settings?.style === 'artistic' ? 'selected' : ''}>Artistic</option>
                    <option value="photographic" ${node.settings?.style === 'photographic' ? 'selected' : ''}>Photographic</option>
                </select>
                
                <label class="checkbox-option">
                    <input type="checkbox" 
                        ${node.settings?.testMode !== false ? 'checked' : ''}
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'testMode', this.checked)">
                    Test Mode (No API usage)
                </label>
                
                <div class="preview-container" id="preview-${node.id}"></div>
            </div>
        `;
    },
    
    execute: async (node, input, context) => {
        try {
            // Use input or fallback to settings
            const prompt = input || node.settings?.prompt;
            if (!prompt) {
                throw new Error('No prompt provided');
            }
            
            // Get style setting and test mode
            const style = node.settings?.style || 'natural';
            const testMode = node.settings?.testMode !== false;
            
            // Add style to prompt if not already included in user prompt
            let fullPrompt = prompt;
            if (style !== 'natural' && !prompt.toLowerCase().includes(style.toLowerCase())) {
                fullPrompt = `${prompt}, ${style} style`;
            }
            
            // Log prompt for debugging
            console.log(`Generating image with prompt: "${fullPrompt}"`);
            context.flowBuilder.log('info', `Generating image with style: ${style}`, node.id);
            
            // Generate image
            const image = await puter.ai.txt2img(fullPrompt, testMode);

            // Update preview
            const preview = document.getElementById(`preview-${node.id}`);
            if (preview) {
                preview.innerHTML = `
                    <img src="${image.src}" style="max-width: 100%; border-radius: 4px; margin-top: 10px;">
                    ${testMode ? '<div style="font-size: 11px; text-align: center; margin-top: 5px; color: var(--text-secondary);">Test Mode (No API credits used)</div>' : ''}
                `;
            }
            
            // Log success with information about style and test mode
            context.flowBuilder.log('success', 
                `Image generated successfully ${testMode ? '[TEST MODE]' : ''} (Style: ${style})`, 
                node.id);

            return image;
        } catch (error) {
            throw new Error(`Image generation failed: ${error.message}`);
        }
    }
};