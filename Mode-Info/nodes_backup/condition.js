/**
 * Condition Node Module
 * Routes flow based on evaluating conditions against input data
 */
export default {
    /**
     * Node Configuration
     */
    title: 'Condition',
    icon: '⚡',
    category: 'Basic',
    color: '#ec4899', // Direct hex value for consistent styling
    inputs: 1,
    outputs: 2, // Two outputs: True and False paths
    outputLabels: ['True', 'False'],
    
    /**
     * Default settings for the condition node
     */
    defaultSettings: {
        conditionType: 'equals', // Default comparison type
        value: '', // Value to compare against
        customCode: '', // Custom JavaScript condition
        caseSensitive: true, // Case sensitivity for string operations
        targetProperty: '' // Dot notation path to target property
    },


    help: {
        title: "Condition Node",
        description: "Routes the flow based on evaluating conditions. Sends input to one of two outputs (True or False) depending on whether the condition evaluates to true or false.",
        sections: [
            {
                title: "Basic Usage",
                content: "Connect the Condition node between nodes where you want to create branching logic. The input will be evaluated according to your condition settings, and then routed to either the True output (if condition is met) or False output (if condition is not met)."
            },
            {
                title: "Condition Types",
                content: "Equals: Checks if values match exactly\nContains: Checks if one string contains another\nStarts/Ends With: Checks if a string begins or ends with specific text\nGreater/Less Than: Compares numeric values\nExists: Checks if a value exists and isn't empty\nMatches Regex: Uses regular expressions for pattern matching\nCustom Code: Write your own JavaScript condition"
            },
            {
                title: "Target Property",
                content: "By default, conditions are evaluated against the entire input. Use Target Property to check a specific property within your data structure.\n\nExamples:\n- Check user.name instead of the entire user object\n- Access nested data with dot notation: response.data.items[0].status"
            },
            {
                title: "Tips & Best Practices",
                content: "For text comparisons, use Case Sensitive option to control exact matching\nFor complex conditions, use Custom Code and write JavaScript that returns true or false\nWhen working with API responses, use Target Property to navigate to the specific data you need\nCreate multiple branches by chaining condition nodes together"
            }
        ]
    },

    
    /**
     * Format log messages with condition type information
     * @param {string} message - The log message
     * @param {string} type - Message type (info, error, etc)
     * @param {Object} node - The node instance
     * @returns {string} Formatted message
     */
    formatLogMessage: (message, type, node) => {
        // For condition nodes, add the condition type to log messages
        if (type === 'info' && message.includes('Condition evaluated')) {
            return `[${node.settings?.conditionType || 'equals'}] ${message}`;
        }
        return message;
    },
    
    /**
     * Handle execution start event
     * Adds visual feedback when condition evaluation begins
     * @param {HTMLElement} element - Node's DOM element
     * @param {Object} node - Node instance
     */
    onExecutionStart: (element, node) => {
        // Highlight the condition being evaluated
        const container = element.querySelector('#comparison-container-' + node.id) || 
                          element.querySelector('#custom-code-container-' + node.id);
        if (container) {
            container.style.backgroundColor = 'rgba(236, 72, 153, 0.1)';
        }
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Remove highlight
        const containers = element.querySelectorAll('[id$="-container-' + node.id + '"]');
        containers.forEach(container => {
            container.style.backgroundColor = '';
        });
        
        // Based on which path was taken, highlight the corresponding output connector
        if (success) {
            // Find which output to highlight based on the result
            const outputIndex = result === true ? 0 : 1;
            const outputConnector = element.querySelector(`.connector.output[data-index="${outputIndex}"]`);
            
            if (outputConnector) {
                // Add pulse effect to the selected output
                outputConnector.style.animation = 'connector-pulse 1s ease';
                setTimeout(() => {
                    outputConnector.style.animation = '';
                }, 1000);
            }
            
            setTimeout(() => element.classList.remove('success'), 1000);
        } else {
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    /**
     * Create the node's UI content
     * Generates HTML and CSS for the condition node interface
     * @param {Object} node - Node instance containing settings and ID
     * @returns {string} HTML content for the node
     */
    createContent: (node) => {
        const nodeStyleId = `condition-node-style-${node.id}`;

        // Remove any existing style for this node to avoid duplicates
        if (document.getElementById(nodeStyleId)) {
            document.getElementById(nodeStyleId).remove();
        }

        // Create and append the style element to the document head
        const styleEl = document.createElement('style');
        styleEl.id = nodeStyleId;
        styleEl.textContent = `
            #${node.id} .connector.output[data-index="0"]::after {
                content: "True";
                position: absolute;
                bottom: -18px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 10px;
                color: var(--success-color);
                white-space: nowrap;
                pointer-events: none;
            }
            
            #${node.id} .connector.output[data-index="1"]::after {
                content: "False";
                position: absolute;
                bottom: -18px;
                left: 50%;
                transform: translateX(-50%);
                font-size: 10px;
                color: var(--error-color);
                white-space: nowrap;
                pointer-events: none;
            }
            
            /* Add animation for connector highlighting */
            @keyframes connector-pulse {
                0% { transform: translateX(-50%) scale(1); box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4); }
                50% { transform: translateX(-50%) scale(1.3); box-shadow: 0 0 0 5px rgba(236, 72, 153, 0); }
                100% { transform: translateX(-50%) scale(1); box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
            }
        `;
        document.head.appendChild(styleEl);

        // Return the node's content HTML
        return `
        <div class="node-content">
            <div class="node-label">Condition Type</div>
            <select class="node-select" 
                onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'conditionType', this.value);
                         document.getElementById('custom-code-container-${node.id}').style.display = this.value === 'custom' ? 'block' : 'none';
                         document.getElementById('comparison-container-${node.id}').style.display = this.value !== 'custom' ? 'block' : 'none';">
                <option value="equals" ${(node.settings?.conditionType === 'equals' || !node.settings?.conditionType) ? 'selected' : ''}>Equals</option>
                <option value="contains" ${node.settings?.conditionType === 'contains' ? 'selected' : ''}>Contains</option>
                <option value="startsWith" ${node.settings?.conditionType === 'startsWith' ? 'selected' : ''}>Starts With</option>
                <option value="endsWith" ${node.settings?.conditionType === 'endsWith' ? 'selected' : ''}>Ends With</option>
                <option value="greaterThan" ${node.settings?.conditionType === 'greaterThan' ? 'selected' : ''}>Greater Than</option>
                <option value="lessThan" ${node.settings?.conditionType === 'lessThan' ? 'selected' : ''}>Less Than</option>
                <option value="exists" ${node.settings?.conditionType === 'exists' ? 'selected' : ''}>Exists / Not Empty</option>
                <option value="matches" ${node.settings?.conditionType === 'matches' ? 'selected' : ''}>Matches Regex</option>
                <option value="custom" ${node.settings?.conditionType === 'custom' ? 'selected' : ''}>Custom Code</option>
            </select>
            
            <div id="comparison-container-${node.id}" style="display: ${node.settings?.conditionType !== 'custom' ? 'block' : 'none'}">
                <div class="node-label" style="margin-top: 10px;">Target Property (optional)</div>
                <input type="text" class="node-input" 
                    value="${node.settings?.targetProperty || ''}"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'targetProperty', this.value)"
                    placeholder="e.g. user.name or leave empty for entire input">
                
                <div class="node-label" style="margin-top: 10px; ${node.settings?.conditionType === 'exists' ? 'display:none' : ''}">Compare With</div>
                <input type="text" class="node-input" 
                    style="${node.settings?.conditionType === 'exists' ? 'display:none' : ''}"
                    value="${node.settings?.value || ''}"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'value', this.value)"
                    placeholder="Value to compare against">
                
                <label style="display: ${['equals', 'contains', 'startsWith', 'endsWith'].includes(node.settings?.conditionType || 'equals') ? 'block' : 'none'}; margin-top: 10px;">
                    <input type="checkbox" 
                        ${node.settings?.caseSensitive !== false ? 'checked' : ''}
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'caseSensitive', this.checked)">
                    Case Sensitive
                </label>
            </div>
            
            <div id="custom-code-container-${node.id}" style="display: ${node.settings?.conditionType === 'custom' ? 'block' : 'none'}">
                <div class="node-label" style="margin-top: 10px;">Custom JavaScript Condition</div>
                <textarea class="node-input" style="min-height: 100px;"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'customCode', this.value)"
                    placeholder="return input.length > 10;"
                >${node.settings?.customCode || ''}</textarea>
                <div class="node-label" style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 5px;">
                    Use "input" variable and return true/false
                </div>
            </div>
        </div>
        `;
    },
    
    /**
     * Execute the condition node's logic
     * Evaluates conditions and routes flow accordingly
     * @param {Object} node - Node instance with settings
     * @param {*} input - Input data to evaluate
     * @param {Object} context - Execution context
     * @returns {*} Original input (passed through unchanged)
     * @throws {Error} If condition evaluation fails
     */
    execute: async (node, input, context) => {
        try {
            const conditionType = node.settings?.conditionType || 'equals';
            const targetProperty = node.settings?.targetProperty || '';
            const compareValue = node.settings?.value || '';
            const caseSensitive = node.settings?.caseSensitive !== false;

            // Get the value to check
            let valueToCheck = input;

            // If target property is specified, extract it
            if (targetProperty) {
                try {
                    // Split by dots to handle nested properties
                    const props = targetProperty.split('.');
                    let current = input;

                    for (const prop of props) {
                        if (current === null || current === undefined) {
                            valueToCheck = undefined;
                            break;
                        }
                        current = current[prop];
                    }

                    valueToCheck = current;
                } catch (error) {
                    console.error(`Error extracting property ${targetProperty}:`, error);
                    valueToCheck = undefined;
                }
            }

            let result = false;

            if (conditionType === 'custom') {
                const customCode = node.settings?.customCode || '';
                const conditionFn = new Function('input', `
                    "use strict";
                    try {
                        return Boolean(${customCode || 'false'});
                    } catch (error) {
                        throw new Error(\`Custom condition evaluation failed: \${error.message}\`);
                    }
                `);

                result = conditionFn(input);
            } else {
                // For string operations, ensure strings
                const strValueToCheck = String(valueToCheck || '');
                const strCompareValue = String(compareValue || '');

                // For numeric operations, convert to numbers
                const numValueToCheck = Number(valueToCheck);
                const numCompareValue = Number(compareValue);

                switch (conditionType) {
                    case 'equals':
                        if (typeof valueToCheck === 'string' && typeof compareValue === 'string') {
                            // String comparison
                            if (caseSensitive) {
                                result = strValueToCheck === strCompareValue;
                            } else {
                                result = strValueToCheck.toLowerCase() === strCompareValue.toLowerCase();
                            }
                        } else {
                            // Other types comparison
                            result = valueToCheck == compareValue;
                        }
                        break;

                    case 'contains':
                        if (caseSensitive) {
                            result = strValueToCheck.includes(strCompareValue);
                        } else {
                            result = strValueToCheck.toLowerCase().includes(strCompareValue.toLowerCase());
                        }
                        break;

                    case 'startsWith':
                        if (caseSensitive) {
                            result = strValueToCheck.startsWith(strCompareValue);
                        } else {
                            result = strValueToCheck.toLowerCase().startsWith(strCompareValue.toLowerCase());
                        }
                        break;

                    case 'endsWith':
                        if (caseSensitive) {
                            result = strValueToCheck.endsWith(strCompareValue);
                        } else {
                            result = strValueToCheck.toLowerCase().endsWith(strCompareValue.toLowerCase());
                        }
                        break;

                    case 'greaterThan':
                        result = !isNaN(numValueToCheck) && !isNaN(numCompareValue) && numValueToCheck > numCompareValue;
                        break;

                    case 'lessThan':
                        result = !isNaN(numValueToCheck) && !isNaN(numCompareValue) && numValueToCheck < numCompareValue;
                        break;

                    case 'exists':
                        result = valueToCheck !== undefined &&
                            valueToCheck !== null &&
                            valueToCheck !== '' &&
                            !(Array.isArray(valueToCheck) && valueToCheck.length === 0) &&
                            !(typeof valueToCheck === 'object' && Object.keys(valueToCheck).length === 0);
                        break;

                    case 'matches':
                        try {
                            const regex = new RegExp(strCompareValue, caseSensitive ? '' : 'i');
                            result = regex.test(strValueToCheck);
                        } catch (error) {
                            throw new Error(`Invalid regex pattern: ${error.message}`);
                        }
                        break;
                }
            }

            // Set which output to follow (0 for true, 1 for false)
            context.outputIndex = result ? 0 : 1;

            // Log the condition result for debugging
            context.flowBuilder.log(
                'info',
                `Condition evaluated to: ${result ? 'TRUE' : 'FALSE'}`,
                node.id
            );

            // Return input unchanged
            return input;
        } catch (error) {
            throw new Error(`Condition failed: ${error.message}`);
        }
    }
};