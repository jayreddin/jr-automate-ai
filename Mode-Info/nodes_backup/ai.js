// AI Node Configuration
// This file defines the AI node type for the flow builder system
export default {
    // Node metadata
    title: 'AI',
    icon: '🤖',
    category: 'Basic',
    color: '#6366f1', // Using direct hex value for consistent styling
    inputs: 1, // Number of input ports
    outputs: 1, // Number of output ports
    
    // Default configuration values for AI node
    defaultSettings: {
        systemMessage: '', // Custom instructions for the AI
        model: 'gpt-4o-mini', // Default AI model
        temperature: 0.7, // Default creativity level
        testMode: false // Whether to use API credits
    },


    // Add this help object inside your AI node definition
help: {
    title: "AI Node",
    description: "Processes input text through an AI language model and returns the generated response. This node can be used for text generation, content transformation, summarization, and more.",
    sections: [
        {
            title: "Basic Usage",
            content: "Connect the AI node to any node that outputs text. The AI will process this text according to your settings and generate a response. The generated text is then passed to the next node in the flow."
        },
        {
            title: "Configuration Options",
            content: "Model: Select the AI model to use for text generation.\n\nSystem Message: Optional instructions that guide the AI's behavior and define its role (works like a system prompt).\n\nTemperature: Controls randomness in output. Lower values (0.0-0.3) for more deterministic responses, higher values (0.7-1.0) for more creative responses.\n\nTest Mode: Run the node without consuming API credits. Useful for testing your flow."
        },
        {
            title: "Models",
            content: "GPT-4o: Advanced, capable model with strong reasoning abilities.\nGPT-4o Mini: Faster, more cost-effective version of GPT-4o.\nClaude 3.7 Sonnet: Advanced reasoning with longer context.\nLlama 3.1 70B: Open model with good capabilities.\n\nSelect different models based on your task complexity, speed requirements, and budget considerations."
        },
        {
            title: "Tips & Best Practices",
            content: "Use a clear System Message to guide the AI toward your desired output.\nStart with a lower Temperature for factual responses and increase for creative tasks.\nFor complex tasks, chain multiple AI nodes with different instructions.\nUse Test Mode during development to avoid consuming API credits."
        }
    ]
},


    
    // Format log messages with model information
    formatLogMessage: (message, type, node) => {
        // Add model identifier to success messages
        if (type === 'success' && node.settings?.model) {
            // Truncate long responses for readability
            if (typeof message === 'string' && message.length > 200) {
                return `[${node.settings.model}] ${message.substring(0, 200)}... (truncated)`;
            }
            return `[${node.settings.model}] ${message}`;
        }
        return message;
    },
    
    // UI hooks for execution state changes
    onExecutionStart: (element, node) => {
        // Show processing indicator when AI node starts execution
        const spinner = element.querySelector('.site-builder-spinner');
        if (spinner) spinner.classList.add('active');
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Remove the spinning indicator
        const spinner = element.querySelector('.site-builder-spinner');
        if (spinner) spinner.classList.remove('active');
        
        // Default behavior with customization
        if (success) {
            // Add a subtle pulsing effect for AI completion
            element.style.animation = 'ai-pulse 0.8s ease';
            setTimeout(() => {
                element.style.animation = '';
                element.classList.remove('success');
            }, 1000);
        } else {
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    /**
     * Creates the UI content for the AI node
     * Handles dynamic styling and input controls for the node interface
     * @param {Object} node - The node object containing settings and ID
     * @returns {string} HTML string for the node's content
     */
    createContent: (node) => {
        // Generates the UI content for the AI node
        // Handles dynamic styling and input controls
        const nodeStyleId = `ai-node-style-${node.id}`;
        
        // Remove existing style element if present
        if (document.getElementById(nodeStyleId)) {
            document.getElementById(nodeStyleId).remove();
        }
        
        // Create new style element with node-specific styling
        const styleEl = document.createElement('style');
        styleEl.id = nodeStyleId;
        styleEl.textContent = `
            /* Compact styling for this specific node */
            #${node.id} .node-content {
                padding: 0.5rem; // Reduced padding for compact UI
            }
            
            #${node.id} .node-label {
                margin-bottom: 0.2rem; // Tighter spacing for labels
                font-size: 0.7rem; // Smaller font for labels
                color: var(--text-secondary); // Subtle text color
            }
            
            #${node.id} .node-select,
            #${node.id} .node-input {
                padding: 0.35rem; // Compact input styling
                font-size: 0.8rem; // Readable input text
                min-height: unset; // Override default height constraints
            }
            
            #${node.id} .compact-row {
                display: flex; // Horizontal layout for controls
                gap: 0.5rem; // Consistent spacing between elements
                align-items: center; // Vertically centered items
                margin-bottom: 0.35rem; // Spacing between form rows
            }
            
            #${node.id} .temp-value {
                font-size: 0.7rem; // Small text for temperature values
                min-width: 24px; // Fixed width for numeric display
                text-align: right; // Right-aligned numbers for visual consistency
            }

            #${node.id} .checkbox-container {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-top: 0.5rem;
                font-size: 0.8rem;
            }

            #${node.id} .checkbox-container input[type="checkbox"] {
                margin: 0;
            }
            
            /* Add pulse animation for AI completion */
            @keyframes ai-pulse {
                0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
                100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
            }
            
            /* Spinner for AI processing */
            #${node.id} .site-builder-spinner {
                display: none;
                width: 20px;
                height: 20px;
                border: 2px solid rgba(99, 102, 241, 0.3);
                border-radius: 50%;
                border-top-color: #6366f1;
                position: absolute;
                top: 10px;
                right: 10px;
                animation: ai-spin 1s linear infinite;
            }
            
            #${node.id} .site-builder-spinner.active {
                display: block;
            }
            
            @keyframes ai-spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(styleEl);

        return `
        <div class="node-content">
            <div class="node-label">Model</div>
            <select class="node-select" 
                onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'model', this.value)">
                <option value="gpt-4o-mini" ${(node.settings?.model === 'gpt-4o-mini' || !node.settings?.model) ? 'selected' : ''}>GPT-4o Mini</option>
                <option value="gpt-4o" ${node.settings?.model === 'gpt-4o' ? 'selected' : ''}>GPT-4o</option>
                <option value="o3-mini" ${node.settings?.model === 'o3-mini' ? 'selected' : ''}>O3 Mini</option>
                <option value="o1-mini" ${node.settings?.model === 'o1-mini' ? 'selected' : ''}>O1 Mini</option>
                <option value="claude-3-7-sonnet" ${node.settings?.model === 'claude-3-7-sonnet' ? 'selected' : ''}>Claude 3.7 Sonnet</option>
                <option value="claude-3-5-sonnet" ${node.settings?.model === 'claude-3-5-sonnet' ? 'selected' : ''}>Claude 3.5 Sonnet</option>
                <option value="deepseek-chat" ${node.settings?.model === 'deepseek-chat' ? 'selected' : ''}>DeepSeek Chat</option>
                <option value="deepseek-reasoner" ${node.settings?.model === 'deepseek-reasoner' ? 'selected' : ''}>DeepSeek Reasoner</option>
                <option value="gemini-2.0-flash" ${node.settings?.model === 'gemini-2.0-flash' ? 'selected' : ''}>Gemini 2.0 Flash</option>
                <option value="gemini-1.5-flash" ${node.settings?.model === 'gemini-1.5-flash' ? 'selected' : ''}>Gemini 1.5 Flash</option>
                <option value="meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo" ${node.settings?.model === 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo' ? 'selected' : ''}>Llama 3.1 8B</option>
                <option value="meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo" ${node.settings?.model === 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo' ? 'selected' : ''}>Llama 3.1 70B</option>
                <option value="meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo" ${node.settings?.model === 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo' ? 'selected' : ''}>Llama 3.1 405B</option>
                <option value="mistral-large-latest" ${node.settings?.model === 'mistral-large-latest' ? 'selected' : ''}>Mistral Large</option>
                <option value="pixtral-large-latest" ${node.settings?.model === 'pixtral-large-latest' ? 'selected' : ''}>Pixtral Large</option>
                <option value="codestral-latest" ${node.settings?.model === 'codestral-latest' ? 'selected' : ''}>Codestral</option>
                <option value="google/gemma-2-27b-it" ${node.settings?.model === 'google/gemma-2-27b-it' ? 'selected' : ''}>Gemma 2 27B</option>
                <option value="grok-beta" ${node.settings?.model === 'grok-beta' ? 'selected' : ''}>Grok Beta</option>
            </select>
            
            <div class="node-label" style="margin-top: 8px;">System Message (optional)</div>
            <textarea class="node-input" style="min-height: 60px;"
                onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'systemMessage', this.value)"
                placeholder="Instructions for the AI..."
            >${node.settings?.systemMessage || ''}</textarea>
            
            <div class="compact-row" style="margin-top: 8px;">
                <div class="node-label" style="margin: 0;">Temperature</div>
                <input type="range" class="node-input" style="flex-grow: 1; margin: 0;"
                    min="0" max="1" step="0.1" 
                    value="${node.settings?.temperature || 0.7}"
                    oninput="this.nextElementSibling.textContent = this.value; window.flowBuilder.updateNodeSetting('${node.id}', 'temperature', parseFloat(this.value))">
                <span class="temp-value">${node.settings?.temperature || 0.7}</span>
            </div>

            <div class="checkbox-container">
                <input type="checkbox" id="testMode-${node.id}" 
                    ${node.settings?.testMode ? 'checked' : ''}
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'testMode', this.checked)">
                <label for="testMode-${node.id}">Test Mode (No API usage)</label>
            </div>
            
            <div class="site-builder-spinner" id="spinner-${node.id}"></div>
        </div>
    `;
    },
    
    /**
     * Executes the AI node's core functionality
     * Processes input through selected AI model and returns generated response
     * @param {Object} node - The node object containing settings
     * @param {string} input - The input text to process
     * @param {Object} context - The execution context
     * @returns {Promise<string>} The AI-generated response
     * @throws {Error} If API call fails or response processing errors
     */
    execute: async (node, input, context) => {
        try {
            // Build message content based on input and settings
            let message = '';
            const systemMessage = node.settings?.systemMessage || '';

            // Format message based on whether we use system message
            if (systemMessage) {
                // Use messages array format which supports system messages
                message = [
                    {
                        role: "system",
                        content: systemMessage
                    },
                    {
                        role: "user",
                        content: input || ""
                    }
                ];
            } else {
                // Simple text prompt
                message = input || "";
            }

            // Use the model from settings or default
            const model = node.settings?.model || 'gpt-4o-mini';
            const temperature = parseFloat(node.settings?.temperature) || 0.7;
            const testMode = Boolean(node.settings?.testMode); // Ensure boolean conversion

            // Log the API call for debugging
            console.log(`Calling AI API with model: ${model}, temperature: ${temperature}, testMode: ${testMode}`);
            console.log(`Message:`, message);

            // Call the puter.ai.chat API with test mode parameter
            let response = await puter.ai.chat(message, testMode, {
                model: model,
                temperature: temperature
            });
            
            console.log("API response:", response);
            
            // Check if response is valid or if we're in test mode
            if (testMode) {
                // Verify we got a proper test mode response rather than creating a fake one
                if (response) {
                    // Append a prefix to the response to indicate test mode was used
                    if (typeof response === 'string') {
                        response = `[TEST MODE] ` + response;
                    } else if (response.message?.content) {
                        if (typeof response.message.content === 'string') {
                            response.message.content = `[TEST MODE] ` + response.message.content;
                        }
                    }
                } else {
                    // In the rare case we don't get a response in test mode
                    return "[TEST MODE] No response received from the API. This indicates the test mode is working but didn't return a simulated response.";
                }
            }

            // Process API response into usable output
            let result = '';

            // Handle different response structures based on model type
            if (typeof response === 'string') {
                // Direct string response
                result = response;
            } else if (response?.message?.content) {
                // Handle Claude and similar formats
                if (typeof response.message.content === 'string') {
                    result = response.message.content;
                } else if (Array.isArray(response.message.content)) {
                    // Content is an array of blocks (like Claude's format)
                    const textBlocks = response.message.content.filter(block => block.type === 'text' || block.text);
                    result = textBlocks.map(block => block.text || block.value || '').join('\n');
                }
            } else if (response?.text) {
                // Some models return a text property
                result = response.text;
            } else if (response?.choices && response.choices[0]?.message?.content) {
                // OpenAI-like structure
                result = response.choices[0].message.content;
            } else {
                // Fallback for unknown formats
                result = JSON.stringify(response);
            }

            return result;
        } catch (error) {
            console.error("AI node execution error:", error);
            
            // If we're in test mode and encounter an error, we shouldn't fake a response
            // Instead, we should propagate the error to show that something went wrong
            throw new Error(`AI execution failed: ${error.message || "Unknown error"}`);
        }
    }
};