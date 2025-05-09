/**
 * Start Node Module
 * Entry point node for flow execution with various trigger options
 *
 * @module StartNode
 */
export default {
    /**
     * Node Configuration
     */
    title: 'Start',
    icon: '🚀',
    category: 'Basic',
    color: '#9333ea',
    inputs: 0,
    outputs: 1,
    
    /**
     * Default node settings
     * @type {Object}
     * @property {string} triggerType - Type of trigger (manual/interval/scheduled)
     * @property {number} interval - Time between executions
     * @property {string} intervalUnit - Unit for interval (seconds/minutes/hours)
     * @property {string} startTime - Scheduled execution time
     * @property {number} runCount - Number of executions (0 = infinite)
     */
    defaultSettings: {
        triggerType: 'manual',
        interval: 60,
        intervalUnit: 'seconds',
        startTime: '',
        runCount: 5
    },
    
    // Add help documentation
    help: {
        title: "Start Node",
        description: "Initiates the flow's execution. This node acts as the entry point for your automation and can be triggered manually, on a schedule, or at recurring intervals.",
        sections: [
            {
                title: "Trigger Types",
                content: "Manual: Runs once when you press the Run Flow button\n\nRun Repeatedly: Executes at regular intervals (seconds, minutes, or hours)\n\nRun at Specific Time: Schedules the flow to execute at a precise date and time"
            },
            {
                title: "Interval Settings",
                content: "Interval: How frequently the flow should run\n\nNumber of Runs: How many times to execute (0 = infinite)\n\nTip: Use shorter intervals for testing, then increase for production use. Be cautious with infinite runs, as they continue until manually stopped."
            },
            {
                title: "Scheduled Settings",
                content: "Set an exact date and time for the flow to execute\n\nThe time is based on your local time zone\n\nScheduled flows will only execute once at the specified time"
            },
            {
                title: "Best Practices",
                content: "Place Start nodes at the beginning of your logical flow\n\nYou can have multiple Start nodes in a single flow for different trigger conditions\n\nFor complex scheduled workflows, consider using different flows with specific Start nodes\n\nUse the Run Repeatedly option with care to avoid excessive resource usage"
            }
        ]
    },
    
    // Format log messages
    /**
     * Formats log messages for start operations
     * @param {string} message - The message to format
     * @param {string} type - Message type (info)
     * @param {Object} node - Node instance
     * @returns {string} Formatted message with trigger details
     */
    formatLogMessage: (message, type, node) => {
        const triggerType = node.settings?.triggerType || 'manual';
        
        if (type === 'info' && message.includes('Executing')) {
            if (triggerType === 'manual') {
                return 'Starting flow manually...';
            } else if (triggerType === 'interval') {
                const interval = parseInt(node.settings?.interval || 60);
                const unit = node.settings?.intervalUnit || 'seconds';
                const runCount = parseInt(node.settings?.runCount || 5);
                
                return runCount > 0 
                    ? `Starting recurring flow (${interval} ${unit}, ${runCount} runs)...` 
                    : `Starting recurring flow (${interval} ${unit}, infinite runs)...`;
            } else if (triggerType === 'scheduled') {
                const startTime = node.settings?.startTime;
                return startTime 
                    ? `Starting scheduled flow (${new Date(startTime).toLocaleString()})...` 
                    : 'Starting scheduled flow...';
            }
        }
        
        return message;
    },
    
    // Add execution state hooks
    /**
     * Sets up visual feedback for flow start
     * Adds launch animation and trigger indicators
     * @param {HTMLElement} element - Node's DOM element
     * @param {Object} node - Node instance
     */
    onExecutionStart: (element, node) => {
        // Add launch animation effect
        const launchEffect = document.createElement('div');
        launchEffect.className = 'start-node-launch';
        launchEffect.style.position = 'absolute';
        launchEffect.style.bottom = '0';
        launchEffect.style.left = '50%';
        launchEffect.style.transform = 'translateX(-50%)';
        launchEffect.style.width = '30px';
        launchEffect.style.height = '40px';
        launchEffect.style.overflow = 'hidden';
        
        // Create rocket animation
        const rocket = document.createElement('div');
        rocket.textContent = '🚀';
        rocket.style.position = 'absolute';
        rocket.style.fontSize = '20px';
        rocket.style.bottom = '0';
        rocket.style.left = '50%';
        rocket.style.transform = 'translateX(-50%)';
        rocket.style.animation = 'rocket-launch 1.5s ease-out';
        
        // Create flame effect
        const flame = document.createElement('div');
        flame.className = 'flame';
        flame.style.position = 'absolute';
        flame.style.bottom = '-15px';
        flame.style.left = '50%';
        flame.style.transform = 'translateX(-50%)';
        flame.style.width = '10px';
        flame.style.height = '20px';
        flame.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,120,20,0.8) 60%, rgba(255,194,41,0.9) 100%)';
        flame.style.borderBottomLeftRadius = '5px';
        flame.style.borderBottomRightRadius = '5px';
        flame.style.animation = 'flame-flicker 0.5s ease-in infinite alternate';
        
        // Add animation styles if not already exist
        if (!document.getElementById('start-node-animations')) {
            const style = document.createElement('style');
            style.id = 'start-node-animations';
            style.textContent = `
                @keyframes rocket-launch {
                    0% { bottom: 0; opacity: 1; }
                    30% { bottom: 10px; }
                    100% { bottom: 100px; opacity: 0; }
                }
                
                @keyframes flame-flicker {
                    0% { height: 15px; opacity: 0.7; }
                    100% { height: 25px; opacity: 0.9; }
                }
            `;
            document.head.appendChild(style);
        }
        
        launchEffect.appendChild(flame);
        launchEffect.appendChild(rocket);
        element.appendChild(launchEffect);
        
        // Remove effect after animation completes
        setTimeout(() => {
            if (launchEffect.parentNode) {
                launchEffect.parentNode.removeChild(launchEffect);
            }
        }, 1500);
        
        // Add indicator for trigger type
        const triggerType = node.settings?.triggerType || 'manual';
        let triggerIcon = '';
        
        switch (triggerType) {
            case 'manual':
                triggerIcon = '👆';
                break;
            case 'interval':
                triggerIcon = '🔄';
                break;
            case 'scheduled':
                triggerIcon = '📅';
                break;
        }
        
        const triggerIndicator = document.createElement('div');
        triggerIndicator.className = 'trigger-indicator';
        triggerIndicator.textContent = triggerIcon;
        triggerIndicator.style.position = 'absolute';
        triggerIndicator.style.top = '10px';
        triggerIndicator.style.right = '10px';
        triggerIndicator.style.fontSize = '16px';
        
        element.appendChild(triggerIndicator);
        
        // Store reference to remove later
        element.triggerIndicator = triggerIndicator;
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Remove trigger indicator
        if (element.triggerIndicator && element.triggerIndicator.parentNode) {
            element.triggerIndicator.parentNode.removeChild(element.triggerIndicator);
        }
        
        // Standard success/error handling
        if (success) {
            // For interval nodes, add a clock animation to indicate recurring execution
            const triggerType = node.settings?.triggerType || 'manual';
            if (triggerType === 'interval') {
                const clockIndicator = document.createElement('div');
                clockIndicator.className = 'clock-indicator';
                clockIndicator.textContent = '⏱️';
                clockIndicator.style.position = 'absolute';
                clockIndicator.style.top = '10px';
                clockIndicator.style.right = '10px';
                clockIndicator.style.fontSize = '16px';
                clockIndicator.style.animation = 'pulse 2s infinite';
                
                // Add pulse animation if not exists
                if (!document.getElementById('clock-pulse-animation')) {
                    const style = document.createElement('style');
                    style.id = 'clock-pulse-animation';
                    style.textContent = `
                        @keyframes pulse {
                            0% { transform: scale(1); }
                            50% { transform: scale(1.2); }
                            100% { transform: scale(1); }
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                element.appendChild(clockIndicator);
            }
            
            setTimeout(() => element.classList.remove('success'), 1000);
        } else {
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    /**
     * Creates the node's UI content
     * @param {Object} node - Node instance
     * @returns {string} HTML content for start configuration
     */
    createContent: (node) => {
        const nodeStyleId = `start-node-style-${node.id}`;
        
        if (document.getElementById(nodeStyleId)) {
            document.getElementById(nodeStyleId).remove();
        }
        
        const styleEl = document.createElement('style');
        styleEl.id = nodeStyleId;
        styleEl.textContent = `
            #${node.id} {
                min-width: 200px;
            }
            
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
                min-height: unset;
                margin-bottom: 0.5rem;
                width: 100%;
            }
            
            #${node.id} .interval-container {
                display: flex;
                gap: 8px;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            
            #${node.id} .interval-value {
                width: 80px;
            }
            
            #${node.id} .interval-unit {
                flex: 1;
            }
        `;
        document.head.appendChild(styleEl);
        
        return `
        <div class="node-content">
            <div class="node-label">Trigger Type</div>
            <select class="node-select" 
                onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'triggerType', this.value);
                          document.getElementById('interval-settings-${node.id}').style.display = this.value === 'interval' ? 'block' : 'none';
                          document.getElementById('scheduled-settings-${node.id}').style.display = this.value === 'scheduled' ? 'block' : 'none';">
                <option value="manual" ${(node.settings?.triggerType === 'manual' || !node.settings?.triggerType) ? 'selected' : ''}>Manual (Run once)</option>
                <option value="interval" ${node.settings?.triggerType === 'interval' ? 'selected' : ''}>Run repeatedly</option>
                <option value="scheduled" ${node.settings?.triggerType === 'scheduled' ? 'selected' : ''}>Run at specific time</option>
            </select>

            <div id="interval-settings-${node.id}" style="display: ${node.settings?.triggerType === 'interval' ? 'block' : 'none'}">
                <div class="node-label">Run every</div>
                <div class="interval-container">
                    <input type="number" class="node-input interval-value"
                        value="${node.settings?.interval || 60}"
                        min="1"
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'interval', parseInt(this.value))">
                    <select class="node-select interval-unit" 
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'intervalUnit', this.value)">
                        <option value="seconds" ${(node.settings?.intervalUnit === 'seconds' || !node.settings?.intervalUnit) ? 'selected' : ''}>Seconds</option>
                        <option value="minutes" ${node.settings?.intervalUnit === 'minutes' ? 'selected' : ''}>Minutes</option>
                        <option value="hours" ${node.settings?.intervalUnit === 'hours' ? 'selected' : ''}>Hours</option>
                    </select>
                </div>

                <div class="node-label">Number of runs (0 = infinite)</div>
                <input type="number" class="node-input"
                    value="${node.settings?.runCount || 5}"
                    min="0"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'runCount', parseInt(this.value))">
            </div>

            <div id="scheduled-settings-${node.id}" style="display: ${node.settings?.triggerType === 'scheduled' ? 'block' : 'none'}">
                <div class="node-label">Run at specific time</div>
                <input type="datetime-local" class="node-input"
                    value="${node.settings?.startTime || ''}"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'startTime', this.value)">
            </div>
        </div>
        `;
    },
    
    /**
     * Executes the start operation
     * Handles different trigger types and their initialization
     * @param {Object} node - Node instance
     * @param {*} input - Not used (trigger node)
     * @param {Object} context - Execution context
     * @returns {Promise<string>} Status message
     * @throws {Error} If start configuration is invalid
     */
    execute: async (node, input, context) => {
        try {
            const triggerType = node.settings?.triggerType || 'manual';
            console.log(`Executing Start node (${node.id}) with trigger type: ${triggerType}`);

            // For manual execution, just return a simple message
            if (triggerType === 'manual') {
                return "Flow started manually";
            }

            // For interval and scheduled executions, return appropriate messages
            // but don't set up any timers - that's handled by the FlowActivationManager
            if (triggerType === 'interval') {
                const interval = parseInt(node.settings?.interval || 60);
                const unit = node.settings?.intervalUnit || 'seconds';
                const runCount = parseInt(node.settings?.runCount || 5);

                // Log progress for the user
                if (runCount > 0) {
                    context.flowBuilder.log('info', `Flow will run ${runCount} times at ${interval} ${unit} intervals`, node.id);
                    return `Flow execution 1 of ${runCount}`;
                } else {
                    context.flowBuilder.log('info', `Flow running continuously at ${interval} ${unit} intervals`, node.id);
                    return "Flow started (running continuously)";
                }
            }

            if (triggerType === 'scheduled') {
                const startTime = node.settings?.startTime;
                if (!startTime) {
                    throw new Error("Scheduled start time not specified");
                }
                
                const scheduledTime = new Date(startTime);
                const now = new Date();
                
                // Check if the scheduled time is in the past
                if (scheduledTime < now) {
                    context.flowBuilder.log('warning', 
                        `Scheduled time (${scheduledTime.toLocaleString()}) is in the past`, 
                        node.id);
                }

                context.flowBuilder.log('info', 
                    `Flow scheduled to run at ${scheduledTime.toLocaleString()}`, 
                    node.id);
                
                return `Flow scheduled to run at ${scheduledTime.toLocaleString()}`;
            }

            return "Flow started";
        } catch (error) {
            throw new Error(`Start node error: ${error.message}`);
        }
    }
};