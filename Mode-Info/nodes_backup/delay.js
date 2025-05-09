/**
 * Delay Node Module
 * Introduces timed pauses in the flow execution with visual progress feedback
 */
export default {
    /**
     * Node Configuration
     */
    title: 'Delay',
    icon: '⏲️',
    category: 'Automation',
    color: '#14b8a6', // Direct hex value for consistent styling
    inputs: 1,
    outputs: 1,
    
    /**
     * Default node settings
     */
    defaultSettings: {
        delayMs: 1000, // Base delay duration
        delayUnit: 'ms', // Time unit (ms, s, m, h)
        showProgress: true // Whether to show progress indicator
    },



    help: {
        title: "Delay Node",
        description: "Pauses the flow execution for a specified period of time before passing data to the next node. Use this to introduce timing gaps between operations, simulate real-world delays, or rate-limit operations.",
        sections: [
            {
                title: "Basic Usage",
                content: "Place the Delay node between operations where you need to introduce a pause. The incoming data will be held for the specified time period, then passed unchanged to the next node in the flow."
            },
            {
                title: "Timing Options",
                content: "Set the duration using the numeric input and time unit selector:\n\n- Milliseconds (ms): For precise, short delays (1000ms = 1 second)\n- Seconds (sec): For shorter pauses (up to a minute)\n- Minutes (min): For medium length delays\n- Hours (hour): For longer waits\n\nThe progress indicator visually shows the delay countdown when enabled."
            },
            {
                title: "Common Use Cases",
                content: "API Rate Limiting: Prevent hitting rate limits by adding delays between API calls\n\nSimulating Real-World Delays: Create more realistic automated processes\n\nTimed Release: Schedule information or actions to happen after specific intervals\n\nSequencing Operations: Ensure processes happen in a timed sequence"
            },
            {
                title: "Tips & Best Practices",
                content: "Use shorter delays during development and increase them for production\n\nConsider disabling the progress indicator for very short (<100ms) or very long (>1 hour) delays\n\nFor extremely long pauses, consider using a scheduled Start node instead\n\nWhile delays are active, your flow remains running, so avoid excessive delays in loops"
            }
        ]
    },


    
    /**
     * Formats log messages with human-readable delay times
     * @param {string} message - The message to format
     * @param {string} type - Message type
     * @param {Object} node - Node instance with settings
     * @returns {string} Formatted message
     */
    formatLogMessage: (message, type, node) => {
        if (type === 'info' && message.includes('Executing')) {
            // Calculate human-readable delay
            const delayMs = parseInt(node.settings?.delayMs) || 1000;
            const delayUnit = node.settings?.delayUnit || 'ms';
            
            let humanReadableDelay = '';
            switch (delayUnit) {
                case 'ms':
                    humanReadableDelay = `${delayMs}ms`;
                    break;
                case 's':
                    humanReadableDelay = `${delayMs / 1000}s`;
                    break;
                case 'm':
                    humanReadableDelay = `${delayMs / 60000}m`;
                    break;
                case 'h':
                    humanReadableDelay = `${delayMs / 3600000}h`;
                    break;
            }
            
            return `Waiting for ${humanReadableDelay}...`;
        }
        return message;
    },
    
    /**
     * Handles execution start
     * Sets up progress visualization if enabled
     * @param {HTMLElement} element - Node's DOM element
     * @param {Object} node - Node instance with settings
     */
    onExecutionStart: (element, node) => {
        // Add progress indicator if enabled
        if (node.settings?.showProgress !== false) {
            // Create progress container if it doesn't exist
            let progressContainer = element.querySelector('.delay-progress-container');
            if (!progressContainer) {
                progressContainer = document.createElement('div');
                progressContainer.className = 'delay-progress-container';
                element.querySelector('.node-content').appendChild(progressContainer);
            }
            
            // Calculate total delay in ms
            const delayMs = parseInt(node.settings?.delayMs) || 1000;
            const delayUnit = node.settings?.delayUnit || 'ms';
            let totalDelayMs = delayMs;
            
            switch (delayUnit) {
                case 's': totalDelayMs = delayMs * 1000; break;
                case 'm': totalDelayMs = delayMs * 60000; break;
                case 'h': totalDelayMs = delayMs * 3600000; break;
            }
            
            // Store start time and total delay for progress updates
            element.delayStartTime = Date.now();
            element.delayTotalMs = totalDelayMs;
            
            // Create progress bar
            progressContainer.innerHTML = `
                <div class="delay-progress-bar">
                    <div class="delay-progress-fill"></div>
                </div>
                <div class="delay-progress-text">0%</div>
            `;
            
            // Add progress bar styles if needed
            if (!document.getElementById('delay-node-progress-styles')) {
                const style = document.createElement('style');
                style.id = 'delay-node-progress-styles';
                style.textContent = `
                    .delay-progress-container {
                        margin-top: 10px;
                        width: 100%;
                    }
                    .delay-progress-bar {
                        height: 6px;
                        background-color: var(--bg-tertiary);
                        border-radius: 3px;
                        overflow: hidden;
                        margin-bottom: 4px;
                    }
                    .delay-progress-fill {
                        height: 100%;
                        width: 0%;
                        background-color: #14b8a6;
                        transition: width 0.1s linear;
                    }
                    .delay-progress-text {
                        font-size: 0.7rem;
                        text-align: center;
                        color: var(--text-secondary);
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Start progress update
            element.delayProgressInterval = setInterval(() => {
                const elapsed = Date.now() - element.delayStartTime;
                const percent = Math.min(Math.floor((elapsed / element.delayTotalMs) * 100), 100);
                
                const fill = progressContainer.querySelector('.delay-progress-fill');
                const text = progressContainer.querySelector('.delay-progress-text');
                
                if (fill && text) {
                    fill.style.width = `${percent}%`;
                    text.textContent = `${percent}%`;
                }
                
                // Clear interval if complete
                if (percent >= 100) {
                    clearInterval(element.delayProgressInterval);
                }
            }, 50);
        }
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Clear interval if it exists
        if (element.delayProgressInterval) {
            clearInterval(element.delayProgressInterval);
            delete element.delayProgressInterval;
        }
        
        // Update progress to 100% if successful
        if (success) {
            const progressContainer = element.querySelector('.delay-progress-container');
            if (progressContainer) {
                const fill = progressContainer.querySelector('.delay-progress-fill');
                const text = progressContainer.querySelector('.delay-progress-text');
                
                if (fill) fill.style.width = '100%';
                if (text) text.textContent = 'Complete';
                
                // Remove progress after delay
                setTimeout(() => {
                    if (progressContainer) progressContainer.remove();
                }, 2000);
            }
            
            setTimeout(() => element.classList.remove('success'), 1000);
        } else {
            // Remove progress container on error
            const progressContainer = element.querySelector('.delay-progress-container');
            if (progressContainer) progressContainer.remove();
            
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    /**
     * Creates the node's UI content
     * Generates delay controls and progress indicator
     * @param {Object} node - Node instance with settings
     * @returns {string} HTML content for the node
     */
    createContent: (node) => {
        const nodeStyleId = `delay-node-style-${node.id}`;
        
        if (document.getElementById(nodeStyleId)) {
            document.getElementById(nodeStyleId).remove();
        }
        
        const styleEl = document.createElement('style');
        styleEl.id = nodeStyleId;
        styleEl.textContent = `
            #${node.id} .delay-controls {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            #${node.id} .delay-value {
                flex: 3;
            }
            
            #${node.id} .delay-unit {
                flex: 1;
            }
            
            #${node.id} .delay-checkbox {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 8px;
                font-size: 0.8rem;
            }
            
            #${node.id} .delay-checkbox input {
                margin: 0;
            }
        `;
        document.head.appendChild(styleEl);
        
        return `
            <div class="node-content">
                <div class="node-label">Delay</div>
                <div class="delay-controls">
                    <input type="number" class="node-input delay-value"
                        value="${node.settings?.delayMs || 1000}"
                        min="0"
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'delayMs', parseInt(this.value))">
                    
                    <select class="node-select delay-unit"
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'delayUnit', this.value)">
                        <option value="ms" ${(node.settings?.delayUnit === 'ms' || !node.settings?.delayUnit) ? 'selected' : ''}>ms</option>
                        <option value="s" ${node.settings?.delayUnit === 's' ? 'selected' : ''}>sec</option>
                        <option value="m" ${node.settings?.delayUnit === 'm' ? 'selected' : ''}>min</option>
                        <option value="h" ${node.settings?.delayUnit === 'h' ? 'selected' : ''}>hour</option>
                    </select>
                </div>
                
                <label class="delay-checkbox">
                    <input type="checkbox" 
                        ${node.settings?.showProgress !== false ? 'checked' : ''}
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'showProgress', this.checked)">
                    Show progress indicator
                </label>
            </div>
        `;
    },
    
    /**
     * Executes the delay operation
     * @param {Object} node - Node instance with settings
     * @param {*} input - Input to pass through after delay
     * @param {Object} context - Execution context
     * @returns {Promise<*>} Input value after delay
     * @throws {Error} If delay operation fails
     */
    execute: async (node, input, context) => {
        try {
            // Get delay in milliseconds
            const delayMs = parseInt(node.settings?.delayMs) || 1000;
            const delayUnit = node.settings?.delayUnit || 'ms';
            
            // Calculate actual delay based on unit
            let actualDelayMs = delayMs;
            switch (delayUnit) {
                case 's':
                    actualDelayMs = delayMs * 1000;
                    break;
                case 'm':
                    actualDelayMs = delayMs * 60000;
                    break;
                case 'h':
                    actualDelayMs = delayMs * 3600000;
                    break;
            }
            
            // Execute delay with promise
            await new Promise(resolve => setTimeout(resolve, actualDelayMs));
            
            // Pass through the input
            return input;
        } catch (error) {
            throw new Error(`Delay failed: ${error.message}`);
        }
    }
};