/**
 * File Operations Node Module
 * Handles file system operations in Puter cloud storage
 */
export default {
    /**
     * Node Configuration
     */
    title: 'File Operations',
    icon: '📁',
    category: 'Data & Files',
    color: '#22c55e', // Forest green for files theme
    inputs: 1,
    outputs: 1,
    
    /**
     * Default node settings
     */
    defaultSettings: {
        operation: 'read', // File operation type
        filePath: '', // Source file path
        destPath: '', // Destination path for copy/move
        createParentDirs: true, // Auto-create parent directories
        fileType: 'text' // File content type
    },
    



    help: {
        title: "File Operations",
        description: "Performs various file and directory operations in the Puter cloud storage. This node can read, write, modify, copy, move, and delete files and directories.",
        sections: [
            {
                title: "Basic Usage",
                content: "Select the desired file operation from the dropdown menu, provide the necessary file paths, and configure any additional options. The node will execute the file operation and pass the result to the next node in the flow."
            },
            {
                title: "Operations",
                content: "Read: Retrieves file content. Returns text, JSON object, or binary data depending on the file type setting.\n\nWrite: Creates or overwrites a file with input data.\n\nAppend: Adds input data to the end of an existing file (or creates a new file if it doesn't exist).\n\nDelete: Removes a file or directory.\n\nCopy: Duplicates a file or directory to a new location.\n\nMove: Relocates a file or directory to a new location.\n\nCreate Directory: Makes a new directory at the specified path."
            },
            {
                title: "File Types",
                content: "Text: Regular text content, ideal for plain text files.\n\nJSON: Automatically parses and formats JSON data when reading or writing.\n\nBinary: Preserves raw binary data for files like images or documents."
            },
            {
                title: "Tips & Best Practices",
                content: "Use the Browse button to easily select files or directories\n\nEnable 'Create parent directories' to automatically create missing folders\n\nFor dynamic paths, use Transform nodes before File Operations to construct the path\n\nWhen writing JSON, pass an object as input to automatically format it properly\n\nUse the optional Target Property field to access specific parts of your data structure"
            }
        ]
    },

    
    /**
     * Formats log messages for file operations
     * @param {string} message - The message to format
     * @param {string} type - Message type (success, error)
     * @param {Object} node - Node instance
     * @returns {string} Formatted message with operation context
     */
    formatLogMessage: (message, type, node) => {
        const operation = node.settings?.operation || 'read';
        const filePath = node.settings?.filePath || '[No path]';
        
        if (type === 'success') {
            // For read operations with long content, truncate
            if (operation === 'read' && typeof message === 'string' && message.length > 150) {
                return `[READ] ${filePath} (${message.length} chars): "${message.substring(0, 150)}..."`;
            }
            
            // For other operations
            if (['write', 'append', 'copy', 'move', 'delete', 'mkdir'].includes(operation)) {
                return `[${operation.toUpperCase()}] ${message}`;
            }
        } else if (type === 'error') {
            return `[${operation.toUpperCase()}] Error: ${message}`;
        }
        
        return message;
    },
    
    /**
     * Handles execution start event
     * Provides visual feedback for active file operations
     * @param {HTMLElement} element - Node's DOM element
     * @param {Object} node - Node instance
     */
    onExecutionStart: (element, node) => {
        // Visual feedback for operation in progress
        const operation = node.settings?.operation || 'read';
        
        // Highlight path input field
        const filePathInput = element.querySelector('.file-path-input');
        if (filePathInput) {
            filePathInput.style.border = '2px solid #22c55e';
            filePathInput.style.boxShadow = '0 0 5px rgba(34, 197, 94, 0.5)';
        }
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Reset path field
        const filePathInput = element.querySelector('.file-path-input');
        if (filePathInput) {
            filePathInput.style.border = '';
            filePathInput.style.boxShadow = '';
        }
        
        // Standard success/error behavior
        if (success) {
            setTimeout(() => element.classList.remove('success'), 1000);
        } else {
            setTimeout(() => element.classList.remove('error'), 1000);
        }
    },
    
    /**
     * Creates the node's UI content
     * Generates file operation interface with path inputs and options
     * @param {Object} node - Node instance with settings
     * @returns {string} HTML content for the node
     */
    createContent: (node) => {
        const nodeStyleId = `file-node-style-${node.id}`;
        
        if (document.getElementById(nodeStyleId)) {
            document.getElementById(nodeStyleId).remove();
        }
        
        const styleEl = document.createElement('style');
        styleEl.id = nodeStyleId;
        styleEl.textContent = `
            #${node.id} .file-path-row {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }
            
            #${node.id} .file-path-input {
                flex: 1;
            }
            
            #${node.id} .file-browse-btn {
                background: var(--bg-secondary);
                border: 1px solid var(--node-border);
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 12px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            #${node.id} .file-browse-btn:hover {
                background: var(--accent-primary);
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
                text-align: center;
                margin-top: 5px;
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
        `;
        document.head.appendChild(styleEl);
        
        // Determine what UI elements to show based on operation
        const operation = node.settings?.operation || 'read';
        const needsDestPath = ['copy', 'move'].includes(operation);
        const showFileType = ['read', 'write', 'append'].includes(operation);
        
        // Determine if advanced options should be shown
        const showAdvanced = node.settings?.fileType !== 'text' || 
                           node.settings?.createParentDirs === false;
        
        return `
            <div class="node-content">
                <div class="node-label">Operation</div>
                <select class="node-select" 
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'operation', this.value);
                              window.fileNode_refreshContent('${node.id}');">
                    <option value="read" ${(node.settings?.operation === 'read' || !node.settings?.operation) ? 'selected' : ''}>Read</option>
                    <option value="write" ${node.settings?.operation === 'write' ? 'selected' : ''}>Write</option>
                    <option value="append" ${node.settings?.operation === 'append' ? 'selected' : ''}>Append</option>
                    <option value="delete" ${node.settings?.operation === 'delete' ? 'selected' : ''}>Delete</option>
                    <option value="copy" ${node.settings?.operation === 'copy' ? 'selected' : ''}>Copy</option>
                    <option value="move" ${node.settings?.operation === 'move' ? 'selected' : ''}>Move</option>
                    <option value="mkdir" ${node.settings?.operation === 'mkdir' ? 'selected' : ''}>Create Directory</option>
                </select>
                
                <div class="node-label">Source Path</div>
                <div class="file-path-row">
                    <input type="text" class="node-input file-path-input"
                        value="${node.settings?.filePath || ''}"
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'filePath', this.value)"
                        placeholder="${operation === 'mkdir' ? 'path/to/directory' : 'path/to/file.txt'}">
                    <button class="file-browse-btn" 
                        onclick="window.fileNode_browse('${node.id}', '${operation}', 'source')">
                        Browse
                    </button>
                </div>
                
                ${needsDestPath ? `
                <div class="node-label">Destination Path</div>
                <div class="file-path-row">
                    <input type="text" class="node-input dest-path-input"
                        value="${node.settings?.destPath || ''}"
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'destPath', this.value)"
                        placeholder="path/to/destination">
                    <button class="file-browse-btn" 
                        onclick="window.fileNode_browse('${node.id}', '${operation}', 'dest')">
                        Browse
                    </button>
                </div>
                ` : ''}
                
                <div class="advanced-options" id="advanced-options-${node.id}" style="display: ${showAdvanced ? 'block' : 'none'}">
                    ${showFileType ? `
                    <div class="node-label">File Type</div>
                    <select class="node-select" 
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'fileType', this.value)">
                        <option value="text" ${(node.settings?.fileType === 'text' || !node.settings?.fileType) ? 'selected' : ''}>Text</option>
                        <option value="json" ${node.settings?.fileType === 'json' ? 'selected' : ''}>JSON</option>
                        <option value="binary" ${node.settings?.fileType === 'binary' ? 'selected' : ''}>Binary</option>
                    </select>
                    ` : ''}
                    
                    <label class="checkbox-option">
                        <input type="checkbox" 
                            ${node.settings?.createParentDirs !== false ? 'checked' : ''}
                            onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'createParentDirs', this.checked)">
                        Create parent directories
                    </label>
                </div>
                
                <div class="option-toggle" 
                    onclick="document.getElementById('advanced-options-${node.id}').style.display = document.getElementById('advanced-options-${node.id}').style.display === 'none' ? 'block' : 'none'; this.innerHTML = document.getElementById('advanced-options-${node.id}').style.display === 'none' ? '▼ Show Advanced Options' : '▲ Hide Advanced Options'">
                    ${showAdvanced ? '▲ Hide Advanced Options' : '▼ Show Advanced Options'}
                </div>
            </div>
        `;
    },
    
    /**
     * Executes the file operation
     * @param {Object} node - Node instance with operation settings
     * @param {*} input - Input data for write/append operations
     * @param {Object} context - Execution context
     * @returns {Promise<*>} Operation result or file content
     * @throws {Error} If file operation fails
     */
    execute: async (node, input, context) => {
        try {
            const operation = node.settings?.operation || 'read';
            const filePath = node.settings?.filePath;
            const fileType = node.settings?.fileType || 'text';
            const createParentDirs = node.settings?.createParentDirs !== false;
            const destPath = node.settings?.destPath;
            
            // Validate file path
            if (!filePath) {
                throw new Error('File path is required');
            }
            
            // Common options
            const options = {
                createMissingParents: createParentDirs
            };
            
            switch (operation) {
                case 'read':
                    // Read file
                    const content = await puter.fs.read(filePath);
                    
                    // Process based on file type
                    if (fileType === 'text') {
                        return await content.text();
                    } else if (fileType === 'json') {
                        const text = await content.text();
                        try {
                            return JSON.parse(text);
                        } catch (e) {
                            throw new Error(`Invalid JSON file: ${e.message}`);
                        }
                    } else {
                        // Return binary data as-is
                        return content;
                    }
                    
                case 'write':
                    // Handle different input types based on fileType
                    let dataToWrite = input;
                    
                    if (fileType === 'json' && typeof input === 'object') {
                        // Format JSON with indentation
                        dataToWrite = JSON.stringify(input, null, 2);
                    } else if (fileType === 'binary' && !(input instanceof Blob)) {
                        // Convert to Blob for binary writing
                        dataToWrite = new Blob([input]);
                    }
                    
                    // Write file
                    await puter.fs.write(filePath, dataToWrite, options);
                    return `File written: ${filePath}`;
                    
                case 'append':
                    let existingContent = '';
                    let dataToAppend = input;
                    
                    // Handle JSON append differently
                    if (fileType === 'json' && typeof input === 'object') {
                        try {
                            // Try to read existing JSON
                            try {
                                const existing = await puter.fs.read(filePath);
                                const existingText = await existing.text();
                                existingContent = JSON.parse(existingText);
                            } catch (error) {
                                // File doesn't exist or isn't valid JSON
                                existingContent = null;
                            }
                            
                            // Handle different JSON structures
                            if (Array.isArray(existingContent)) {
                                // If existing content is an array, add item(s)
                                if (Array.isArray(input)) {
                                    dataToAppend = [...existingContent, ...input];
                                } else {
                                    dataToAppend = [...existingContent, input];
                                }
                            } else if (existingContent && typeof existingContent === 'object') {
                                // If existing content is an object, merge
                                dataToAppend = { ...existingContent, ...input };
                            } else {
                                // Start new object/array
                                dataToAppend = input;
                            }
                            
                            // Convert to string with formatting
                            dataToAppend = JSON.stringify(dataToAppend, null, 2);
                        } catch (error) {
                            throw new Error(`JSON append failed: ${error.message}`);
                        }
                    } else if (fileType === 'text') {
                        // Text file append
                        try {
                            const existing = await puter.fs.read(filePath);
                            existingContent = await existing.text();
                            dataToAppend = `${existingContent}${input}`;
                        } catch (error) {
                            // File doesn't exist yet
                            dataToAppend = input;
                        }
                    } else {
                        // Binary append not well supported, just overwrite
                        dataToAppend = input;
                    }
                    
                    // Write appended data
                    await puter.fs.write(filePath, dataToAppend, options);
                    return `File appended: ${filePath}`;
                
                case 'mkdir':
                    // Create directory
                    const newDir = await puter.fs.mkdir(filePath, options);
                    return `Directory created: ${newDir.path}`;
                
                case 'copy':
                    // Validate destination path
                    if (!destPath) throw new Error('Destination path is required');
                    
                    // Copy file or directory
                    const copiedItem = await puter.fs.copy(filePath, destPath, options);
                    return `Copied to: ${copiedItem.path}`;
                
                case 'move':
                    // Validate destination path
                    if (!destPath) throw new Error('Destination path is required');
                    
                    // Move file or directory
                    const movedItem = await puter.fs.move(filePath, destPath, options);
                    return `Moved to: ${movedItem.path}`;
                
                case 'delete':
                    // Delete file or directory
                    await puter.fs.delete(filePath, { recursive: true });
                    return `Deleted: ${filePath}`;
            }
        } catch (error) {
            throw new Error(`File operation failed: ${error.message}`);
        }
    }
};

/**
 * Helper Functions for File Node UI
 */

// Refreshes node content after operation changes
if (typeof window !== 'undefined') {
    /**
     * Updates node UI when operation type changes
     * @param {string} nodeId - ID of node to refresh
     */
    window.fileNode_refreshContent = function(nodeId) {
        const node = window.flowBuilder.nodes.get(nodeId);
        if (!node) return;
        
        // Get node element
        const nodeEl = document.getElementById(nodeId);
        if (!nodeEl) return;
        
        // Update content
        const nodeContent = nodeEl.querySelector('.node-content');
        if (nodeContent) {
            // Get node type info
            const nodeType = window.flowBuilder.nodeRegistry.getNodeType('file');
            if (nodeType && nodeType.createContent) {
                // Replace content
                nodeContent.innerHTML = nodeType.createContent(node);
            }
        }
    };
    
    /**
     * Handles file/directory browsing for path selection
     * @param {string} nodeId - ID of target node
     * @param {string} operation - Current file operation
     * @param {string} target - Which path to update (source/dest)
     */
    window.fileNode_browse = async function(nodeId, operation, target) {
        try {
            const node = window.flowBuilder.nodes.get(nodeId);
            if (!node) return;
            
            if (target === 'source') {
                if (operation === 'mkdir') {
                    // For mkdir, use directory picker
                    const dir = await puter.ui.showDirectoryPicker();
                    if (dir) {
                        window.flowBuilder.updateNodeSetting(nodeId, 'filePath', dir.path + '/new_directory');
                    }
                } else if (['read', 'delete', 'copy', 'move'].includes(operation)) {
                    // For read operations, show file picker
                    const file = await puter.ui.showOpenFilePicker();
                    if (file) {
                        window.flowBuilder.updateNodeSetting(nodeId, 'filePath', file.path);
                        
                        // Auto-detect file type for read
                        if (operation === 'read') {
                            const extension = file.name.split('.').pop()?.toLowerCase();
                            if (extension && ['json', 'js'].includes(extension)) {
                                window.flowBuilder.updateNodeSetting(nodeId, 'fileType', 'json');
                            } else if (extension && ['jpg', 'png', 'pdf', 'zip'].includes(extension)) {
                                window.flowBuilder.updateNodeSetting(nodeId, 'fileType', 'binary');
                            } else {
                                window.flowBuilder.updateNodeSetting(nodeId, 'fileType', 'text');
                            }
                        }
                    }
                } else {
                    // For write/append, show directory picker then ask for filename
                    const dir = await puter.ui.showDirectoryPicker();
                    if (dir) {
                        const currentPath = node.settings?.filePath || '';
                        const currentFileName = currentPath.split('/').pop() || 'file.txt';
                        window.flowBuilder.updateNodeSetting(nodeId, 'filePath', dir.path + '/' + currentFileName);
                    }
                }
            } else if (target === 'dest' && ['copy', 'move'].includes(operation)) {
                // For destination path in copy/move
                const dir = await puter.ui.showDirectoryPicker();
                if (dir) {
                    window.flowBuilder.updateNodeSetting(nodeId, 'destPath', dir.path);
                }
            }
        } catch (error) {
            console.error('File browser error:', error);
        }
    };
}