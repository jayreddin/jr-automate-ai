export default {
    title: 'Transform',
    icon: '🔄',
    category: 'Data & Files',
    color: '#0ea5e9', // Changed from CSS variable to direct hex value (teal color)
    inputs: 1,
    outputs: 1,
    defaultSettings: {
        transformCode: '',
        showPreview: true
    },
    
    // Add help documentation
    help: {
        title: "Transform",
        description: "Manipulates input data using custom JavaScript code. This node allows you to write a transformation function to modify, extract, or convert data between nodes in your flow.",
        sections: [
            {
                title: "Basic Usage",
                content: "Write JavaScript code that operates on the 'input' variable and returns the transformed data. The code should be a valid JavaScript expression or block that returns a value.\n\nExamples:\n- return input.toUpperCase() → Converts text to uppercase\n- return JSON.parse(input) → Converts JSON string to object\n- return input.split(',') → Splits text into array"
            },
            {
                title: "Advanced Examples",
                content: "Format JSON: return JSON.stringify(input, null, 2)\n\nExtract property: return input.user.name\n\nFilter array: return input.filter(item => item.price > 100)\n\nCalculate values: return { total: input.items.reduce((sum, item) => sum + item.price, 0) }\n\nCombine data: return { ...input, timestamp: new Date().toISOString() }"
            },
            {
                title: "Coding Tips",
                content: "- Use 'return' before your expression\n- Access the input with the 'input' variable\n- For multiple operations, use curly braces and return at the end\n- Handle possible errors with try/catch blocks\n- Check if properties exist before accessing them\n- For async operations, use 'await' (e.g., 'return await fetch(...)')"
            },
            {
                title: "Best Practices",
                content: "- Keep transformations simple and focused on a single task\n- For complex logic, chain multiple Transform nodes\n- Test your code with different input types\n- Use the preview panel to check your transformation results\n- Consider using JSON.stringify() to debug complex objects"
            }
        ]
    },
    
    // Format log messages
    formatLogMessage: (message, type, node) => {
        if (type === 'info' && message.includes('Executing')) {
            return `Transforming data...`;
        }
        
        if (type === 'success') {
            // Provide a meaningful summary based on output type
            if (typeof message === 'object') {
                try {
                    const preview = JSON.stringify(message).substring(0, 50);
                    return `Transformed to: ${preview}${preview.length >= 50 ? '...' : ''}`;
                } catch (e) {
                    return `Transformed to object [${typeof message}]`;
                }
            } else if (typeof message === 'string' && message.length > 100) {
                return `Transformed to: "${message.substring(0, 100)}..."`;
            }
            return `Transformed to: ${message}`;
        }
        
        return message;
    },
    
    // Add execution state hooks
    onExecutionStart: (element, node) => {
        // Add transform animation
        const spinner = document.createElement('div');
        spinner.className = 'transform-spinner';
        spinner.style.position = 'absolute';
        spinner.style.top = '10px';
        spinner.style.right = '10px';
        spinner.style.width = '20px';
        spinner.style.height = '20px';
        spinner.style.borderRadius = '50%';
        spinner.style.border = '2px solid transparent';
        spinner.style.borderTopColor = '#0ea5e9';
        spinner.style.borderLeftColor = '#0ea5e9';
        spinner.style.animation = 'transform-spin 1s linear infinite';
        
        // Add animation styles if needed
        if (!document.getElementById('transform-animations')) {
            const style = document.createElement('style');
            style.id = 'transform-animations';
            style.textContent = `
                @keyframes transform-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        const nodeContent = element.querySelector('.node-content');
        if (nodeContent) {
            nodeContent.appendChild(spinner);
        }
        
        // Highlight the code area
        const textarea = element.querySelector('textarea');
        if (textarea) {
            textarea.style.boxShadow = '0 0 0 2px rgba(14, 165, 233, 0.3)';
        }
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Remove spinner
        const spinner = element.querySelector('.transform-spinner');
        if (spinner) {
            spinner.remove();
        }
        
        // Reset textarea style
        const textarea = element.querySelector('textarea');
        if (textarea) {
            textarea.style.boxShadow = '';
        }
        
        // Add output preview if successful and preview is enabled
        if (success && node.settings?.showPreview !== false) {
            const previewEl = element.querySelector('.transform-preview') || document.createElement('div');
            previewEl.className = 'transform-preview';
            previewEl.style.marginTop = '10px';
            previewEl.style.padding = '8px';
            previewEl.style.background = 'rgba(14, 165, 233, 0.1)';
            previewEl.style.borderRadius = '4px';
            previewEl.style.fontSize = '12px';
            previewEl.style.maxHeight = '100px';
            previewEl.style.overflow = 'auto';
            
            let preview = '';
            try {
                if (typeof result === 'object') {
                    preview = JSON.stringify(result, null, 2);
                } else {
                    preview = String(result);
                }
                
                // Truncate if too long
                if (preview.length > 500) {
                    preview = preview.substring(0, 500) + '...';
                }
            } catch (e) {
                preview = `[${typeof result}]`;
            }
            
            previewEl.textContent = preview;
            
            const nodeContent = element.querySelector('.node-content');
            if (nodeContent && !element.querySelector('.transform-preview')) {
                nodeContent.appendChild(previewEl);
                
                // Add remove button
                const removeBtn = document.createElement('div');
                removeBtn.className = 'transform-preview-remove';
                removeBtn.textContent = '×';
                removeBtn.style.position = 'absolute';
                removeBtn.style.top = '5px';
                removeBtn.style.right = '5px';
                removeBtn.style.cursor = 'pointer';
                removeBtn.style.fontSize = '14px';
                removeBtn.style.color = '#0ea5e9';
                removeBtn.onclick = () => {
                    previewEl.remove();
                };
                
                previewEl.style.position = 'relative';
                previewEl.appendChild(removeBtn);
            }
            
            // Auto-remove preview after a timeout
            setTimeout(() => {
                if (element.querySelector('.transform-preview')) {
                    element.querySelector('.transform-preview').remove();
                }
                element.classList.remove('success');
            }, 5000);
        } else if (!success) {
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    createContent: (node) => {
        // Add node-specific styling
        const nodeStyleId = `transform-node-style-${node.id}`;
        
        if (document.getElementById(nodeStyleId)) {
            document.getElementById(nodeStyleId).remove();
        }
        
        const styleEl = document.createElement('style');
        styleEl.id = nodeStyleId;
        styleEl.textContent = `
            #${node.id} {
                min-width: 220px;
            }
            
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
                font-family: monospace;
                min-height: 100px;
                resize: vertical;
                margin-bottom: 0.5rem;
                width: 100%;
            }
            
            #${node.id} .checkbox-option {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.8rem;
                margin-top: 8px;
            }
            
            #${node.id} .checkbox-option input {
                margin: 0;
            }
        `;
        document.head.appendChild(styleEl);
        
        return `
            <div class="node-content">
                <div class="node-label">Transform Function</div>
                <textarea class="node-input" 
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'transformCode', this.value)"
                    placeholder="return input.toUpperCase();"
                >${node.settings?.transformCode || ''}</textarea>
                
                <label class="checkbox-option">
                    <input type="checkbox" 
                        ${node.settings?.showPreview !== false ? 'checked' : ''}
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'showPreview', this.checked)">
                    Show result preview
                </label>
            </div>
        `;
    },
    
    execute: async (node, input, context) => {
        try {
            // Handle undefined input to prevent errors
            const safeInput = input === undefined ? null : input;
            
            // Create a transformation function with error handling
            const transformFn = new Function('input', `
                "use strict";
                try {
                    ${node.settings?.transformCode ? `return ${node.settings.transformCode};` : 'return input;'}
                } catch (error) {
                    throw new Error(\`Transform error: \${error.message}\`);
                }
            `);

            // Execute the transformation
            const result = await transformFn(safeInput);
            
            // Log execution details for debugging
            console.log('Transform executed:', {
                input: safeInput,
                code: node.settings?.transformCode,
                result: result
            });
            
            // Log success with result preview
            let resultPreview = '';
            try {
                if (typeof result === 'object') {
                    resultPreview = JSON.stringify(result).substring(0, 50);
                    if (resultPreview.length >= 50) resultPreview += '...';
                } else if (typeof result === 'string' && result.length > 50) {
                    resultPreview = `"${result.substring(0, 50)}..."`;
                } else {
                    resultPreview = String(result);
                }
            } catch (e) {
                resultPreview = `[${typeof result}]`;
            }
            
            context.flowBuilder.log('success', `Transformed to: ${resultPreview}`, node.id);
            
            return result;
        } catch (error) {
            // Provide helpful error message
            const errorMsg = error.message || 'Unknown error';
            throw new Error(`Transform failed: ${errorMsg}`);
        }
    }
};