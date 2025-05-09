/**
 * Randomizer Node Module
 * Generates random numbers and strings with configurable options
 *
 * @module RandomizerNode
 */
export default {
    /**
     * Node Configuration
     */
    title: 'Randomizer',
    icon: '🎲',
    category: 'Data & Files',
    color: '#3b82f6',
    inputs: 1,
    outputs: 1,
    
    /**
     * Default node settings
     * @type {Object}
     * @property {string} inputHandling - How to handle input (ignore/append)
     * @property {string} outputType - Type of output (Number/String)
     * @property {number} numberMin - Minimum value for numbers
     * @property {number} numberMax - Maximum value for numbers
     * @property {boolean} numberIsInteger - Whether to generate integers only
     * @property {number} stringLength - Length of generated strings
     * @property {string} stringCharSet - Character set for strings
     * @property {string} stringCustomChars - Custom characters for generation
     */
    defaultSettings: {
        inputHandling: 'ignore',
        outputType: 'Number',
        numberMin: 0,
        numberMax: 100,
        numberIsInteger: true,
        stringLength: 10,
        stringCharSet: 'alphanumeric',
        stringCustomChars: ''
    },
    
    // Add help documentation
    help: {
        title: "Randomizer",
        description: "Generates random numbers or strings that can be used for testing, creating sample data, or introducing variability to your flows.",
        sections: [
            {
                title: "Basic Usage",
                content: "Select the type of random data to generate (Number or String) and configure the settings accordingly. The randomizer will produce a new random value each time it executes."
            },
            {
                title: "Number Generation",
                content: "Min & Max Values: Set the range for generated numbers\nType: Choose between integers (whole numbers) or floats (decimal numbers)\n\nExample uses: Random IDs, simulated metrics, test values, dice rolls"
            },
            {
                title: "String Generation",
                content: "Length: Number of characters to generate\nCharacter Set: Choose from alphanumeric (letters & numbers), letters only, numbers only, or custom characters\n\nExample uses: Random codes, passwords, IDs, test data"
            },
            {
                title: "Input Handling",
                content: "Ignore Input: Generates a standalone random value, ignoring any incoming data\nAppend to Input: Adds the random value to the end of the incoming data (useful for adding random suffixes)"
            }
        ]
    },
    
    /**
     * Formats log messages for randomizer operations
     * @param {string} message - The message to format
     * @param {string} type - Message type (success/error)
     * @param {Object} node - Node instance
     * @returns {string} Formatted message with generated value
     */
    formatLogMessage: (message, type, node) => {
        const outputType = node.settings?.outputType || 'Number';
        
        if (type === 'success') {
            // For success messages, add output type
            if (typeof message === 'string' && message.length > 100) {
                return `[${outputType} Randomizer] Generated: ${message.substring(0, 100)}...`;
            }
            return `[${outputType} Randomizer] Generated: ${message}`;
        }
        
        return message;
    },
    
    /**
     * Sets up visual feedback for randomizer execution
     * @param {HTMLElement} element - Node's DOM element
     * @param {Object} node - Node instance
     */
    onExecutionStart: (element, node) => {
        // Add visual feedback for randomizer execution
        const diceElement = document.createElement('div');
        diceElement.className = 'randomizer-dice';
        diceElement.textContent = '🎲';
        diceElement.style.position = 'absolute';
        diceElement.style.top = '10px';
        diceElement.style.right = '10px';
        diceElement.style.fontSize = '20px';
        diceElement.style.animation = 'dice-roll 0.8s ease-in-out';
        
        // Add animation if not already exists
        if (!document.getElementById('randomizer-animations')) {
            const style = document.createElement('style');
            style.id = 'randomizer-animations';
            style.textContent = `
                @keyframes dice-roll {
                    0% { transform: rotate(0deg); opacity: 0.3; }
                    25% { transform: rotate(90deg) scale(1.2); opacity: 0.6; }
                    50% { transform: rotate(180deg) scale(1.5); opacity: 0.9; }
                    75% { transform: rotate(270deg) scale(1.2); opacity: 0.6; }
                    100% { transform: rotate(360deg); opacity: 0.3; }
                }
            `;
            document.head.appendChild(style);
        }
        
        const nodeContent = element.querySelector('.node-content');
        if (nodeContent) {
            nodeContent.appendChild(diceElement);
        }
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Remove the dice animation
        const diceElement = element.querySelector('.randomizer-dice');
        if (diceElement) {
            diceElement.remove();
        }
        
        // Standard success/error handling
        if (success) {
            setTimeout(() => element.classList.remove('success'), 1000);
        } else {
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    /**
     * Creates the node's UI content with randomizer options
     * @param {Object} node - Node instance
     * @returns {string} HTML content for randomizer configuration
     */
    createContent: (node) => {
        const nodeStyleId = `randomizer-node-style-${node.id}`;
        
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
                min-height: unset;
                margin-bottom: 0.5rem;
            }
        `;
        document.head.appendChild(styleEl);
        
        const inputHandling = node.settings?.inputHandling || 'ignore';
        const outputType = node.settings?.outputType || 'Number';
        const numberDisplay = outputType === 'Number' ? 'block' : 'none';
        const stringDisplay = outputType === 'String' ? 'block' : 'none';
        const charSet = node.settings?.stringCharSet || 'alphanumeric';
        const customDisplay = charSet === 'custom' ? 'block' : 'none';

        return `
<div class="node-content">
<!-- Input Handling Dropdown -->
<div class="node-label">Input Handling</div>
<select class="node-select" 
    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'inputHandling', this.value)">
    <option value="ignore" ${inputHandling === 'ignore' ? 'selected' : ''}>Ignore Input</option>
    <option value="append" ${inputHandling === 'append' ? 'selected' : ''}>Append to Input</option>
</select>

<!-- Output Type Selection -->
<div class="node-label">Output Type</div>
<select class="node-select" 
    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'outputType', this.value);
              document.getElementById('number-settings-${node.id}').style.display = this.value === 'Number' ? 'block' : 'none';
              document.getElementById('string-settings-${node.id}').style.display = this.value === 'String' ? 'block' : 'none';">
    <option value="Number" ${outputType === 'Number' ? 'selected' : ''}>Number</option>
    <option value="String" ${outputType === 'String' ? 'selected' : ''}>String</option>
</select>

<!-- Number Settings -->
<div id="number-settings-${node.id}" style="display: ${numberDisplay}">
    <div class="node-label">Minimum Value</div>
    <input type="number" class="node-input"
        value="${node.settings?.numberMin || 0}"
        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'numberMin', parseFloat(this.value))">
    
    <div class="node-label">Maximum Value</div>
    <input type="number" class="node-input"
        value="${node.settings?.numberMax || 100}"
        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'numberMax', parseFloat(this.value))">
    
    <div class="node-label">Type</div>
    <select class="node-select" 
        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'numberIsInteger', this.value === 'Integer')">
        <option value="Integer" ${node.settings?.numberIsInteger !== false ? 'selected' : ''}>Integer</option>
        <option value="Float" ${node.settings?.numberIsInteger === false ? 'selected' : ''}>Float</option>
    </select>
</div>

<!-- String Settings -->
<div id="string-settings-${node.id}" style="display: ${stringDisplay}">
    <div class="node-label">Length</div>
    <input type="number" class="node-input"
        value="${node.settings?.stringLength || 10}"
        min="1"
        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'stringLength', parseInt(this.value))">
    
    <div class="node-label">Character Set</div>
    <select class="node-select" 
        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'stringCharSet', this.value);
                  document.getElementById('custom-chars-${node.id}').style.display = this.value === 'custom' ? 'block' : 'none';">
        <option value="alphanumeric" ${charSet === 'alphanumeric' ? 'selected' : ''}>Alphanumeric</option>
        <option value="letters" ${charSet === 'letters' ? 'selected' : ''}>Letters</option>
        <option value="numbers" ${charSet === 'numbers' ? 'selected' : ''}>Numbers</option>
        <option value="custom" ${charSet === 'custom' ? 'selected' : ''}>Custom</option>
    </select>
    
    <div id="custom-chars-${node.id}" style="display: ${customDisplay}">
        <div class="node-label">Custom Characters</div>
        <input type="text" class="node-input"
            value="${node.settings?.stringCustomChars || ''}"
            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'stringCustomChars', this.value)"
            placeholder="Enter characters to use">
    </div>
</div>
</div>
`;
    },
    /**
     * Executes the randomizer operation
     * @param {Object} node - Node instance
     * @param {*} input - Input data
     * @param {Object} context - Execution context
     * @returns {Promise<string|number>} Generated random value
     * @throws {Error} If randomization fails
     */
    execute: async (node, input, context) => {
        try {
            const inputHandling = node.settings?.inputHandling || 'ignore';
            const outputType = node.settings?.outputType || 'Number';

            // Helper function to generate random output
            /**
             * Generates random output based on settings
             * @returns {string|number} Generated random value
             * @throws {Error} If generation settings are invalid
             */
            const generateRandomOutput = () => {
                if (outputType === 'Number') {
                    const min = parseFloat(node.settings?.numberMin) || 0;
                    const max = parseFloat(node.settings?.numberMax) || 100;
                    const isInteger = node.settings?.numberIsInteger !== false;

                    if (min > max) {
                        throw new Error('Minimum value cannot be greater than maximum value');
                    }

                    if (isInteger) {
                        return Math.floor(Math.random() * (max - min + 1)) + min;
                    } else {
                        return Math.random() * (max - min) + min;
                    }
                } else if (outputType === 'String') {
                    const length = parseInt(node.settings?.stringLength) || 10;
                    const charSet = node.settings?.stringCharSet || 'alphanumeric';

                    if (length < 1) {
                        throw new Error('String length must be at least 1');
                    }

                    let chars;
                    switch (charSet) {
                        case 'alphanumeric':
                            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            break;
                        case 'letters':
                            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
                            break;
                        case 'numbers':
                            chars = '0123456789';
                            break;
                        case 'custom':
                            chars = node.settings?.stringCustomChars || '';
                            if (!chars) {
                                throw new Error('Custom characters must be provided');
                            }
                            break;
                        default:
                            chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    }

                    let result = '';
                    for (let i = 0; i < length; i++) {
                        const randomIndex = Math.floor(Math.random() * chars.length);
                        result += chars[randomIndex];
                    }
                    return result;
                } else {
                    throw new Error('Invalid output type');
                }
            };

            // Handle input based on the inputHandling setting
            if (inputHandling === 'append') {
                const inputStr = input != null ? String(input) : ''; // Convert input to string, or empty if null
                const randomOutput = generateRandomOutput();
                const randomStr = String(randomOutput); // Convert random output to string
                return inputStr + randomStr; // Concatenate
            } else {
                return generateRandomOutput(); // Ignore input and generate output
            }
        } catch (error) {
            // Re-throw with formatted error message
            throw new Error(`Randomizer error: ${error.message}`);
        }
    }
};