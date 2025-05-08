export default {
    title: 'Loop',
    icon: '🔁',
    category: 'Automation',
    color: '#8b5cf6', // Direct hex value instead of CSS variable
    inputs: 1,
    outputs: 2,
    outputLabels: ['Iteration', 'Complete'],
    defaultSettings: {
        loopType: 'count',
        count: 5,
        arrayPath: '',
        condition: '',
        currentItemName: 'item',
        indexName: 'index',
        delay: 0,
        maxIterations: 1000, // Added configurable safety limit
        collectResults: false // Added option to collect results
    },
    


    help: {
        title: "Loop Node",
        description: "Creates iteration loops within your flow. This node allows you to repeat operations multiple times, process arrays of data, or execute until a condition is met.",
        sections: [
            {
                title: "Loop Types",
                content: "Count (For Loop): Executes a specific number of times\nFor Each: Iterates through each item in an array\nWhile: Continues executing while a condition is true"
            },
            {
                title: "Outputs",
                content: "Iteration: Connects to nodes that should execute during each loop iteration\nComplete: Executes once after all iterations are finished"
            },
            {
                title: "Variable Names",
                content: "Current Item: Variable name to access the current array item in For Each loops\nIndex: Variable name to access the current iteration number\n\nThese variables can be referenced in downstream nodes and in While loop conditions."
            },
            {
                title: "Advanced Options",
                content: "Delay: Add a pause between iterations (in milliseconds)\nMax Iterations: Safety limit to prevent infinite loops\nCollect Results: Gather outputs from each iteration into a results array"
            }
        ]
    },


    
    // Format log messages
    formatLogMessage: (message, type, node) => {
        const loopType = node.settings?.loopType || 'count';
        
        if (type === 'info' && message.includes('Executing')) {
            return `Starting ${loopType} loop...`;
        }
        
        // Add loop type to success/error messages
        if (type === 'success' && message.includes('Loop completed')) {
            return `${message} [${loopType}]`;
        }
        
        if (type === 'error' && message.includes('Loop')) {
            return `${loopType} loop error: ${message.replace('Loop execution failed: ', '')}`;
        }
        
        return message;
    },
    
    // Add execution state hooks
    onExecutionStart: (element, node) => {
        // Add loop iteration counter element if it doesn't exist
        let counterElement = element.querySelector('.loop-iteration-counter');
        if (!counterElement) {
            counterElement = document.createElement('div');
            counterElement.className = 'loop-iteration-counter';
            counterElement.style.position = 'absolute';
            counterElement.style.top = '10px';
            counterElement.style.right = '10px';
            counterElement.style.fontSize = '11px';
            counterElement.style.background = 'rgba(139, 92, 246, 0.2)';
            counterElement.style.padding = '2px 6px';
            counterElement.style.borderRadius = '10px';
            counterElement.style.color = '#8b5cf6';
            counterElement.style.fontWeight = 'bold';
            counterElement.textContent = 'Iterations: 0';
            
            const content = element.querySelector('.node-content');
            if (content) {
                content.appendChild(counterElement);
            }
        } else {
            counterElement.textContent = 'Iterations: 0';
        }
        
        // Initialize progress bar element if not exists
        let progressBar = element.querySelector('.loop-progress-bar');
        if (!progressBar) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'loop-progress-container';
            progressContainer.style.position = 'absolute';
            progressContainer.style.bottom = '0';
            progressContainer.style.left = '0';
            progressContainer.style.width = '100%';
            progressContainer.style.height = '3px';
            progressContainer.style.overflow = 'hidden';
            
            progressBar = document.createElement('div');
            progressBar.className = 'loop-progress-bar';
            progressBar.style.height = '100%';
            progressBar.style.width = '0%';
            progressBar.style.backgroundColor = '#8b5cf6';
            progressBar.style.transition = 'width 0.3s ease';
            
            progressContainer.appendChild(progressBar);
            element.appendChild(progressContainer);
        } else {
            progressBar.style.width = '0%';
        }
        
        // Store the start time for monitoring execution duration
        element.loopStartTime = Date.now();
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Clean up counter and progress bar
        const counter = element.querySelector('.loop-iteration-counter');
        if (counter) {
            setTimeout(() => {
                if (counter.parentNode) counter.parentNode.removeChild(counter);
            }, 3000);
        }
        
        const progressBar = element.querySelector('.loop-progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
            setTimeout(() => {
                const container = progressBar.parentNode;
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }
            }, 3000);
        }
        
        // Standard success/error handling
        if (success) {
            setTimeout(() => element.classList.remove('success'), 1000);
        } else {
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    createContent: (node) => {
        // Add node-specific styling
        const nodeStyleId = `loop-node-style-${node.id}`;
        
        if (document.getElementById(nodeStyleId)) {
            document.getElementById(nodeStyleId).remove();
        }
        
        const styleEl = document.createElement('style');
        styleEl.id = nodeStyleId;
        styleEl.textContent = `
            /* Styling for this node */
            #${node.id} {
                min-width: 240px;
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
            }
            
            #${node.id} .compact-row {
                display: flex;
                gap: 0.5rem;
                align-items: center;
                margin-bottom: 0.35rem;
            }
            
            #${node.id} .flex-grow {
                flex-grow: 1;
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
            
            #${node.id} .connector.output[data-index="0"]::after {
                content: "Iteration";
                position: absolute;
                bottom: -18px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 10px;
                color: var(--accent-primary);
                white-space: nowrap;
                pointer-events: none;
            }
            
            #${node.id} .connector.output[data-index="1"]::after {
                content: "Complete";
                position: absolute;
                bottom: -18px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 10px;
                color: var(--success-color);
                white-space: nowrap;
                pointer-events: none;
            }
            
            #${node.id} .advanced-options {
                margin-top: 10px;
                border-top: 1px dotted var(--node-border);
                padding-top: 10px;
            }
            
            #${node.id} .option-toggle {
                font-size: 12px;
                color: var(--text-secondary);
                cursor: pointer;
                user-select: none;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-top: 5px;
            }
            
            #${node.id} .option-toggle:hover {
                color: var(--accent-primary);
            }
        `;
        document.head.appendChild(styleEl);
        
        // Get current settings or defaults
        const loopType = node.settings?.loopType || 'count';
        const count = node.settings?.count || 5;
        const arrayPath = node.settings?.arrayPath || '';
        const condition = node.settings?.condition || '';
        const currentItemName = node.settings?.currentItemName || 'item';
        const indexName = node.settings?.indexName || 'index';
        const delay = node.settings?.delay || 0;
        const maxIterations = node.settings?.maxIterations || 1000;
        const collectResults = node.settings?.collectResults || false;
        
        // Determine if advanced options should be shown initially
        const showAdvanced = node.settings?.maxIterations !== undefined || 
                            node.settings?.collectResults === true;
        
        return `
        <div class="node-content">
            <div class="node-label">Loop Type</div>
            <select class="node-select" style="width: 100%;"
                onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'loopType', this.value);
                          document.getElementById('count-section-${node.id}').style.display = this.value === 'count' ? 'block' : 'none';
                          document.getElementById('array-section-${node.id}').style.display = this.value === 'forEach' ? 'block' : 'none';
                          document.getElementById('condition-section-${node.id}').style.display = this.value === 'while' ? 'block' : 'none';">
                <option value="count" ${loopType === 'count' ? 'selected' : ''}>Count (For Loop)</option>
                <option value="forEach" ${loopType === 'forEach' ? 'selected' : ''}>For Each</option>
                <option value="while" ${loopType === 'while' ? 'selected' : ''}>While</option>
            </select>
            
            <div id="count-section-${node.id}" style="display: ${loopType === 'count' ? 'block' : 'none'}; margin-top: 8px;">
                <div class="node-label">Number of Iterations</div>
                <input type="number" class="node-input" style="width: 100%;"
                    value="${count}"
                    min="1"
                    max="10000"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'count', Math.max(1, parseInt(this.value) || 1))">
            </div>
            
            <div id="array-section-${node.id}" style="display: ${loopType === 'forEach' ? 'block' : 'none'}; margin-top: 8px;">
                <div class="node-label">Array Path (e.g., data.items)</div>
                <input type="text" class="node-input" style="width: 100%;"
                    value="${arrayPath}"
                    placeholder="data.items or leave empty to use input directly"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'arrayPath', this.value)">
            </div>
            
            <div id="condition-section-${node.id}" style="display: ${loopType === 'while' ? 'block' : 'none'}; margin-top: 8px;">
                <div class="node-label">Condition (JavaScript)</div>
                <textarea class="node-input" style="width: 100%; min-height: 60px;"
                    placeholder="index < 10 && !done"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'condition', this.value)">${condition}</textarea>
                <div class="node-label" style="font-size: 0.7rem; margin-top: 4px; color: var(--text-secondary);">
                    Use 'index', 'item', '${indexName}', or '${currentItemName}' in your condition
                </div>
            </div>
            
            <div class="compact-row" style="margin-top: 8px;">
                <div class="node-label" style="margin: 0;">Current Item</div>
                <input type="text" class="node-input flex-grow"
                    value="${currentItemName}"
                    placeholder="item"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'currentItemName', this.value)">
            </div>
            
            <div class="compact-row">
                <div class="node-label" style="margin: 0;">Index</div>
                <input type="text" class="node-input flex-grow"
                    value="${indexName}"
                    placeholder="index"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'indexName', this.value)">
            </div>
            
            <div class="compact-row">
                <div class="node-label" style="margin: 0;">Delay (ms)</div>
                <input type="number" class="node-input flex-grow"
                    value="${delay}"
                    min="0"
                    placeholder="0"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'delay', Math.max(0, parseInt(this.value) || 0))">
            </div>
            
            <div class="advanced-options" id="advanced-options-${node.id}" style="display: ${showAdvanced ? 'block' : 'none'}">
                <div class="compact-row">
                    <div class="node-label" style="margin: 0;">Max Iterations</div>
                    <input type="number" class="node-input flex-grow"
                        value="${maxIterations}"
                        min="1"
                        max="100000"
                        placeholder="1000"
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'maxIterations', Math.max(1, parseInt(this.value) || 1000))">
                </div>
                
                <label class="checkbox-option">
                    <input type="checkbox" 
                        ${collectResults ? 'checked' : ''}
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'collectResults', this.checked)">
                    Collect iteration results
                </label>
            </div>
            
            <div class="option-toggle" 
                onclick="document.getElementById('advanced-options-${node.id}').style.display = document.getElementById('advanced-options-${node.id}').style.display === 'none' ? 'block' : 'none'; this.innerHTML = document.getElementById('advanced-options-${node.id}').style.display === 'none' ? '▼ Show Advanced Options' : '▲ Hide Advanced Options'">
                ${showAdvanced ? '▲ Hide Advanced Options' : '▼ Show Advanced Options'}
            </div>
        </div>
        `;
    },
    
    execute: async (node, input, context) => {
        try {
            // Extract settings
            const loopType = node.settings?.loopType || 'count';
            const count = Math.max(1, parseInt(node.settings?.count) || 5);
            const arrayPath = node.settings?.arrayPath || '';
            const condition = node.settings?.condition || '';
            const currentItemName = node.settings?.currentItemName || 'item';
            const indexName = node.settings?.indexName || 'index';
            const delay = Math.max(0, parseInt(node.settings?.delay) || 0);
            const maxIterations = Math.max(1, parseInt(node.settings?.maxIterations) || 1000);
            const collectResults = node.settings?.collectResults || false;
            
            // Get flow builder for connections
            const flowBuilder = context.flowBuilder;
            
            // Find the nodes connected to our outputs
            const iterationConnections = Array.from(flowBuilder.connections.values())
                .filter(conn => conn.sourceNode === node.id && conn.sourcePort === 0);
                
            const completionConnections = Array.from(flowBuilder.connections.values())
                .filter(conn => conn.sourceNode === node.id && conn.sourcePort === 1);
            
            // Get the node element for updating visual feedback
            const nodeElement = document.getElementById(node.id);
            const iterationCounter = nodeElement?.querySelector('.loop-iteration-counter');
            const progressBar = nodeElement?.querySelector('.loop-progress-bar');
            
            // Initialize time tracking
            const startTime = Date.now();
            let lastHeartbeat = startTime;
            const HEARTBEAT_INTERVAL = 5000; // 5 seconds
            
            // Function to execute the iteration nodes
            async function executeIterationNodes(iterationData, index, total) {
                // Update iteration counter
                if (iterationCounter) {
                    iterationCounter.textContent = `Iterations: ${index + 1}`;
                }
                
                // Update progress bar for count and forEach loops
                if (progressBar && (loopType === 'count' || loopType === 'forEach') && total) {
                    const progress = ((index + 1) / total) * 100;
                    progressBar.style.width = `${Math.min(progress, 100)}%`;
                }
                
                // Execute all connected nodes
                const results = [];
                for (const connection of iterationConnections) {
                    const result = await flowBuilder.executeNode(
                        connection.targetNode,
                        iterationData,
                        new Set()
                    ).catch(error => {
                        console.error(`Error in loop iteration:`, error);
                        throw error; // Re-throw to stop the loop
                    });
                    
                    if (collectResults) {
                        results.push(result);
                    }
                }
                
                // Add delay between iterations if specified
                if (delay > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
                // Send a heartbeat log message for long-running loops
                const now = Date.now();
                if (now - lastHeartbeat > HEARTBEAT_INTERVAL) {
                    flowBuilder.log('info', `Loop still running: ${index + 1} iterations completed`, node.id);
                    lastHeartbeat = now;
                    
                    // Check execution time - warn if taking too long
                    const elapsedSeconds = (now - startTime) / 1000;
                    if (elapsedSeconds > 30) {
                        flowBuilder.log('warning', 
                            `Loop has been running for ${Math.floor(elapsedSeconds)} seconds. ` +
                            `Consider adding a delay or reducing iterations.`, node.id);
                    }
                }
                
                return results;
            }
            
            // Context to store loop state
            const loopContext = {
                input,
                index: 0,
                item: null,
                results: []
            };
            
            // Initialize variables for detecting infinite loops
            let iterations = 0;
            let previousConditionValues = [];
            const MAX_REPEATED_CONDITIONS = 10; // Number of identical condition results to check
            
            // Different loop behavior based on type
            if (loopType === 'count') {
                // Simple count loop
                if (count > maxIterations) {
                    flowBuilder.log('warning', `Limiting count loop to ${maxIterations} iterations (from ${count})`, node.id);
                }
                
                const actualCount = Math.min(count, maxIterations);
                
                for (let i = 0; i < actualCount; i++) {
                    // Return if flow is stopped
                    if (!flowBuilder.activationManager?.isActive()) {
                        flowBuilder.log('info', `Loop stopped after ${i} iterations - flow deactivated`, node.id);
                        break;
                    }
                    
                    loopContext.index = i;
                    loopContext[indexName] = i;
                    
                    // Execute the iteration branch
                    const results = await executeIterationNodes(loopContext, i, actualCount);
                    if (collectResults) {
                        loopContext.results.push(...results);
                    }
                }
                
                flowBuilder.log('success', `Loop completed after ${Math.min(count, actualCount)} iterations`, node.id);
            }
            else if (loopType === 'forEach') {
                // For each loop over an array
                let array = [];
                
                // Try to extract the array from the input path
                if (arrayPath) {
                    try {
                        // Navigate through the path to get the array
                        let current = input;
                        const pathParts = arrayPath.split('.');
                        
                        for (const part of pathParts) {
                            if (current && typeof current === 'object') {
                                current = current[part];
                            } else {
                                current = undefined;
                                break;
                            }
                        }
                        
                        if (Array.isArray(current)) {
                            array = current;
                        } else {
                            throw new Error(`Path '${arrayPath}' does not point to an array`);
                        }
                    } catch (error) {
                        throw new Error(`Failed to access array at path '${arrayPath}': ${error.message}`);
                    }
                } 
                // If no path is specified, try to use the input directly
                else if (Array.isArray(input)) {
                    array = input;
                } else {
                    throw new Error('Input is not an array and no valid array path provided');
                }
                
                // Check array size against max iterations
                if (array.length > maxIterations) {
                    flowBuilder.log('warning', `Array has ${array.length} items, limiting to ${maxIterations} iterations`, node.id);
                    array = array.slice(0, maxIterations);
                }
                
                // Loop through the array
                for (let i = 0; i < array.length; i++) {
                    // Return if flow is stopped
                    if (!flowBuilder.activationManager?.isActive()) {
                        flowBuilder.log('info', `Loop stopped after ${i} iterations - flow deactivated`, node.id);
                        break;
                    }
                    
                    const item = array[i];
                    loopContext.index = i;
                    loopContext[indexName] = i;
                    loopContext.item = item;
                    loopContext[currentItemName] = item;
                    
                    // Execute the iteration branch
                    const results = await executeIterationNodes(loopContext, i, array.length);
                    if (collectResults) {
                        loopContext.results.push(...results);
                    }
                }
                
                flowBuilder.log('success', `Loop completed after ${array.length} iterations`, node.id);
            }
            else if (loopType === 'while') {
                // While loop with a condition
                if (!condition) {
                    throw new Error('No condition provided for while loop');
                }
                
                // Create a function to evaluate the condition, with better error handling
                const evaluateCondition = (data) => {
                    try {
                        // Create a function with all potential variables in scope
                        return new Function(
                            'input', 'index', 'item', indexName, currentItemName,
                            `try {
                                return Boolean(${condition});
                            } catch (e) {
                                throw new Error("Condition evaluation error: " + e.message);
                            }`
                        )(
                            data.input, 
                            data.index, 
                            data.item,
                            data.index,
                            data.item
                        );
                    } catch (error) {
                        throw new Error(`Error in condition: ${error.message}`);
                    }
                };
                
                iterations = 0;
                previousConditionValues = [];
                
                // Execute loop while condition is true
                while (true) {
                    // Return if flow is stopped
                    if (!flowBuilder.activationManager?.isActive()) {
                        flowBuilder.log('info', `Loop stopped after ${iterations} iterations - flow deactivated`, node.id);
                        break;
                    }
                    
                    // Safety check for max iterations
                    if (iterations >= maxIterations) {
                        flowBuilder.log('warning', `Loop reached maximum iterations limit (${maxIterations})`, node.id);
                        break;
                    }
                    
                    // Evaluate the condition
                    let conditionResult;
                    try {
                        conditionResult = evaluateCondition(loopContext);
                        
                        // Add to history and check for identical repeated conditions
                        previousConditionValues.push(JSON.stringify({
                            result: conditionResult,
                            index: loopContext.index,
                            item: loopContext.item
                        }));
                        
                        // Keep history limited
                        if (previousConditionValues.length > MAX_REPEATED_CONDITIONS) {
                            previousConditionValues.shift();
                        }
                        
                        // Check for identical repeated conditions (potential infinite loop)
                        if (previousConditionValues.length === MAX_REPEATED_CONDITIONS) {
                            const allIdentical = previousConditionValues.every(
                                val => val === previousConditionValues[0]
                            );
                            
                            if (allIdentical && conditionResult === true && iterations > MAX_REPEATED_CONDITIONS * 2) {
                                throw new Error(
                                    `Potential infinite loop detected: condition remains true with same values ` +
                                    `for ${MAX_REPEATED_CONDITIONS} consecutive iterations`
                                );
                            }
                        }
                        
                        // Exit loop if condition is false
                        if (!conditionResult) break;
                    } catch (error) {
                        throw new Error(`Error evaluating condition: ${error.message}`);
                    }
                    
                    // Execute the iteration branch
                    const results = await executeIterationNodes(loopContext, iterations);
                    if (collectResults) {
                        loopContext.results.push(...results);
                    }
                    
                    // Increment index
                    loopContext.index++;
                    loopContext[indexName] = loopContext.index;
                    iterations++;
                }
                
                flowBuilder.log('success', `Loop completed after ${iterations} iterations`, node.id);
            }
            
            // Prepare output data
            const outputData = collectResults ? 
                { ...input, results: loopContext.results } : input;
            
            // After loop completes, execute the completion connections
            for (const connection of completionConnections) {
                await flowBuilder.executeNode(
                    connection.targetNode,
                    outputData, // Pass results if collected, otherwise original input
                    new Set()
                ).catch(error => {
                    console.error(`Error in loop completion:`, error);
                });
            }
            
            // Return with collected results if enabled
            return outputData;
        } catch (error) {
            // Log error and re-throw
            context.flowBuilder.log('error', `Loop error: ${error.message}`, node.id);
            throw new Error(`Loop execution failed: ${error.message}`);
        }
    }
};