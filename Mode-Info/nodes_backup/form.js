/**
 * Form Builder Node Module
 * Creates and manages web-based data collection forms with real-time submission handling
 *
 * @module FormBuilderNode
 */

export default {
    /**
     * Node Configuration
     */
    title: 'Form Builder',
    icon: '📝',
    category: 'Triggers',
    color: '#8b5cf6', // Purple theme color
    inputs: 0, // No inputs - acts as flow trigger
    outputs: 1, // Outputs form submissions
    
    /**
     * Default node settings
     * @type {Object}
     * @property {string} subdomain - Custom subdomain for form hosting
     * @property {string} title - Form title displayed to users
     * @property {string} description - Optional form description
     * @property {string} submitButtonText - Custom submit button text
     * @property {Array} fields - Form field definitions
     * @property {string} formStyle - Visual theme (default/minimal/dark/colorful)
     * @property {boolean} storeSubmissions - Whether to store submissions in Puter
     * @property {boolean} notifyOnSubmit - Enable submission notifications
     * @property {number} lastSubmissionId - Tracks last processed submission
     */
    defaultSettings: {
        subdomain: '',
        title: 'Data Collection Form',
        description: '',
        submitButtonText: 'Submit',
        fields: [],
        formStyle: 'default',
        storeSubmissions: true,
        notifyOnSubmit: true,
        lastSubmissionId: 0
    },
    
    // Help documentation
    help: {
        title: "Form Builder",
        description: "Creates a web form hosted on a Puter subdomain that can collect data and feed it into your automation flow.",
        sections: [
            {
                title: "Basic Setup",
                content: "1. Add this node to your flow\n2. Configure a subdomain for your form\n3. Add the fields you want to collect\n4. Start your flow to activate the form\n\nWhen users submit the form, the data will be passed to the next node in your flow."
            },
            {
                title: "Data Format",
                content: "Form submissions will provide data in this structure:\n\n```\n{\n  \"formId\": \"form-123\",\n  \"submission\": {\n    \"name\": \"John Doe\",\n    \"email\": \"john@example.com\",\n    ...(all form fields)\n  },\n  \"submittedAt\": \"2025-05-01T14:23:42Z\"\n}\n```\n\nAccess fields using: `input.submission.fieldName`"
            },
            {
                title: "Working with Submissions",
                content: "Extract a specific field:\n`return input.submission.email;`\n\nCheck submission values:\n`return input.submission.department === 'Sales';`\n\nFormat data for email:\n`return 'New contact: ' + input.submission.name + ' - ' + input.submission.email;`"
            },
            {
                title: "Important Notes",
                content: "- The form only accepts submissions when your flow is running\n- Subdomain must be unique or one you already own\n- Form submissions are stored in Puter's cloud storage\n- For privacy compliance, only collect necessary information"
            }
        ]
    },
    
    /**
     * Formats log messages for form operations
     * @param {string} message - The message to format
     * @param {string} type - Message type (info, success, error)
     * @param {Object} node - Node instance
     * @returns {string} Formatted message with submission details
     */
    formatLogMessage: (message, type, node) => {
        if (type === 'info' && message.includes('Executing')) {
            return `Form node activated and waiting for submissions...`;
        }
        
        if (type === 'success' && message.includes('Form submission')) {
            // Format submission notification
            try {
                const data = JSON.parse(message.replace('Form submission: ', ''));
                const fields = Object.keys(data.submission).map(key => 
                    `${key}: ${String(data.submission[key]).substring(0, 30)}`
                ).join(', ');
                
                return `Form Submission Received: ${fields}`;
            } catch (e) {
                return message;
            }
        }
        
        return message;
    },
    
    /**
     * Handles form node execution start
     * Sets up form monitoring and visual indicators
     * @param {HTMLElement} element - Node's DOM element
     * @param {Object} node - Node instance
     */
    onExecutionStart: (element, node) => {
        // Update form status
        updateFormStatus(node.settings?.subdomain, true)
            .then(() => {
                console.log('Form activated:', node.settings?.subdomain);
            })
            .catch(error => {
                console.error('Error activating form:', error);
            });
        
        // Add active indicator
        const activeIndicator = document.createElement('div');
        activeIndicator.className = 'form-active-indicator';
        activeIndicator.style.position = 'absolute';
        activeIndicator.style.top = '10px';
        activeIndicator.style.right = '10px';
        activeIndicator.style.display = 'flex';
        activeIndicator.style.alignItems = 'center';
        activeIndicator.style.gap = '5px';
        
        const statusDot = document.createElement('div');
        statusDot.style.width = '8px';
        statusDot.style.height = '8px';
        statusDot.style.borderRadius = '50%';
        statusDot.style.backgroundColor = '#22c55e'; // Green
        statusDot.style.animation = 'pulse-green 2s infinite';
        
        const statusText = document.createElement('div');
        statusText.textContent = 'Form Active';
        statusText.style.fontSize = '11px';
        statusText.style.color = '#22c55e';
        
        // Add pulse animation if not exists
        if (!document.getElementById('form-node-animations')) {
            const style = document.createElement('style');
            style.id = 'form-node-animations';
            style.textContent = `
                @keyframes pulse-green {
                    0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        activeIndicator.appendChild(statusDot);
        activeIndicator.appendChild(statusText);
        
        const nodeContent = element.querySelector('.node-content');
        if (nodeContent) {
            nodeContent.appendChild(activeIndicator);
        }
        
        // Set up submission polling
        element.submissionCheckInterval = setInterval(() => {
            checkForNewSubmissions(node)
                .then(submissions => {
                    if (submissions && submissions.length > 0) {
                        // Process new submissions
                        processSubmissions(node, submissions, element, context.flowBuilder);
                    }
                })
                .catch(error => {
                    console.error('Error checking for submissions:', error);
                });
        }, 3000); // Check every 3 seconds
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Clear submission check interval
        if (element.submissionCheckInterval) {
            clearInterval(element.submissionCheckInterval);
            delete element.submissionCheckInterval;
        }
        
        // Update form status
        updateFormStatus(node.settings?.subdomain, false)
            .then(() => {
                console.log('Form deactivated:', node.settings?.subdomain);
            })
            .catch(error => {
                console.error('Error deactivating form:', error);
            });
        
        // Remove active indicator
        const activeIndicator = element.querySelector('.form-active-indicator');
        if (activeIndicator) {
            activeIndicator.remove();
        }
        
        // Add inactive indicator
        const inactiveIndicator = document.createElement('div');
        inactiveIndicator.className = 'form-inactive-indicator';
        inactiveIndicator.style.position = 'absolute';
        inactiveIndicator.style.top = '10px';
        inactiveIndicator.style.right = '10px';
        inactiveIndicator.style.display = 'flex';
        inactiveIndicator.style.alignItems = 'center';
        inactiveIndicator.style.gap = '5px';
        
        const statusDot = document.createElement('div');
        statusDot.style.width = '8px';
        statusDot.style.height = '8px';
        statusDot.style.borderRadius = '50%';
        statusDot.style.backgroundColor = '#ef4444'; // Red
        
        const statusText = document.createElement('div');
        statusText.textContent = 'Form Inactive';
        statusText.style.fontSize = '11px';
        statusText.style.color = '#ef4444';
        
        inactiveIndicator.appendChild(statusDot);
        inactiveIndicator.appendChild(statusText);
        
        const nodeContent = element.querySelector('.node-content');
        if (nodeContent) {
            nodeContent.appendChild(inactiveIndicator);
            
            // Fade out after a few seconds
            setTimeout(() => {
                if (inactiveIndicator.parentNode) {
                    inactiveIndicator.style.transition = 'opacity 1s';
                    inactiveIndicator.style.opacity = '0';
                    setTimeout(() => {
                        if (inactiveIndicator.parentNode) {
                            inactiveIndicator.parentNode.removeChild(inactiveIndicator);
                        }
                    }, 1000);
                }
            }, 3000);
        }
        
        if (success) {
            setTimeout(() => element.classList.remove('success'), 1000);
        } else {
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    /**
     * Creates form builder node UI content
     * Generates tabbed interface for form configuration
     * @param {Object} node - Node instance
     * @returns {string} HTML content for form builder interface
     */
    createContent: (node) => {
        const nodeStyleId = `form-node-style-${node.id}`;
        
        if (document.getElementById(nodeStyleId)) {
            document.getElementById(nodeStyleId).remove();
        }
        
        const styleEl = document.createElement('style');
        styleEl.id = nodeStyleId;
        styleEl.textContent = `
            #${node.id} {
                min-width: 320px;
            }
            
            #${node.id} .node-content {
                padding: 0.5rem;
            }
            
            #${node.id} .node-label {
                margin-bottom: 0.2rem;
                font-size: 0.7rem;
                color: var(--text-secondary);
            }
            
            #${node.id} .node-input,
            #${node.id} .node-select {
                padding: 0.35rem;
                font-size: 0.8rem;
                min-height: unset;
                margin-bottom: 0.5rem;
                width: 100%;
            }
            
            #${node.id} .form-description {
                min-height: 60px;
                resize: vertical;
            }
            
            #${node.id} .form-tabs {
                display: flex;
                margin-bottom: 10px;
                border-bottom: 1px solid var(--node-border);
            }
            
            #${node.id} .form-tab {
                padding: 4px 8px;
                font-size: 0.8rem;
                cursor: pointer;
                border-bottom: 2px solid transparent;
            }
            
            #${node.id} .form-tab.active {
                border-bottom-color: #8b5cf6;
                color: #8b5cf6;
            }
            
            #${node.id} .tab-content {
                display: none;
            }
            
            #${node.id} .tab-content.active {
                display: block;
            }
            
            #${node.id} .fields-container {
                border: 1px solid var(--node-border);
                border-radius: 4px;
                padding: 8px;
                margin-bottom: 10px;
                max-height: 200px;
                overflow-y: auto;
            }
            
            #${node.id} .field-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 6px 8px;
                margin-bottom: 6px;
                background: var(--bg-tertiary);
                border-radius: 4px;
                font-size: 0.8rem;
            }
            
            #${node.id} .field-label {
                font-weight: 500;
            }
            
            #${node.id} .field-type {
                color: var(--text-secondary);
                font-size: 0.7rem;
            }
            
            #${node.id} .field-actions {
                display: flex;
                gap: 5px;
            }
            
            #${node.id} .field-action {
                cursor: pointer;
                opacity: 0.7;
            }
            
            #${node.id} .field-action:hover {
                opacity: 1;
            }
            
            #${node.id} .form-preview {
                border: 1px dashed var(--node-border);
                border-radius: 4px;
                padding: 10px;
                margin-top: 10px;
                font-size: 0.8rem;
                color: var(--text-secondary);
                text-align: center;
            }
            
            #${node.id} .form-url {
                font-size: 0.8rem;
                padding: 4px 8px;
                background: var(--bg-tertiary);
                border-radius: 4px;
                word-break: break-all;
                margin-top: 5px;
            }
            
            #${node.id} .add-field-row {
                display: flex;
                gap: 5px;
                align-items: center;
                margin-top: 10px;
            }
            
            #${node.id} .add-field-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                background: var(--bg-tertiary);
                border: 1px solid var(--node-border);
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 0.8rem;
                cursor: pointer;
            }
            
            #${node.id} .add-field-btn:hover {
                background: rgba(139, 92, 246, 0.1);
            }
            
            #${node.id} .form-status {
                display: flex;
                align-items: center;
                gap: 5px;
                margin-top: 10px;
                font-size: 0.8rem;
            }
            
            #${node.id} .status-dot {
                width: 8px;
                height: 8px;
                border-radius: 50%;
            }
            
            #${node.id} .status-dot.inactive {
                background-color: #ef4444;
            }
            
            #${node.id} .status-dot.active {
                background-color: #22c55e;
                animation: pulse-green 2s infinite;
            }
        `;
        document.head.appendChild(styleEl);
        
        // Get settings with defaults
        const settings = node.settings || {};
        const fields = settings.fields || [];
        const subdomain = settings.subdomain || '';
        const title = settings.title || 'Data Collection Form';
        const description = settings.description || '';
        const submitButtonText = settings.submitButtonText || 'Submit';
        const formStyle = settings.formStyle || 'default';
        const storeSubmissions = settings.storeSubmissions !== false;
        const formUrl = subdomain ? `https://${subdomain}.puter.site` : '';
        
        // Check if form is active
        const isActive = false; // This will be updated dynamically when flow runs
        
        // Generate field items HTML
        let fieldsHtml = '';
        if (fields.length === 0) {
            fieldsHtml = `<div class="field-item" style="justify-content: center; color: var(--text-secondary);">No fields added yet</div>`;
        } else {
            fieldsHtml = fields.map((field, index) => `
                <div class="field-item">
                    <div>
                        <div class="field-label">${field.label}</div>
                        <div class="field-type">${field.type}${field.required ? ' (Required)' : ''}</div>
                    </div>
                    <div class="field-actions">
                        <div class="field-action" onclick="window.editFormField('${node.id}', ${index})">✏️</div>
                        <div class="field-action" onclick="window.removeFormField('${node.id}', ${index})">🗑️</div>
                    </div>
                </div>
            `).join('');
        }
        
        return `
            <div class="node-content">
                <!-- Tabs -->
                <div class="form-tabs">
                    <div class="form-tab ${!settings.activeTab || settings.activeTab === 'settings' ? 'active' : ''}" 
                         onclick="document.querySelectorAll('#${node.id} .form-tab').forEach(t => t.classList.remove('active')); 
                                 this.classList.add('active');
                                 document.querySelectorAll('#${node.id} .tab-content').forEach(c => c.classList.remove('active'));
                                 document.getElementById('settings-tab-${node.id}').classList.add('active');
                                 window.flowBuilder.updateNodeSetting('${node.id}', 'activeTab', 'settings');">
                        Settings
                    </div>
                    <div class="form-tab ${settings.activeTab === 'fields' ? 'active' : ''}" 
                         onclick="document.querySelectorAll('#${node.id} .form-tab').forEach(t => t.classList.remove('active')); 
                                 this.classList.add('active');
                                 document.querySelectorAll('#${node.id} .tab-content').forEach(c => c.classList.remove('active'));
                                 document.getElementById('fields-tab-${node.id}').classList.add('active');
                                 window.flowBuilder.updateNodeSetting('${node.id}', 'activeTab', 'fields');">
                        Fields
                    </div>
                    <div class="form-tab ${settings.activeTab === 'preview' ? 'active' : ''}" 
                         onclick="document.querySelectorAll('#${node.id} .form-tab').forEach(t => t.classList.remove('active')); 
                                 this.classList.add('active');
                                 document.querySelectorAll('#${node.id} .tab-content').forEach(c => c.classList.remove('active'));
                                 document.getElementById('preview-tab-${node.id}').classList.add('active');
                                 window.flowBuilder.updateNodeSetting('${node.id}', 'activeTab', 'preview');
                                 window.updateFormPreview('${node.id}');">
                        Preview
                    </div>
                </div>
                
                <!-- Settings Tab -->
                <div id="settings-tab-${node.id}" class="tab-content ${!settings.activeTab || settings.activeTab === 'settings' ? 'active' : ''}">
                    <div class="node-label">Subdomain</div>
                    <div style="display: flex; gap: 5px;">
                        <input type="text" class="node-input"
                            value="${subdomain}"
                            placeholder="yourform"
                            style="flex: 1;"
                            onchange="window.checkAndUpdateSubdomain('${node.id}', this.value)">
                        <button class="add-field-btn" 
                            onclick="window.checkAndUpdateSubdomain('${node.id}', document.querySelector('#${node.id} input').value)">
                            Check
                        </button>
                    </div>
                    
                    <div class="node-label">Form Title</div>
                    <input type="text" class="node-input"
                        value="${title}"
                        placeholder="Data Collection Form"
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'title', this.value)">
                    
                    <div class="node-label">Description</div>
                    <textarea class="node-input form-description"
                        placeholder="Enter a description for your form..."
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'description', this.value)">${description}</textarea>
                    
                    <div class="node-label">Submit Button Text</div>
                    <input type="text" class="node-input"
                        value="${submitButtonText}"
                        placeholder="Submit"
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'submitButtonText', this.value)">
                    
                    <div class="node-label">Form Style</div>
                    <select class="node-select" 
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'formStyle', this.value)">
                        <option value="default" ${formStyle === 'default' ? 'selected' : ''}>Default</option>
                        <option value="minimal" ${formStyle === 'minimal' ? 'selected' : ''}>Minimal</option>
                        <option value="dark" ${formStyle === 'dark' ? 'selected' : ''}>Dark Mode</option>
                        <option value="colorful" ${formStyle === 'colorful' ? 'selected' : ''}>Colorful</option>
                    </select>
                    
                    <label style="display: flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 0.8rem;">
                        <input type="checkbox" 
                            ${storeSubmissions ? 'checked' : ''}
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'storeSubmissions', this.checked)">
                        Store submissions in Puter storage
                    </label>
                </div>
                
                <!-- Fields Tab -->
                <div id="fields-tab-${node.id}" class="tab-content ${settings.activeTab === 'fields' ? 'active' : ''}">
                    <div class="fields-container">
                        ${fieldsHtml}
                    </div>
                    
                    <div class="add-field-row">
                        <select class="node-select" id="field-type-${node.id}" style="flex: 1;">
                            <option value="text">Text Field</option>
                            <option value="email">Email</option>
                            <option value="number">Number</option>
                            <option value="tel">Phone</option>
                            <option value="textarea">Text Area</option>
                            <option value="select">Dropdown</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="radio">Radio Buttons</option>
                            <option value="date">Date</option>
                            <option value="file">File Upload</option>
                        </select>
                        
                        <button class="add-field-btn" onclick="window.addFormField('${node.id}')">
                            Add Field
                        </button>
                    </div>
                </div>
                
                <!-- Preview Tab -->
                <div id="preview-tab-${node.id}" class="tab-content ${settings.activeTab === 'preview' ? 'active' : ''}">
                    ${formUrl ? `
                        <div class="node-label">Form URL</div>
                        <div class="form-url">${formUrl}</div>
                        <button class="add-field-btn" style="margin-top: 10px; width: 100%;" 
                            onclick="window.openFormPreview('${formUrl}')">
                            Open Form in New Tab
                        </button>
                    ` : `
                        <div class="form-preview">
                            Please configure a subdomain in the Settings tab
                        </div>
                    `}
                    
                    <div class="form-status">
                        <div class="status-dot ${isActive ? 'active' : 'inactive'}"></div>
                        <span>Form is currently ${isActive ? 'active' : 'inactive'} - will be active when flow runs</span>
                    </div>
                </div>
            </div>
        `;
    },
    
    /**
     * Executes the form node functionality
     * Deploys form and sets up submission monitoring
     * @param {Object} node - Node instance
     * @param {*} input - Not used (trigger node)
     * @param {Object} context - Execution context
     * @returns {Promise<Object>} Form status and URL
     * @throws {Error} If form setup fails
     */
    execute: async (node, input, context) => {
        try {
            const subdomain = node.settings?.subdomain;
            if (!subdomain) {
                throw new Error('Subdomain not configured for form');
            }
            
            // Generate or update the form
            await generateForm(node);
            
            // Activate the form
            await updateFormStatus(subdomain, true);
            
            // Log that the form is active
            context.flowBuilder.log('info', `Form activated at https://${subdomain}.puter.site`, node.id);
            
            // This node will continue running until stopped
            // Return an initial response
            return {
                formStatus: 'active',
                formUrl: `https://${subdomain}.puter.site`,
                waitingForSubmissions: true
            };
        } catch (error) {
            throw new Error(`Form setup failed: ${error.message}`);
        }
    }
};

/**
 * Form Builder Helper Functions
 * Collection of utility functions for form management
 */

/**
 * Generate and deploy the form based on node settings
 */
/**
 * Generates and deploys form based on configuration
 * @param {Object} node - Node containing form settings
 * @returns {Promise<boolean>} Success status
 * @throws {Error} If form generation fails
 */
async function generateForm(node) {
    const settings = node.settings || {};
    const subdomain = settings.subdomain;
    
    if (!subdomain) {
        throw new Error('Subdomain is required');
    }
    
    // Generate form HTML
    const html = generateFormHtml(settings);
    
    try {
        // Create directory for the form if it doesn't exist
        const formDirPath = `.forms/${subdomain}`;
        try {
            await puter.fs.mkdir(formDirPath, { createMissingParents: true });
        } catch (error) {
            // Directory might already exist, which is fine
            console.log('Form directory creation:', error);
        }
        
        // Write the form HTML
        await puter.fs.write(`${formDirPath}/index.html`, html, { overwrite: true });
        
        // Create a submissions directory
        try {
            await puter.fs.mkdir(`${formDirPath}/submissions`, { createMissingParents: true });
        } catch (error) {
            // Directory might already exist, which is fine
            console.log('Submissions directory creation:', error);
        }
        
        // Create or update the form status file
        await puter.fs.write(`${formDirPath}/form-status.json`, JSON.stringify({
            active: false,
            lastUpdated: new Date().toISOString()
        }), { overwrite: true });
        
        // Check if subdomain exists
        let subdomainExists = false;
        try {
            await puter.hosting.get(subdomain);
            subdomainExists = true;
        } catch (error) {
            subdomainExists = false;
        }
        
        // Create or update the hosting
        if (subdomainExists) {
            await puter.hosting.update(subdomain, formDirPath);
        } else {
            await puter.hosting.create(subdomain, formDirPath);
        }
        
        return true;
    } catch (error) {
        console.error('Error generating form:', error);
        throw new Error(`Failed to create form: ${error.message}`);
    }
}

/**
 * Generate HTML for the form
 */
/**
 * Generates HTML for the form UI
 * @param {Object} settings - Form configuration settings
 * @returns {string} Complete HTML document for form
 */
function generateFormHtml(settings) {
    const title = settings.title || 'Data Collection Form';
    const description = settings.description || '';
    const submitButtonText = settings.submitButtonText || 'Submit';
    const formStyle = settings.formStyle || 'default';
    const fields = settings.fields || [];
    const subdomain = settings.subdomain || '';
    
    // Generate CSS based on style
    let css = '';
    switch (formStyle) {
        case 'minimal':
            css = `
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                h1 { font-size: 24px; margin-bottom: 10px; font-weight: 400; }
                p { margin-bottom: 20px; color: #666; }
                form { display: flex; flex-direction: column; }
                .form-group { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; color: #555; }
                input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 16px; }
                textarea { min-height: 100px; resize: vertical; }
                button { background-color: #333; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-size: 16px; }
                button:hover { background-color: #555; }
                .form-inactive { background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
                .form-active { background-color: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
                .form-success { background-color: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin-bottom: 20px; display: none; }
                .form-error { background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 20px; display: none; }
                .required:after { content: " *"; color: #dc3545; }
            `;
            break;
        case 'dark':
            css = `
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background-color: #222; color: #eee; max-width: 600px; margin: 0 auto; padding: 20px; }
                h1 { font-size: 28px; margin-bottom: 10px; }
                p { margin-bottom: 20px; color: #bbb; }
                form { display: flex; flex-direction: column; }
                .form-group { margin-bottom: 20px; }
                label { display: block; margin-bottom: 8px; color: #ddd; }
                input, select, textarea { width: 100%; padding: 10px; background-color: #333; border: 1px solid #444; border-radius: 4px; color: #eee; font-size: 16px; }
                textarea { min-height: 100px; resize: vertical; }
                button { background-color: #8b5cf6; color: white; border: none; padding: 12px; border-radius: 4px; cursor: pointer; font-size: 16px; }
                button:hover { background-color: #7c3aed; }
                .form-inactive { background-color: #352e38; color: #ff9999; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
                .form-active { background-color: #2e3835; color: #99ffcc; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
                .form-success { background-color: #2e3835; color: #99ffcc; padding: 10px; border-radius: 4px; margin-bottom: 20px; display: none; }
                .form-error { background-color: #352e38; color: #ff9999; padding: 10px; border-radius: 4px; margin-bottom: 20px; display: none; }
                .required:after { content: " *"; color: #ff6b6b; }
            `;
            break;
        case 'colorful':
            css = `
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background-color: #f8f9fa; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { font-size: 28px; margin-bottom: 10px; color: #8b5cf6; }
            p { margin-bottom: 20px; color: #555; }
            form { display: flex; flex-direction: column; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .form-group { margin-bottom: 20px; }
            label { display: block; margin-bottom: 8px; color: #444; font-weight: 500; }
            input, select, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; transition: border-color 0.3s; }
            input:focus, select:focus, textarea:focus { border-color: #8b5cf6; outline: none; box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2); }
            textarea { min-height: 100px; resize: vertical; }
            button { background-color: #8b5cf6; color: white; border: none; padding: 12px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 500; transition: background 0.3s; }
            button:hover { background-color: #9f7aea; }
            .form-inactive { background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .form-active { background-color: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .form-success { background-color: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: none; }
            .form-error { background-color: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: none; }
            .required:after { content: " *"; color: #dc3545; }
        `;
        break;
    default: // Default style
        css = `
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { font-size: 26px; margin-bottom: 10px; }
            p { margin-bottom: 20px; color: #555; }
            form { display: flex; flex-direction: column; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 6px; }
            input, select, textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 16px; }
            textarea { min-height: 100px; resize: vertical; }
            button { background-color: #4a90e2; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; font-size: 16px; }
            button:hover { background-color: #3a80d2; }
            .form-inactive { background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
            .form-active { background-color: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin-bottom: 20px; }
            .form-success { background-color: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin-bottom: 20px; display: none; }
            .form-error { background-color: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 20px; display: none; }
            .required:after { content: " *"; color: #dc3545; }
        `;
}

// Generate form fields HTML
let fieldsHtml = '';
if (fields.length === 0) {
    fieldsHtml = `
        <div class="form-group">
            <label for="name" class="required">Name</label>
            <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
            <label for="email" class="required">Email</label>
            <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" name="message"></textarea>
        </div>
    `;
} else {
    fieldsHtml = fields.map(field => {
        const required = field.required ? 'required' : '';
        const requiredClass = field.required ? 'required' : '';
        
        switch (field.type) {
            case 'text':
                return `
                    <div class="form-group">
                        <label for="${field.id}" class="${requiredClass}">${field.label}</label>
                        <input type="text" id="${field.id}" name="${field.id}" ${required}${field.placeholder ? ` placeholder="${field.placeholder}"` : ''}>
                    </div>
                `;
            case 'email':
                return `
                    <div class="form-group">
                        <label for="${field.id}" class="${requiredClass}">${field.label}</label>
                        <input type="email" id="${field.id}" name="${field.id}" ${required}${field.placeholder ? ` placeholder="${field.placeholder}"` : ''}>
                    </div>
                `;
            case 'number':
                return `
                    <div class="form-group">
                        <label for="${field.id}" class="${requiredClass}">${field.label}</label>
                        <input type="number" id="${field.id}" name="${field.id}" ${required}${field.placeholder ? ` placeholder="${field.placeholder}"` : ''}${field.min ? ` min="${field.min}"` : ''}${field.max ? ` max="${field.max}"` : ''}>
                    </div>
                `;
            case 'tel':
                return `
                    <div class="form-group">
                        <label for="${field.id}" class="${requiredClass}">${field.label}</label>
                        <input type="tel" id="${field.id}" name="${field.id}" ${required}${field.placeholder ? ` placeholder="${field.placeholder}"` : ''}>
                    </div>
                `;
            case 'textarea':
                return `
                    <div class="form-group">
                        <label for="${field.id}" class="${requiredClass}">${field.label}</label>
                        <textarea id="${field.id}" name="${field.id}" ${required}${field.placeholder ? ` placeholder="${field.placeholder}"` : ''}></textarea>
                    </div>
                `;
            case 'select':
                const options = field.options ? field.options.map(option => 
                    `<option value="${option.value}">${option.label}</option>`
                ).join('') : '';
                
                return `
                    <div class="form-group">
                        <label for="${field.id}" class="${requiredClass}">${field.label}</label>
                        <select id="${field.id}" name="${field.id}" ${required}>
                            <option value="">Select an option</option>
                            ${options}
                        </select>
                    </div>
                `;
            case 'checkbox':
                return `
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="${field.id}" name="${field.id}" ${required}>
                            <span${field.required ? ' class="required"' : ''}>${field.label}</span>
                        </label>
                    </div>
                `;
            case 'radio':
                const radioOptions = field.options ? field.options.map((option, i) => 
                    `<label style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                        <input type="radio" name="${field.id}" value="${option.value}" ${i === 0 && field.required ? 'required' : ''}>
                        <span>${option.label}</span>
                    </label>`
                ).join('') : '';
                
                return `
                    <div class="form-group">
                        <label class="${requiredClass}">${field.label}</label>
                        <div style="margin-top: 5px;">
                            ${radioOptions}
                        </div>
                    </div>
                `;
            case 'date':
                return `
                    <div class="form-group">
                        <label for="${field.id}" class="${requiredClass}">${field.label}</label>
                        <input type="date" id="${field.id}" name="${field.id}" ${required}>
                    </div>
                `;
            case 'file':
                return `
                    <div class="form-group">
                        <label for="${field.id}" class="${requiredClass}">${field.label}</label>
                        <input type="file" id="${field.id}" name="${field.id}" ${required}${field.accept ? ` accept="${field.accept}"` : ''}>
                    </div>
                `;
            default:
                return `
                    <div class="form-group">
                        <label for="${field.id}" class="${requiredClass}">${field.label}</label>
                        <input type="text" id="${field.id}" name="${field.id}" ${required}>
                    </div>
                `;
        }
    }).join('');
}

// Generate the HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>${css}</style>
</head>
<body>
<div id="form-status-container"></div>
<div id="form-success" class="form-success">Form submitted successfully! Thank you.</div>
<div id="form-error" class="form-error">There was an error submitting the form. Please try again.</div>

<h1>${title}</h1>
${description ? `<p>${description}</p>` : ''}

<form id="data-form">
    ${fieldsHtml}
    <button type="submit">${submitButtonText}</button>
</form>

<script>
    // Check if form is active on load
    checkFormStatus();
    
    // Function to check form status
    async function checkFormStatus() {
        try {
            const response = await fetch('form-status.json?t=' + new Date().getTime());
            if (!response.ok) throw new Error('Could not check form status');
            
            const status = await response.json();
            const statusContainer = document.getElementById('form-status-container');
            
            if (status.active) {
                statusContainer.innerHTML = '<div class="form-active">This form is active and accepting submissions.</div>';
                document.getElementById('data-form').style.display = 'flex';
            } else {
                statusContainer.innerHTML = '<div class="form-inactive">This form is currently inactive. Please try again later.</div>';
                document.getElementById('data-form').style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking form status:', error);
            const statusContainer = document.getElementById('form-status-container');
            statusContainer.innerHTML = '<div class="form-inactive">Could not determine form status. Please try again later.</div>';
            document.getElementById('data-form').style.display = 'none';
        }
    }
    
    // Set up form submission
    document.getElementById('data-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Check if form is active before submitting
        try {
            const response = await fetch('form-status.json?t=' + new Date().getTime());
            if (!response.ok) throw new Error('Could not check form status');
            
            const status = await response.json();
            if (!status.active) {
                document.getElementById('form-error').textContent = 'This form is currently inactive. Please try again later.';
                document.getElementById('form-error').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('form-error').style.display = 'none';
                }, 5000);
                return;
            }
            
            // Get form data
            const formData = new FormData(this);
            const formObject = {};
            
            for (let [key, value] of formData.entries()) {
                formObject[key] = value;
            }
            
            // Add timestamp and form identifier
            const submission = {
                formId: '${subdomain}',
                submission: formObject,
                submittedAt: new Date().toISOString()
            };
            
            // Submit the form data
            const submitResponse = await fetch('submissions/' + new Date().getTime() + '.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submission)
            });
            
            if (!submitResponse.ok) throw new Error('Form submission failed');
            
            // Show success message and reset form
            document.getElementById('form-success').style.display = 'block';
            document.getElementById('data-form').reset();
            
            setTimeout(() => {
                document.getElementById('form-success').style.display = 'none';
            }, 5000);
            
        } catch (error) {
            console.error('Form submission error:', error);
            document.getElementById('form-error').style.display = 'block';
            
            setTimeout(() => {
                document.getElementById('form-error').style.display = 'none';
            }, 5000);
        }
    });
    
    // Check status every 10 seconds
    setInterval(checkFormStatus, 10000);
</script>
</body>
</html>`;

return html;
}

/**
* Update the form's active status
*/
/**
 * Updates form's active/inactive status
 * @param {string} subdomain - Form's subdomain
 * @param {boolean} isActive - New status
 * @returns {Promise<boolean>} Success status
 */
async function updateFormStatus(subdomain, isActive) {
if (!subdomain) return false;

try {
    const formStatusPath = `.forms/${subdomain}/form-status.json`;
    
    // Create or update the form status file
    await puter.fs.write(formStatusPath, JSON.stringify({
        active: isActive,
        lastUpdated: new Date().toISOString()
    }), { overwrite: true });
    
    return true;
} catch (error) {
    console.error('Error updating form status:', error);
    return false;
}
}

/**
* Check for new form submissions
*/
/**
 * Checks for new form submissions
 * @param {Object} node - Form node instance
 * @returns {Promise<Array>} Array of new submissions
 */
async function checkForNewSubmissions(node) {
const settings = node.settings || {};
const subdomain = settings.subdomain;
const lastSubmissionId = settings.lastSubmissionId || 0;

if (!subdomain) return [];

try {
    // Get all submission files
    const submissionsPath = `.forms/${subdomain}/submissions`;
    let submissionFiles;
    
    try {
        submissionFiles = await puter.fs.readdir(submissionsPath);
    } catch (error) {
        // Directory might not exist yet
        console.log('Error reading submissions directory:', error);
        return [];
    }
    
    if (!Array.isArray(submissionFiles)) return [];
    
    // Filter for .json files and sort by modified time (newest first)
    const jsonFiles = submissionFiles
        .filter(file => file.name.endsWith('.json'))
        .sort((a, b) => b.modified - a.modified);
    
    // Get new submissions (files with ID greater than lastSubmissionId)
    const newSubmissions = [];
    
    for (const file of jsonFiles) {
        const fileId = parseInt(file.name.replace('.json', ''));
        
        if (fileId > lastSubmissionId) {
            // Read submission file
            try {
                const blob = await puter.fs.read(`${submissionsPath}/${file.name}`);
                const content = await blob.text();
                const submission = JSON.parse(content);
                
                newSubmissions.push({
                    id: fileId,
                    data: submission
                });
            } catch (error) {
                console.error(`Error reading submission file ${file.name}:`, error);
            }
        }
    }
    
    // Update lastSubmissionId if we have new submissions
    if (newSubmissions.length > 0) {
        const highestId = Math.max(...newSubmissions.map(s => s.id));
        window.flowBuilder.updateNodeSetting(node.id, 'lastSubmissionId', highestId);
    }
    
    return newSubmissions;
} catch (error) {
    console.error('Error checking for submissions:', error);
    return [];
}
}

/**
* Process new form submissions
*/
/**
 * Processes new form submissions and triggers flow execution
 * @param {Object} node - Form node instance
 * @param {Array} submissions - Array of new submissions
 * @param {HTMLElement} element - Node's DOM element
 * @param {Object} flowBuilder - Flow builder instance
 */
async function processSubmissions(node, submissions, element, flowBuilder) {
if (!submissions || submissions.length === 0) return;

// Process each submission
for (const submission of submissions) {
    try {
        // Log the submission
        const submissionData = JSON.stringify(submission.data);
        flowBuilder.log('success', `Form submission: ${submissionData}`, node.id);
        
        // Find target connections and forward the submission
        const connections = Array.from(flowBuilder.connections.values())
            .filter(conn => conn.sourceNode === node.id);
        
        // Execute connected nodes with the submission data
        for (const connection of connections) {
            try {
                await flowBuilder.executeNode(
                    connection.targetNode,
                    submission.data,
                    new Set([node.id]) // Prevent circular execution
                );
            } catch (error) {
                console.error(`Error executing node ${connection.targetNode}:`, error);
                flowBuilder.log('error', `Error processing submission: ${error.message}`, node.id);
            }
        }
    } catch (error) {
        console.error('Error processing submission:', error);
        flowBuilder.log('error', `Error processing submission: ${error.message}`, node.id);
    }
}
}

/**
* Check and update the subdomain
*/
/**
 * Validates and updates form subdomain
 * @param {string} nodeId - ID of form node
 * @param {string} subdomain - Requested subdomain
 */
window.checkAndUpdateSubdomain = async function(nodeId, subdomain) {
if (!subdomain) {
    alert('Please enter a subdomain');
    return;
}

// Check if subdomain is valid (alphanumeric and hyphens only)
if (!/^[a-z0-9-]+$/.test(subdomain)) {
    alert('Subdomain can only contain lowercase letters, numbers, and hyphens');
    return;
}

try {
    // Check if subdomain is available
    try {
        const existingSubdomain = await puter.hosting.get(subdomain);
        
        // If we got here, the subdomain exists - check if it belongs to the current user
        const userInfo = await puter.auth.getUser();
        
        if (existingSubdomain.owner !== userInfo.uuid) {
            alert(`Subdomain "${subdomain}" is already taken by another user`);
            return;
        }
        
        // Subdomain belongs to current user
        if (confirm(`You already own the subdomain "${subdomain}". Do you want to use it for this form?`)) {
            window.flowBuilder.updateNodeSetting(nodeId, 'subdomain', subdomain);
            alert(`Subdomain "${subdomain}" will be used for this form`);
        }
    } catch (error) {
        // Subdomain doesn't exist - it's available
        window.flowBuilder.updateNodeSetting(nodeId, 'subdomain', subdomain);
        alert(`Subdomain "${subdomain}" is available and has been set for this form`);
    }
} catch (error) {
    console.error('Error checking subdomain:', error);
    alert(`Error checking subdomain: ${error.message}`);
}
}

/**
* Add a new form field
*/
/**
 * Adds a new field to the form using a modal dialog
 * Handles field configuration for different field types
 * @param {string} nodeId - ID of form node
 */
window.addFormField = function(nodeId) {
const fieldType = document.getElementById(`field-type-${nodeId}`).value;

// Open modal to configure the field
const modal = document.createElement('div');
modal.className = 'field-modal';
modal.style.position = 'fixed';
modal.style.top = '0';
modal.style.left = '0';
modal.style.width = '100%';
modal.style.height = '100%';
modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
modal.style.display = 'flex';
modal.style.alignItems = 'center';
modal.style.justifyContent = 'center';
modal.style.zIndex = '9999';

let optionsHtml = '';
if (fieldType === 'select' || fieldType === 'radio') {
    optionsHtml = `
        <div class="modal-section">
            <h3>Options</h3>
            <div id="options-container">
                <div class="option-row">
                    <input type="text" placeholder="Value" class="option-value">
                    <input type="text" placeholder="Label" class="option-label">
                    <button type="button" class="remove-option">×</button>
                </div>
            </div>
            <button type="button" id="add-option">Add Option</button>
        </div>
    `;
}

let fileTypeHtml = '';
if (fieldType === 'file') {
    fileTypeHtml = `
        <div class="form-group">
            <label for="field-accept">Accepted File Types</label>
            <input type="text" id="field-accept" placeholder="e.g., .jpg,.png,.pdf">
            <small>Comma-separated list of file extensions or MIME types</small>
        </div>
    `;
}

let numberFieldsHtml = '';
if (fieldType === 'number') {
    numberFieldsHtml = `
        <div class="form-group">
            <label for="field-min">Min Value</label>
            <input type="number" id="field-min">
        </div>
        <div class="form-group">
            <label for="field-max">Max Value</label>
            <input type="number" id="field-max">
        </div>
    `;
}

modal.innerHTML = `
    <div class="modal-content" style="background-color: var(--bg-secondary); border-radius: 8px; width: 90%; max-width: 500px; padding: 20px; max-height: 80vh; overflow-y: auto;">
        <h2>Add ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field</h2>
        
        <div class="form-group">
            <label for="field-label">Field Label</label>
            <input type="text" id="field-label" placeholder="Enter field label">
        </div>
        
        <div class="form-group">
            <label for="field-id">Field ID</label>
            <input type="text" id="field-id" placeholder="Enter field ID (for form data)">
        </div>
        
        <div class="form-group">
            <label for="field-placeholder">Placeholder</label>
            <input type="text" id="field-placeholder" placeholder="Enter placeholder text">
        </div>
        
        ${numberFieldsHtml}
        
        ${fileTypeHtml}
        
        <div class="form-group">
            <label style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" id="field-required">
                <span>Required Field</span>
            </label>
        </div>
        
        ${optionsHtml}
        
        <div class="modal-buttons" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" id="cancel-button" style="padding: 8px 16px; background: var(--bg-tertiary); color: var(--text-primary); border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
            <button type="button" id="save-button" style="padding: 8px 16px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer;">Add Field</button>
        </div>
    </div>
`;

document.body.appendChild(modal);

// Add event listeners
document.getElementById('cancel-button').addEventListener('click', () => {
    modal.remove();
});

// Auto-generate ID from label
document.getElementById('field-label').addEventListener('input', (e) => {
    const label = e.target.value;
    const id = label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    document.getElementById('field-id').value = id;
});

// For select/radio fields, add option button
if (fieldType === 'select' || fieldType === 'radio') {
    document.getElementById('add-option').addEventListener('click', () => {
        const optionsContainer = document.getElementById('options-container');
        const newOption = document.createElement('div');
        newOption.className = 'option-row';
        newOption.style.display = 'flex';
        newOption.style.gap = '10px';
        newOption.style.marginBottom = '10px';
        
        newOption.innerHTML = `
            <input type="text" placeholder="Value" class="option-value">
            <input type="text" placeholder="Label" class="option-label">
            <button type="button" class="remove-option" style="background: none; border: none; color: var(--text-primary); cursor: pointer; font-size: 18px;">×</button>
        `;
        
        optionsContainer.appendChild(newOption);
        
        newOption.querySelector('.remove-option').addEventListener('click', () => {
            newOption.remove();
        });
    });
    
    // Add event listener to the initial remove option button
    document.querySelector('.remove-option').addEventListener('click', (e) => {
        e.target.closest('.option-row').remove();
    });
}

document.getElementById('save-button').addEventListener('click', () => {
    const label = document.getElementById('field-label').value;
    const id = document.getElementById('field-id').value || label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const placeholder = document.getElementById('field-placeholder').value;
    const required = document.getElementById('field-required').checked;
    
    if (!label) {
        alert('Please enter a field label');
        return;
    }
    
    if (!id) {
        alert('Please enter a field ID');
        return;
    }
    
    // Create field object
    const field = {
        type: fieldType,
        label,
        id,
        placeholder,
        required
    };
    
    // Add options for select/radio fields
    if (fieldType === 'select' || fieldType === 'radio') {
        const optionValues = document.querySelectorAll('.option-value');
        const optionLabels = document.querySelectorAll('.option-label');
        
        if (optionValues.length === 0) {
            alert('Please add at least one option');
            return;
        }
        
        field.options = [];
        
        for (let i = 0; i < optionValues.length; i++) {
            const value = optionValues[i].value || optionLabels[i].value;
            const label = optionLabels[i].value || optionValues[i].value;
            
            if (value && label) {
                field.options.push({ value, label });
            }
        }
        
        if (field.options.length === 0) {
            alert('Please add at least one valid option');
            return;
        }
    }
    
    // Add accept attribute for file fields
    if (fieldType === 'file' && document.getElementById('field-accept')) {
        field.accept = document.getElementById('field-accept').value;
    }
    
    // Add min/max for number fields
    if (fieldType === 'number') {
        const min = document.getElementById('field-min').value;
        const max = document.getElementById('field-max').value;
        
        if (min) field.min = min;
        if (max) field.max = max;
    }
    
    // Get current fields
    const node = window.flowBuilder.nodes.get(nodeId);
    const fields = node?.settings?.fields || [];
    
    // Add new field
    fields.push(field);
    
    // Update node settings
    window.flowBuilder.updateNodeSetting(nodeId, 'fields', fields);
    
    // Close modal
    modal.remove();
    
    // Refresh node content
    const nodeElement = document.getElementById(nodeId);
    if (nodeElement) {
        const nodeType = window.flowBuilder.nodeRegistry.getNodeType('form-builder');
        if (nodeType) {
            nodeElement.querySelector('.node-content').innerHTML = nodeType.createContent(node);
        }
    }
});
}

/**
* Edit a form field
*/
/**
 * Opens modal dialog to edit an existing form field
 * Pre-fills form with current field values
 * @param {string} nodeId - ID of form node
 * @param {number} fieldIndex - Index of field to edit
 */
window.editFormField = function(nodeId, fieldIndex) {
// Get the field
const node = window.flowBuilder.nodes.get(nodeId);
const fields = node?.settings?.fields || [];
const field = fields[fieldIndex];

if (!field) return;

// Open modal to edit the field (similar to addFormField but with pre-filled values)
const modal = document.createElement('div');
modal.className = 'field-modal';
modal.style.position = 'fixed';
modal.style.top = '0';
modal.style.left = '0';
modal.style.width = '100%';
modal.style.height = '100%';
modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
modal.style.display = 'flex';
modal.style.alignItems = 'center';
modal.style.justifyContent = 'center';
modal.style.zIndex = '9999';

let optionsHtml = '';
if (field.type === 'select' || field.type === 'radio') {
    optionsHtml = `
        <div class="modal-section">
            <h3>Options</h3>
            <div id="options-container">
                ${field.options ? field.options.map(option => `
                <div class="option-row" style="display: flex; gap: 10px; margin-bottom: 10px;">
                <input type="text" placeholder="Value" class="option-value" value="${option.value || ''}">
                <input type="text" placeholder="Label" class="option-label" value="${option.label || ''}">
                <button type="button" class="remove-option" style="background: none; border: none; color: var(--text-primary); cursor: pointer; font-size: 18px;">×</button>
            </div>
        `).join('') : ''}
    </div>
    <button type="button" id="add-option" style="padding: 5px 10px; background: var(--bg-tertiary); border: 1px solid var(--node-border); border-radius: 4px; color: var(--text-primary); cursor: pointer; margin-top: 10px;">Add Option</button>
</div>
`;
}

let fileTypeHtml = '';
if (field.type === 'file') {
fileTypeHtml = `
<div class="form-group">
    <label for="field-accept">Accepted File Types</label>
    <input type="text" id="field-accept" placeholder="e.g., .jpg,.png,.pdf" value="${field.accept || ''}">
    <small>Comma-separated list of file extensions or MIME types</small>
</div>
`;
}

let numberFieldsHtml = '';
if (field.type === 'number') {
numberFieldsHtml = `
<div class="form-group">
    <label for="field-min">Min Value</label>
    <input type="number" id="field-min" value="${field.min || ''}">
</div>
<div class="form-group">
    <label for="field-max">Max Value</label>
    <input type="number" id="field-max" value="${field.max || ''}">
</div>
`;
}

modal.innerHTML = `
<div class="modal-content" style="background-color: var(--bg-secondary); border-radius: 8px; width: 90%; max-width: 500px; padding: 20px; max-height: 80vh; overflow-y: auto;">
<h2>Edit ${field.type.charAt(0).toUpperCase() + field.type.slice(1)} Field</h2>

<div class="form-group">
    <label for="field-label">Field Label</label>
    <input type="text" id="field-label" placeholder="Enter field label" value="${field.label || ''}">
</div>

<div class="form-group">
    <label for="field-id">Field ID</label>
    <input type="text" id="field-id" placeholder="Enter field ID (for form data)" value="${field.id || ''}">
</div>

<div class="form-group">
    <label for="field-placeholder">Placeholder</label>
    <input type="text" id="field-placeholder" placeholder="Enter placeholder text" value="${field.placeholder || ''}">
</div>

${numberFieldsHtml}

${fileTypeHtml}

<div class="form-group">
    <label style="display: flex; align-items: center; gap: 10px;">
        <input type="checkbox" id="field-required" ${field.required ? 'checked' : ''}>
        <span>Required Field</span>
    </label>
</div>

${optionsHtml}

<div class="modal-buttons" style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
    <button type="button" id="cancel-button" style="padding: 8px 16px; background: var(--bg-tertiary); color: var(--text-primary); border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
    <button type="button" id="save-button" style="padding: 8px 16px; background: #8b5cf6; color: white; border: none; border-radius: 4px; cursor: pointer;">Save Changes</button>
</div>
</div>
`;

document.body.appendChild(modal);

// Add event listeners
document.getElementById('cancel-button').addEventListener('click', () => {
modal.remove();
});

// For select/radio fields, add option button
if (field.type === 'select' || field.type === 'radio') {
document.getElementById('add-option').addEventListener('click', () => {
const optionsContainer = document.getElementById('options-container');
const newOption = document.createElement('div');
newOption.className = 'option-row';
newOption.style.display = 'flex';
newOption.style.gap = '10px';
newOption.style.marginBottom = '10px';

newOption.innerHTML = `
    <input type="text" placeholder="Value" class="option-value">
    <input type="text" placeholder="Label" class="option-label">
    <button type="button" class="remove-option" style="background: none; border: none; color: var(--text-primary); cursor: pointer; font-size: 18px;">×</button>
`;

optionsContainer.appendChild(newOption);

newOption.querySelector('.remove-option').addEventListener('click', () => {
    newOption.remove();
});
});

// Add event listeners to all remove option buttons
document.querySelectorAll('.remove-option').forEach(button => {
button.addEventListener('click', () => {
    button.closest('.option-row').remove();
});
});
}

document.getElementById('save-button').addEventListener('click', () => {
const label = document.getElementById('field-label').value;
const id = document.getElementById('field-id').value;
const placeholder = document.getElementById('field-placeholder').value;
const required = document.getElementById('field-required').checked;

if (!label) {
alert('Please enter a field label');
return;
}

if (!id) {
alert('Please enter a field ID');
return;
}

// Create updated field object
const updatedField = {
...field,
label,
id,
placeholder,
required
};

// Update options for select/radio fields
if (field.type === 'select' || field.type === 'radio') {
const optionValues = document.querySelectorAll('.option-value');
const optionLabels = document.querySelectorAll('.option-label');

if (optionValues.length === 0) {
    alert('Please add at least one option');
    return;
}

updatedField.options = [];

for (let i = 0; i < optionValues.length; i++) {
    const value = optionValues[i].value || optionLabels[i].value;
    const label = optionLabels[i].value || optionValues[i].value;
    
    if (value && label) {
        updatedField.options.push({ value, label });
    }
}

if (updatedField.options.length === 0) {
    alert('Please add at least one valid option');
    return;
}
}

// Update accept attribute for file fields
if (field.type === 'file' && document.getElementById('field-accept')) {
updatedField.accept = document.getElementById('field-accept').value;
}

// Update min/max for number fields
if (field.type === 'number') {
const min = document.getElementById('field-min').value;
const max = document.getElementById('field-max').value;

updatedField.min = min || undefined;
updatedField.max = max || undefined;
}

// Get current fields
const fields = [...node.settings.fields];

// Update field
fields[fieldIndex] = updatedField;

// Update node settings
window.flowBuilder.updateNodeSetting(nodeId, 'fields', fields);

// Close modal
modal.remove();

// Refresh node content
const nodeElement = document.getElementById(nodeId);
if (nodeElement) {
const nodeType = window.flowBuilder.nodeRegistry.getNodeType('form-builder');
if (nodeType) {
    nodeElement.querySelector('.node-content').innerHTML = nodeType.createContent(node);
}
}
});
}

/**
* Remove a form field
*/
/**
 * Removes a field from the form after confirmation
 * @param {string} nodeId - ID of form node
 * @param {number} fieldIndex - Index of field to remove
 */
window.removeFormField = function(nodeId, fieldIndex) {
if (!confirm('Are you sure you want to remove this field?')) return;

// Get the node and fields
const node = window.flowBuilder.nodes.get(nodeId);
const fields = [...node.settings.fields];

// Remove the field
fields.splice(fieldIndex, 1);

// Update node settings
window.flowBuilder.updateNodeSetting(nodeId, 'fields', fields);

// Refresh node content
const nodeElement = document.getElementById(nodeId);
if (nodeElement) {
const nodeType = window.flowBuilder.nodeRegistry.getNodeType('form-builder');
if (nodeType) {
nodeElement.querySelector('.node-content').innerHTML = nodeType.createContent(node);
}
}
}

/**
* Open form preview in a new tab
*/
/**
 * Opens the form URL in a new browser tab
 * @param {string} formUrl - URL of the deployed form
 */
window.openFormPreview = function(formUrl) {
window.open(formUrl, '_blank');
}

/**
* Update form preview in the node
*/
/**
 * Regenerates form HTML and updates deployment
 * @param {string} nodeId - ID of form node
 */
window.updateFormPreview = function(nodeId) {
const node = window.flowBuilder.nodes.get(nodeId);
if (!node) return;

const subdomain = node.settings?.subdomain;
if (!subdomain) return;

// Regenerate the form to make sure it's up to date
generateForm(node).then(() => {
console.log('Form updated for preview');
}).catch(error => {
console.error('Error updating form:', error);
});
}