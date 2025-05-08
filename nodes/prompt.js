export default {
    title: 'Prompt',
    icon: '💭',
    category: 'Automation',
    color: '#06b6d4', // Direct hex color instead of var(--color-prompt)
    inputs: 1,
    outputs: 1,
    defaultSettings: {
        content: '',
        outputMode: 'replace', // 'replace' or 'append'
        askMe: false,
        promptQuestion: 'Enter your prompt:'
    },
    
    // Help documentation
    help: {
        title: "Prompt Node",
        description: "Adds custom text to the flow or allows interactive input during execution.",
        sections: [
            {
                title: "Basic Usage",
                content: "The Prompt node lets you insert predefined text into the flow or prompt the user for input during execution. This is useful for adding instructions, comments, or collecting user input."
            },
            {
                title: "Output Modes",
                content: "• Replace - Replaces any incoming content with the prompt text\n• Append - Adds the prompt text after the incoming content with a line break between them"
            },
            {
                title: "Interactive Input",
                content: "Check 'Ask me when executed' to display a popup dialog when this node runs. This allows you to enter or modify text at runtime instead of using the predefined content."
            },
            {
                title: "Custom Questions",
                content: "When using interactive input, you can customize the question that appears in the popup. This helps guide users on what kind of input is expected."
            },
            {
                title: "Examples",
                content: "• Instructions for AI: Add specific instructions before passing text to an AI node\n• Dynamic Content: Request user input during execution for unique content each time\n• Template System: Create a template with placeholders, then fill them interactively"
            }
        ]
    },
    
    // Format log messages
    formatLogMessage: (message, type, node) => {
        if (type === 'success') {
            const outputMode = node.settings?.outputMode || 'replace';
            const askMe = node.settings?.askMe || false;
            
            if (askMe) {
                return `[Interactive Input] ${message.length > 50 ? message.substring(0, 50) + '...' : message}`;
            } else {
                return `[${outputMode === 'replace' ? 'Text' : 'Appended'}] ${message.length > 50 ? message.substring(0, 50) + '...' : message}`;
            }
        }
        return message;
    },
    
    // Add execution state hooks
    onExecutionStart: (element, node) => {
        const askMe = node.settings?.askMe || false;
        
        if (askMe) {
            // Show preparation indicator for interactive prompts
            const nodeContent = element.querySelector('.node-content');
            if (nodeContent) {
                const indicator = document.createElement('div');
                indicator.className = 'prompt-interaction-indicator';
                indicator.style.position = 'absolute';
                indicator.style.top = '8px';
                indicator.style.right = '8px';
                indicator.style.borderRadius = '50%';
                indicator.style.width = '10px';
                indicator.style.height = '10px';
                indicator.style.backgroundColor = '#06b6d4';
                indicator.style.boxShadow = '0 0 10px #06b6d4';
                indicator.style.animation = 'pulse 1s infinite alternate';
                nodeContent.appendChild(indicator);
                
                // Add animation style if not present
                if (!document.getElementById('prompt-pulse-animation')) {
                    const style = document.createElement('style');
                    style.id = 'prompt-pulse-animation';
                    style.textContent = `
                        @keyframes pulse {
                            0% { opacity: 0.5; transform: scale(1); }
                            100% { opacity: 1; transform: scale(1.2); }
                        }
                    `;
                    document.head.appendChild(style);
                }
            }
        }
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Remove interaction indicator if present
        const indicator = element.querySelector('.prompt-interaction-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        // Standard success/error handling
        if (success) {
            setTimeout(() => element.classList.remove('success'), 1000);
        } else {
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    createContent: (node) => {
        // Add node-specific compact styling
        const nodeStyleId = `prompt-node-style-${node.id}`;

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
            }
            
            #${node.id} .node-select {
                padding: 0.35rem;
                font-size: 0.8rem;
                margin-top: 0.5rem;
            }
            
            #${node.id} .checkbox-label {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.8rem;
                margin-top: 8px;
                color: var(--text-primary);
            }
            
            #${node.id} .checkbox-label input {
                margin: 0;
            }
            
            #${node.id} .question-field {
                margin-top: 8px;
                display: ${node.settings?.askMe ? 'block' : 'none'};
            }
        `;
        document.head.appendChild(styleEl);

        return `
        <div class="node-content">
            <textarea class="node-input" style="min-height: 80px; width: 100%;"
                onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'content', this.value)"
                placeholder="Enter text to pass to the next node..."
            >${node.settings?.content || ''}</textarea>
            
            <div class="node-label">Output Mode</div>
            <select class="node-select" style="width: 100%;"
                onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'outputMode', this.value)">
                <option value="replace" ${(node.settings?.outputMode === 'replace' || !node.settings?.outputMode) ? 'selected' : ''}>Replace incoming content</option>
                <option value="append" ${node.settings?.outputMode === 'append' ? 'selected' : ''}>Append to incoming content</option>
            </select>
            
            <label class="checkbox-label">
                <input type="checkbox" 
                    ${node.settings?.askMe ? 'checked' : ''}
                    onchange="
                        window.flowBuilder.updateNodeSetting('${node.id}', 'askMe', this.checked);
                        document.getElementById('question-field-${node.id}').style.display = this.checked ? 'block' : 'none';
                    ">
                Ask me when executed
            </label>
            
            <div id="question-field-${node.id}" class="question-field">
                <div class="node-label">Question</div>
                <input type="text" class="node-input" style="width: 100%;"
                    value="${node.settings?.promptQuestion || 'Enter your prompt:'}"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'promptQuestion', this.value)"
                    placeholder="Question to show in the popup">
            </div>
        </div>
        `;
    },
    
    execute: async (node, input, context) => {
        try {
            let content = node.settings?.content || '';
            const outputMode = node.settings?.outputMode || 'replace';
            const askMe = node.settings?.askMe || false;
            const promptQuestion = node.settings?.promptQuestion || 'Enter your prompt:';

            // If askMe is true, show a popup to get user input
            if (askMe) {
                content = await new Promise((resolve) => {
                    // Create modal elements
                    const modal = document.createElement('div');
                    modal.style.position = 'fixed';
                    modal.style.top = '0';
                    modal.style.left = '0';
                    modal.style.width = '100%';
                    modal.style.height = '100%';
                    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                    modal.style.display = 'flex';
                    modal.style.alignItems = 'center';
                    modal.style.justifyContent = 'center';
                    modal.style.zIndex = '1000';
                    modal.style.backdropFilter = 'blur(3px)';
                    modal.style.animation = 'fadeIn 0.2s forwards';

                    // Add animation styles
                    if (!document.getElementById('prompt-modal-animations')) {
                        const style = document.createElement('style');
                        style.id = 'prompt-modal-animations';
                        style.textContent = `
                            @keyframes fadeIn {
                                from { opacity: 0; }
                                to { opacity: 1; }
                            }
                            @keyframes scaleIn {
                                from { transform: scale(0.95); opacity: 0; }
                                to { transform: scale(1); opacity: 1; }
                            }
                        `;
                        document.head.appendChild(style);
                    }

                    const modalContent = document.createElement('div');
                    modalContent.style.backgroundColor = 'var(--bg-secondary)';
                    modalContent.style.borderRadius = '8px';
                    modalContent.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
                    modalContent.style.width = '500px';
                    modalContent.style.maxWidth = '90%';
                    modalContent.style.animation = 'scaleIn 0.2s forwards';

                    const header = document.createElement('div');
                    header.style.borderBottom = '1px solid var(--node-border)';
                    header.style.padding = '12px 16px';
                    header.style.display = 'flex';
                    header.style.alignItems = 'center';

                    const icon = document.createElement('span');
                    icon.textContent = '💭';
                    icon.style.marginRight = '8px';
                    icon.style.fontSize = '1.4rem';

                    const title = document.createElement('h3');
                    title.textContent = 'Prompt Input';
                    title.style.margin = '0';
                    title.style.fontSize = '1.1rem';
                    title.style.color = 'var(--text-primary)';

                    const body = document.createElement('div');
                    body.style.padding = '16px';

                    const form = document.createElement('form');
                    form.onsubmit = (e) => {
                        e.preventDefault();
                        document.body.removeChild(modal);
                        resolve(textarea.value || '');
                    };

                    // Create question element
                    const questionEl = document.createElement('div');
                    questionEl.style.marginBottom = '12px';
                    questionEl.style.fontWeight = 'normal';
                    questionEl.style.color = 'var(--text-primary)';
                    questionEl.textContent = promptQuestion;

                    // Create textarea for input
                    const textarea = document.createElement('textarea');
                    textarea.style.width = '100%';
                    textarea.style.padding = '8px 12px';
                    textarea.style.border = '1px solid var(--node-border)';
                    textarea.style.borderRadius = '4px';
                    textarea.style.backgroundColor = 'var(--bg-tertiary)';
                    textarea.style.color = 'var(--text-primary)';
                    textarea.style.minHeight = '120px';
                    textarea.style.resize = 'vertical';
                    textarea.style.marginBottom = '16px';
                    textarea.style.fontFamily = 'inherit';
                    textarea.value = node.settings?.content || '';

                    // Create buttons
                    const buttonContainer = document.createElement('div');
                    buttonContainer.style.display = 'flex';
                    buttonContainer.style.justifyContent = 'flex-end';
                    buttonContainer.style.gap = '10px';

                    const cancelBtn = document.createElement('button');
                    cancelBtn.textContent = 'Cancel';
                    cancelBtn.style.padding = '8px 16px';
                    cancelBtn.style.borderRadius = '4px';
                    cancelBtn.style.border = 'none';
                    cancelBtn.style.backgroundColor = 'var(--bg-tertiary)';
                    cancelBtn.style.color = 'var(--text-primary)';
                    cancelBtn.style.cursor = 'pointer';
                    cancelBtn.onclick = (e) => {
                        e.preventDefault();
                        document.body.removeChild(modal);
                        resolve(node.settings?.content || '');
                    };

                    const submitBtn = document.createElement('button');
                    submitBtn.type = 'submit';
                    submitBtn.textContent = 'Submit';
                    submitBtn.style.padding = '8px 16px';
                    submitBtn.style.borderRadius = '4px';
                    submitBtn.style.border = 'none';
                    submitBtn.style.backgroundColor = '#06b6d4'; // Use direct color value
                    submitBtn.style.color = 'white';
                    submitBtn.style.cursor = 'pointer';

                    // Add keyboard shortcuts (Escape to cancel, Ctrl+Enter to submit)
                    modal.tabIndex = -1;
                    modal.onkeydown = (e) => {
                        if (e.key === 'Escape') {
                            cancelBtn.click();
                        } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                            submitBtn.click();
                        }
                    };

                    // Build the modal
                    header.appendChild(icon);
                    header.appendChild(title);
                    modalContent.appendChild(header);

                    form.appendChild(questionEl);
                    form.appendChild(textarea);

                    buttonContainer.appendChild(cancelBtn);
                    buttonContainer.appendChild(submitBtn);
                    form.appendChild(buttonContainer);

                    body.appendChild(form);
                    modalContent.appendChild(body);
                    modal.appendChild(modalContent);

                    // Add to document
                    document.body.appendChild(modal);
                    modal.focus();

                    // Focus textarea
                    setTimeout(() => {
                        textarea.focus();

                        // Place cursor at the end of the text
                        if (textarea.value) {
                            textarea.selectionStart = textarea.value.length;
                            textarea.selectionEnd = textarea.value.length;
                        }
                    }, 100);
                });
            }

            // Either replace the input with the content or append to it
            if (outputMode === 'replace') {
                return content;
            } else { // append
                if (input && typeof input === 'string') {
                    return input + '\n\n' + content;
                } else {
                    // If input isn't a string, convert it to string if possible
                    let inputStr = '';
                    try {
                        inputStr = typeof input === 'object' ? JSON.stringify(input, null, 2) : String(input);
                    } catch (e) {
                        inputStr = String(input);
                    }
                    return inputStr + '\n\n' + content;
                }
            }
        } catch (error) {
            throw new Error(`Prompt failed: ${error.message}`);
        }
    }
};