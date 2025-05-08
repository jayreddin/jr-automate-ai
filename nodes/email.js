export default {
    title: 'Email',
    icon: '✉️',
    category: 'Communication',
    color: '#38bdf8', // Light blue color
    inputs: 1,
    outputs: 1,
    defaultSettings: {
        to: '',
        cc: '',
        bcc: '',
        subject: '',
        body: '',
        service: 'smtp', // Options: smtp, api
        smtpSettings: {
            host: '',
            port: 587,
            secure: false,
            user: '',
            password: ''
        },
        useInput: false,
        attachFiles: false
    },
    
    // Help documentation
    help: {
        title: "Email Node",
        description: "Sends emails using SMTP server or email API integration. This node allows you to send emails with customizable subject, body, and recipients as part of your automation flow.",
        sections: [
            {
                title: "Basic Setup",
                content: "Configure the email recipients, subject, and body content. You can either set these values directly or receive them from upstream nodes.\n\nTo use input data from previous nodes, enable 'Use input data' and ensure your input is formatted as an object with to, subject, and body properties."
            },
            {
                title: "SMTP Configuration",
                content: "Host: Your SMTP server address (e.g., smtp.gmail.com)\nPort: SMTP port (commonly 587 for TLS or 465 for SSL)\nUser: Your email username or address\nPassword: Your email password or app password\n\nNote: Many email providers require app-specific passwords for SMTP access."
            },
            {
                title: "Security Note",
                content: "Email credentials are stored in your flow. For sensitive production environments, consider using environment variables or a secure credentials manager.\n\nWhen sharing flows, be careful not to share your email credentials."
            },
            {
                title: "Best Practices",
                content: "Test emails with a limited recipient list before sending to larger groups\nUse Transform nodes to create dynamic email content\nAvoid sending emails in loops without delay nodes\nConsider adding error handling for email delivery issues"
            }
        ]
    },
    
    // Format log messages
    formatLogMessage: (message, type, node) => {
        if (type === 'info' && message.includes('Executing')) {
            return `Preparing to send email...`;
        }
        
        if (type === 'success') {
            const recipients = node.settings?.to || 'no recipients';
            return `Email sent to: ${recipients}`;
        }
        
        return message;
    },
    
    // Add execution state hooks
    onExecutionStart: (element, node) => {
        // Add sending animation
        const sendingIndicator = document.createElement('div');
        sendingIndicator.className = 'email-sending-indicator';
        sendingIndicator.innerHTML = '✉️';
        sendingIndicator.style.position = 'absolute';
        sendingIndicator.style.top = '10px';
        sendingIndicator.style.right = '10px';
        sendingIndicator.style.fontSize = '18px';
        sendingIndicator.style.animation = 'sending-email 1.5s infinite ease-in-out';
        
        // Add animation styles
        if (!document.getElementById('email-node-animations')) {
            const style = document.createElement('style');
            style.id = 'email-node-animations';
            style.textContent = `
                @keyframes sending-email {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    50% { transform: translateY(-10px) rotate(5deg); opacity: 0.8; }
                    100% { transform: translateY(0) rotate(0deg); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        const nodeContent = element.querySelector('.node-content');
        if (nodeContent) {
            nodeContent.appendChild(sendingIndicator);
        }
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Remove sending indicator
        const indicator = element.querySelector('.email-sending-indicator');
        if (indicator) {
            indicator.remove();
        }
        
        // Add success or error indicator
        if (success) {
            const successIcon = document.createElement('div');
            successIcon.className = 'email-success';
            successIcon.innerHTML = '✓';
            successIcon.style.position = 'absolute';
            successIcon.style.top = '10px';
            successIcon.style.right = '10px';
            successIcon.style.fontSize = '18px';
            successIcon.style.color = '#4ade80';
            successIcon.style.opacity = '1';
            successIcon.style.animation = 'fade-out 2s forwards';
            
            // Add animation
            if (!document.getElementById('email-result-animation')) {
                const style = document.createElement('style');
                style.id = 'email-result-animation';
                style.textContent = `
                    @keyframes fade-out {
                        0% { opacity: 1; }
                        75% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            const nodeContent = element.querySelector('.node-content');
            if (nodeContent) {
                nodeContent.appendChild(successIcon);
                setTimeout(() => {
                    if (successIcon.parentNode) {
                        successIcon.parentNode.removeChild(successIcon);
                    }
                }, 2000);
            }
            
            setTimeout(() => element.classList.remove('success'), 1000);
        } else {
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    createContent: (node) => {
        // Add node-specific styling
        const nodeStyleId = `email-node-style-${node.id}`;
        
        if (document.getElementById(nodeStyleId)) {
            document.getElementById(nodeStyleId).remove();
        }
        
        const styleEl = document.createElement('style');
        styleEl.id = nodeStyleId;
        styleEl.textContent = `
            #${node.id} {
                min-width: 300px;
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
            
            #${node.id} .email-body {
                min-height: 80px;
                resize: vertical;
            }
            
            #${node.id} .checkbox-option {
                display: flex;
                align-items: center;
                gap: 6px;
                font-size: 0.8rem;
                margin-top: 8px;
                margin-bottom: 8px;
            }
            
            #${node.id} .checkbox-option input {
                margin: 0;
            }
            
            #${node.id} .email-tabs {
                display: flex;
                margin-bottom: 10px;
                border-bottom: 1px solid var(--node-border);
            }
            
            #${node.id} .email-tab {
                padding: 4px 8px;
                font-size: 0.8rem;
                cursor: pointer;
                border-bottom: 2px solid transparent;
            }
            
            #${node.id} .email-tab.active {
                border-bottom-color: #38bdf8;
                color: #38bdf8;
            }
            
            #${node.id} .tab-content {
                display: none;
            }
            
            #${node.id} .tab-content.active {
                display: block;
            }
        `;
        document.head.appendChild(styleEl);
        
        // Get settings with defaults
        const settings = node.settings || {};
        const smtpSettings = settings.smtpSettings || {};
        const useInput = settings.useInput === true;
        const attachFiles = settings.attachFiles === true;
        const service = settings.service || 'smtp';
        
        return `
            <div class="node-content">
                <!-- Tabs -->
                <div class="email-tabs">
                    <div class="email-tab ${!settings.activeTab || settings.activeTab === 'message' ? 'active' : ''}" 
                         onclick="document.querySelectorAll('#${node.id} .email-tab').forEach(t => t.classList.remove('active')); 
                                 this.classList.add('active');
                                 document.querySelectorAll('#${node.id} .tab-content').forEach(c => c.classList.remove('active'));
                                 document.getElementById('message-tab-${node.id}').classList.add('active');
                                 window.flowBuilder.updateNodeSetting('${node.id}', 'activeTab', 'message');">
                        Message
                    </div>
                    <div class="email-tab ${settings.activeTab === 'settings' ? 'active' : ''}" 
                         onclick="document.querySelectorAll('#${node.id} .email-tab').forEach(t => t.classList.remove('active')); 
                                 this.classList.add('active');
                                 document.querySelectorAll('#${node.id} .tab-content').forEach(c => c.classList.remove('active'));
                                 document.getElementById('settings-tab-${node.id}').classList.add('active');
                                 window.flowBuilder.updateNodeSetting('${node.id}', 'activeTab', 'settings');">
                        Settings
                    </div>
                </div>
                
                <!-- Message Tab -->
                <div id="message-tab-${node.id}" class="tab-content ${!settings.activeTab || settings.activeTab === 'message' ? 'active' : ''}">
                    <label class="checkbox-option">
                        <input type="checkbox" 
                            ${useInput ? 'checked' : ''}
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'useInput', this.checked);
                                       document.getElementById('manual-fields-${node.id}').style.display = this.checked ? 'none' : 'block';">
                        Use input data for email content
                    </label>
                    
                    <div id="manual-fields-${node.id}" style="display: ${useInput ? 'none' : 'block'}">
                        <div class="node-label">To</div>
                        <input type="text" class="node-input"
                            value="${settings.to || ''}"
                            placeholder="recipient@example.com"
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'to', this.value)">
                        
                        <div class="node-label">CC</div>
                        <input type="text" class="node-input"
                            value="${settings.cc || ''}"
                            placeholder="cc@example.com"
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'cc', this.value)">
                        
                        <div class="node-label">BCC</div>
                        <input type="text" class="node-input"
                            value="${settings.bcc || ''}"
                            placeholder="bcc@example.com"
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'bcc', this.value)">
                        
                        <div class="node-label">Subject</div>
                        <input type="text" class="node-input"
                            value="${settings.subject || ''}"
                            placeholder="Email subject"
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'subject', this.value)">
                        
                        <div class="node-label">Body</div>
                        <textarea class="node-input email-body"
                            placeholder="Email content"
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'body', this.value)">${settings.body || ''}</textarea>
                    </div>
                    
                    <label class="checkbox-option">
                        <input type="checkbox" 
                            ${attachFiles ? 'checked' : ''}
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'attachFiles', this.checked)">
                        Allow file attachments
                    </label>
                </div>
                
                <!-- Settings Tab -->
                <div id="settings-tab-${node.id}" class="tab-content ${settings.activeTab === 'settings' ? 'active' : ''}">
                    <div class="node-label">Service Type</div>
                    <select class="node-select" 
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'service', this.value);
                                  document.getElementById('smtp-settings-${node.id}').style.display = this.value === 'smtp' ? 'block' : 'none';">
                        <option value="smtp" ${service === 'smtp' ? 'selected' : ''}>SMTP Server</option>
                        <option value="api" ${service === 'api' ? 'selected' : ''}>Email API</option>
                    </select>
                    
                    <div id="smtp-settings-${node.id}" style="display: ${service === 'smtp' ? 'block' : 'none'}">
                        <div class="node-label">SMTP Host</div>
                        <input type="text" class="node-input"
                            value="${smtpSettings.host || ''}"
                            placeholder="smtp.example.com"
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'smtpSettings', {...(node.settings?.smtpSettings || {}), host: this.value})">
                        
                        <div class="node-label">Port</div>
                        <input type="number" class="node-input"
                            value="${smtpSettings.port || 587}"
                            placeholder="587"
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'smtpSettings', {...(node.settings?.smtpSettings || {}), port: parseInt(this.value)})">
                        
                        <div class="node-label">Username</div>
                        <input type="text" class="node-input"
                            value="${smtpSettings.user || ''}"
                            placeholder="your@email.com"
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'smtpSettings', {...(node.settings?.smtpSettings || {}), user: this.value})">
                        
                        <div class="node-label">Password</div>
                        <input type="password" class="node-input"
                            value="${smtpSettings.password || ''}"
                            placeholder="••••••••"
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'smtpSettings', {...(node.settings?.smtpSettings || {}), password: this.value})">
                        
                        <label class="checkbox-option">
                            <input type="checkbox" 
                                ${smtpSettings.secure ? 'checked' : ''}
                                onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'smtpSettings', {...(node.settings?.smtpSettings || {}), secure: this.checked})">
                            Use SSL/TLS
                        </label>
                    </div>
                </div>
            </div>
        `;
    },
    
    execute: async (node, input, context) => {
        try {
            // Determine if we're using input data or configured values
            const useInput = node.settings?.useInput === true;
            const service = node.settings?.service || 'smtp';
            
            // Set up email data
            let emailData = {};
            
            if (useInput) {
                // Use input for email content
                if (!input || typeof input !== 'object') {
                    throw new Error('Input must be an object with email properties when using input data');
                }
                
                emailData = {
                    to: input.to || '',
                    cc: input.cc || '',
                    bcc: input.bcc || '',
                    subject: input.subject || '',
                    body: input.body || '',
                    attachments: input.attachments || []
                };
            } else {
                // Use configured values
                emailData = {
                    to: node.settings?.to || '',
                    cc: node.settings?.cc || '',
                    bcc: node.settings?.bcc || '',
                    subject: node.settings?.subject || '',
                    body: node.settings?.body || '',
                    attachments: []
                };
            }
            
            // Validate email data
            if (!emailData.to) {
                throw new Error('Recipient email address is required');
            }
            
            if (!emailData.subject) {
                throw new Error('Email subject is required');
            }
            
            // Handle file attachments if enabled
            const attachFiles = node.settings?.attachFiles === true;
            if (attachFiles && input && input.files) {
                emailData.attachments = Array.isArray(input.files) ? input.files : [input.files];
            }
            
            // Log progress
            context.flowBuilder.log('info', `Preparing to send email to ${emailData.to}`, node.id);
            
            // Send email based on selected service
            if (service === 'smtp') {
                // Get SMTP settings
                const smtpSettings = node.settings?.smtpSettings || {};
                
                if (!smtpSettings.host) {
                    throw new Error('SMTP host is required');
                }
                
                if (!smtpSettings.user) {
                    throw new Error('SMTP username is required');
                }
                
                // Here we would normally use a SMTP library like nodemailer
                // But since we're in the browser, we'll use a hypothetical service
                
                // For demonstration, we'll simulate sending via SMTP
                await sendEmailViaSmtp(emailData, smtpSettings);
                
            } else if (service === 'api') {
                // Simulate sending via an API service
                await sendEmailViaApi(emailData);
            }
            
            // Log success
            context.flowBuilder.log('success', `Email sent successfully to ${emailData.to}`, node.id);
            
            // Return the email data for downstream nodes
            return {
                success: true,
                message: `Email sent to ${emailData.to}`,
                emailData
            };
        } catch (error) {
            throw new Error(`Email sending failed: ${error.message}`);
        }
    }
};

// Simulate sending via SMTP (placeholder for actual implementation)
async function sendEmailViaSmtp(emailData, smtpSettings) {
    console.log('Sending email via SMTP:', emailData, smtpSettings);
    
    // In a real implementation, we would use EmailJS or a similar library
    // that allows sending emails from the browser
    
    // For example, with EmailJS:
    /*
    await emailjs.send(
        'service_id',
        'template_id',
        {
            to_email: emailData.to,
            subject: emailData.subject,
            message: emailData.body
        },
        'user_id' // EmailJS API key
    );
    */
    
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a production environment, we would handle errors and return appropriate responses
    return true;
}

// Simulate sending via API (placeholder for actual implementation)
async function sendEmailViaApi(emailData) {
    console.log('Sending email via API:', emailData);
    
    // In a real implementation, we would call an email API service
    // like SendGrid, Mailchimp, etc.
    
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a production environment, we would handle errors and return appropriate responses
    return true;
}