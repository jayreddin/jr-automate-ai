export default {
    title: 'Data Store',
    icon: '📊',
    category: 'Data & Files',
    color: '#f97316', // Changed from var(--color-data) to direct hex value
    inputs: 1,
    outputs: 1,
    defaultSettings: {
        operation: 'set',
        key: ''
    },
    


    help: {
        title: "Data Store",
        description: "Stores and retrieves values in Puter's cloud key-value store. Use this node to persist data between flow executions and share data across different flows.",
        sections: [
            {
                title: "Basic Usage",
                content: "Connect this node to any point in your flow where you need to save data for later use or retrieve previously saved values. Each operation affects how data flows through your automation:\n\n- Store Value: Saves the incoming data under the specified key\n- Retrieve Value: Gets the value for the specified key\n- Increment/Decrement: Increases or decreases numerical values"
            },
            {
                title: "Key Naming",
                content: "Keys are unique identifiers for your stored data. Use descriptive names related to your data (e.g., 'user_preferences', 'last_run_date', 'item_counter').\n\nKeys are scoped to your application, so they won't conflict with other apps, but will be shared across all flows in your app."
            },
            {
                title: "Operations",
                content: "Store Value: Saves the incoming data under the specified key. Any data type can be stored.\n\nRetrieve Value: Gets the previously stored value. Returns null if the key doesn't exist.\n\nIncrement: Adds 1 to a numeric value. Initializes to 0 if the key doesn't exist.\n\nDecrement: Subtracts 1 from a numeric value. Initializes to 0 if the key doesn't exist."
            },
            {
                title: "Tips & Best Practices",
                content: "Use Store Value + Retrieve Value pairs to persist data between flow runs\n\nUse Increment/Decrement for counters and statistics\n\nKeys are limited to 1KB in size\n\nValues are limited to 400KB in size\n\nUse Data Store nodes at the beginning of flows to load saved settings or at the end to store results"
            }
        ]
    },

    
    // Add formatLogMessage method
    formatLogMessage: (message, type, node) => {
        // For success messages, add the operation type
        if (type === 'success') {
            const operation = node.settings?.operation || 'set';
            const key = node.settings?.key || '[No Key]';
            
            // Format message for different operations
            if (message?.startsWith('Stored value')) {
                return `[${operation.toUpperCase()}] Stored value for key: "${key}"`;
            } else if (operation === 'get') {
                // For get operations, format the returned value
                if (message === null || message === undefined) {
                    return `[GET] Key "${key}" returned: null`;
                } else if (typeof message === 'object') {
                    return `[GET] Key "${key}" returned: ${JSON.stringify(message)}`;
                } else {
                    return `[GET] Key "${key}" returned: ${message}`;
                }
            } else if (operation === 'incr' || operation === 'decr') {
                return `[${operation.toUpperCase()}] Key "${key}" new value: ${message}`;
            }
        }
        return message;
    },
    
    // Add execution state hooks
    onExecutionStart: (element, node) => {
        // Add pulsing glow to indicate data operation
        element.style.boxShadow = `0 0 5px 2px rgba(249, 115, 22, 0.5)`;
        
        // Highlight the key input field
        const keyInput = element.querySelector('.node-input');
        if (keyInput) {
            keyInput.style.backgroundColor = 'rgba(249, 115, 22, 0.1)';
            keyInput.style.borderColor = 'rgba(249, 115, 22, 0.5)';
        }
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Remove highlights
        element.style.boxShadow = '';
        
        const keyInput = element.querySelector('.node-input');
        if (keyInput) {
            keyInput.style.backgroundColor = '';
            keyInput.style.borderColor = '';
        }
        
        // Add specific success feedback for data operations
        if (success) {
            // Add data operation animation
            const operation = node.settings?.operation || 'set';
            const nodeContent = element.querySelector('.node-content');
            
            if (nodeContent) {
                // Create and append the animation element if it doesn't exist
                let animElem = element.querySelector('.data-operation-anim');
                if (!animElem) {
                    animElem = document.createElement('div');
                    animElem.className = 'data-operation-anim';
                    nodeContent.appendChild(animElem);
                    
                    // Add the animation style if not already present
                    if (!document.getElementById('data-node-animation')) {
                        const style = document.createElement('style');
                        style.id = 'data-node-animation';
                        style.textContent = `
                            .data-operation-anim {
                                position: absolute;
                                right: 10px;
                                top: 10px;
                                font-size: 16px;
                                opacity: 0;
                                transform: translateY(0);
                                pointer-events: none;
                            }
                            .anim-get { animation: float-up 1.2s ease-out; }
                            .anim-set { animation: float-down 1.2s ease-out; }
                            .anim-incr { animation: pop-up 1.2s ease-out; }
                            .anim-decr { animation: pop-down 1.2s ease-out; }
                            
                            @keyframes float-up {
                                0% { opacity: 1; transform: translateY(0); }
                                100% { opacity: 0; transform: translateY(-30px); }
                            }
                            @keyframes float-down {
                                0% { opacity: 1; transform: translateY(0); }
                                100% { opacity: 0; transform: translateY(30px); }
                            }
                            @keyframes pop-up {
                                0% { opacity: 0; transform: scale(0.5); }
                                50% { opacity: 1; transform: scale(1.2); }
                                100% { opacity: 0; transform: scale(1); }
                            }
                            @keyframes pop-down {
                                0% { opacity: 0; transform: scale(0.5); }
                                50% { opacity: 1; transform: scale(1.2); }
                                100% { opacity: 0; transform: scale(1); }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                }
                
                // Set content based on operation
                switch (operation) {
                    case 'get':
                        animElem.textContent = '⬆️';
                        animElem.className = 'data-operation-anim anim-get';
                        break;
                    case 'set':
                        animElem.textContent = '⬇️';
                        animElem.className = 'data-operation-anim anim-set';
                        break;
                    case 'incr':
                        animElem.textContent = '➕';
                        animElem.className = 'data-operation-anim anim-incr';
                        break;
                    case 'decr':
                        animElem.textContent = '➖';
                        animElem.className = 'data-operation-anim anim-decr';
                        break;
                }
                
                // Reset the animation by forcing a reflow
                void animElem.offsetWidth;
            }
            
            setTimeout(() => element.classList.remove('success'), 1000);
        } else {
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    createContent: (node) => `
        <div class="node-content">
            <div class="node-label">Operation</div>
            <select class="node-select" 
                onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'operation', this.value)">
                <option value="set" ${(node.settings?.operation === 'set' || !node.settings?.operation) ? 'selected' : ''}>Store Value</option>
                <option value="get" ${node.settings?.operation === 'get' ? 'selected' : ''}>Retrieve Value</option>
                <option value="incr" ${node.settings?.operation === 'incr' ? 'selected' : ''}>Increment</option>
                <option value="decr" ${node.settings?.operation === 'decr' ? 'selected' : ''}>Decrement</option>
            </select>
            
            <div class="node-label">Key</div>
            <input type="text" class="node-input"
                value="${node.settings?.key || ''}"
                onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'key', this.value)"
                placeholder="Enter key name">
        </div>
    `,
    
    execute: async (node, input, context) => {
        try {
            const key = node.settings?.key;
            if (!key) {
                throw new Error('Key is required');
            }

            switch (node.settings?.operation || 'set') {
                case 'set':
                    await puter.kv.set(key, input);
                    return `Stored value for key: ${key}`;
                case 'get':
                    return await puter.kv.get(key);
                case 'incr':
                    return await puter.kv.incr(key);
                case 'decr':
                    return await puter.kv.decr(key);
            }
        } catch (error) {
            throw new Error(`Data store operation failed: ${error.message}`);
        }
    }
};