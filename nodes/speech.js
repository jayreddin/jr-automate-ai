export default {
    title: 'Text to Speech',
    icon: '🔊',
    category: 'Web & Media',
    color: '#0ea5e9', // Changed from CSS variable to direct hex value for teal color
    inputs: 1,
    outputs: 1,
    defaultSettings: {
        language: 'en-US',
        autoPlay: true,
        text: '' // Added for optional direct text input
    },
    
    // Add help documentation
    help: {
        title: "Text to Speech",
        description: "Converts text into spoken audio using Puter's text-to-speech AI service. This node transforms written content into natural-sounding speech in multiple languages.",
        sections: [
            {
                title: "Basic Usage",
                content: "Connect this node to any node that outputs text. The node will convert that text to speech in the selected language and can automatically play it or pass the audio object to the next node."
            },
            {
                title: "Language Options",
                content: "English (US): Default American English voice\nEnglish (UK): British English accent\nFrench: French language voice\nSpanish: Spanish language voice\nGerman: German language voice\n\nNote: The node supports additional languages as provided by the Puter AI text-to-speech API."
            },
            {
                title: "Auto-Play",
                content: "When enabled, the audio will play automatically when the node executes. When disabled, the audio object is created but not played, allowing you to control playback in a later node or save the audio."
            },
            {
                title: "Tips & Best Practices",
                content: "Keep text inputs under 3000 characters (API limit)\nFor long passages, break text into smaller chunks using multiple nodes\nFor natural-sounding speech, include proper punctuation in your text\nUse a Transform node before this node to format text specifically for speech\nConsider disabling Auto-Play when processing multiple items in a loop"
            }
        ]
    },
    
    // Format log messages
    formatLogMessage: (message, type, node) => {
        const language = node.settings?.language || 'en-US';
        
        if (type === 'info' && message.includes('Executing')) {
            return `Converting text to speech (${language})...`;
        }
        
        if (type === 'success') {
            const autoPlay = node.settings?.autoPlay !== false;
            const langDisplayNames = {
                'en-US': 'English (US)',
                'en-GB': 'English (UK)',
                'fr-FR': 'French',
                'es-ES': 'Spanish',
                'de-DE': 'German'
            };
            const displayLanguage = langDisplayNames[language] || language;
            
            return `Audio created in ${displayLanguage}${autoPlay ? ' (auto-playing)' : ''}`;
        }
        
        return message;
    },
    
    // Add execution state hooks
    onExecutionStart: (element, node) => {
        // Add waveform animation to show audio processing
        const audioVisual = document.createElement('div');
        audioVisual.className = 'speech-processing';
        audioVisual.style.position = 'absolute';
        audioVisual.style.top = '10px';
        audioVisual.style.right = '10px';
        audioVisual.style.width = '30px';
        audioVisual.style.height = '20px';
        audioVisual.style.display = 'flex';
        audioVisual.style.alignItems = 'center';
        audioVisual.style.justifyContent = 'space-between';
        
        // Create 3 bars for sound wave visualization
        for (let i = 0; i < 3; i++) {
            const bar = document.createElement('div');
            bar.style.width = '5px';
            bar.style.height = '8px';
            bar.style.backgroundColor = '#0ea5e9';
            bar.style.borderRadius = '2px';
            bar.style.animation = `sound-wave-${i+1} 1s infinite ease-in-out`;
            audioVisual.appendChild(bar);
        }
        
        // Add animation styles
        if (!document.getElementById('speech-animations')) {
            const style = document.createElement('style');
            style.id = 'speech-animations';
            style.textContent = `
                @keyframes sound-wave-1 {
                    0%, 100% { height: 8px; }
                    50% { height: 16px; }
                }
                @keyframes sound-wave-2 {
                    0%, 100% { height: 4px; }
                    25% { height: 16px; }
                    75% { height: 10px; }
                }
                @keyframes sound-wave-3 {
                    0%, 100% { height: 6px; }
                    35% { height: 14px; }
                    65% { height: 8px; }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Append to node content
        const nodeContent = element.querySelector('.node-content');
        if (nodeContent) {
            nodeContent.appendChild(audioVisual);
        }
    },
    
    onExecutionComplete: (element, node, success, result) => {
        // Remove the audio visualization
        const audioVisual = element.querySelector('.speech-processing');
        if (audioVisual) {
            audioVisual.remove();
        }
        
        // Add speaker icon if successful
        if (success) {
            const audioIcon = document.createElement('div');
            audioIcon.className = 'audio-complete';
            audioIcon.innerHTML = '🔊';
            audioIcon.style.position = 'absolute';
            audioIcon.style.top = '10px';
            audioIcon.style.right = '10px';
            audioIcon.style.fontSize = '16px';
            audioIcon.style.opacity = '1';
            audioIcon.style.animation = 'audio-fade 2s forwards';
            
            // Add animation
            if (!document.getElementById('audio-fade-animation')) {
                const style = document.createElement('style');
                style.id = 'audio-fade-animation';
                style.textContent = `
                    @keyframes audio-fade {
                        0% { opacity: 1; transform: scale(1); }
                        70% { opacity: 0.8; transform: scale(1.2); }
                        100% { opacity: 0; transform: scale(1); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            const nodeContent = element.querySelector('.node-content');
            if (nodeContent) {
                nodeContent.appendChild(audioIcon);
                setTimeout(() => {
                    if (audioIcon.parentNode) {
                        audioIcon.parentNode.removeChild(audioIcon);
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
        const nodeStyleId = `speech-node-style-${node.id}`;
        
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
            
            #${node.id} .node-select {
                padding: 0.35rem;
                font-size: 0.8rem;
                min-height: unset;
                margin-bottom: 0.5rem;
                width: 100%;
            }
            
            #${node.id} .checkbox-option {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 8px;
                font-size: 0.8rem;
            }
            
            #${node.id} .checkbox-option input {
                margin: 0;
            }
            
            #${node.id} .text-input {
                margin-top: 0.5rem;
            }
        `;
        document.head.appendChild(styleEl);
        
        // Get current settings with defaults
        const language = node.settings?.language || 'en-US';
        const autoPlay = node.settings?.autoPlay !== false;
        const text = node.settings?.text || '';
        
        return `
            <div class="node-content">
                <div class="node-label">Language</div>
                <select class="node-select" 
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'language', this.value)">
                    <option value="en-US" ${(!language || language === 'en-US') ? 'selected' : ''}>English (US)</option>
                    <option value="en-GB" ${language === 'en-GB' ? 'selected' : ''}>English (UK)</option>
                    <option value="fr-FR" ${language === 'fr-FR' ? 'selected' : ''}>French</option>
                    <option value="es-ES" ${language === 'es-ES' ? 'selected' : ''}>Spanish</option>
                    <option value="de-DE" ${language === 'de-DE' ? 'selected' : ''}>German</option>
                    <option value="it-IT" ${language === 'it-IT' ? 'selected' : ''}>Italian</option>
                    <option value="ja-JP" ${language === 'ja-JP' ? 'selected' : ''}>Japanese</option>
                    <option value="ko-KR" ${language === 'ko-KR' ? 'selected' : ''}>Korean</option>
                    <option value="pt-BR" ${language === 'pt-BR' ? 'selected' : ''}>Portuguese (Brazil)</option>
                    <option value="zh-CN" ${language === 'zh-CN' ? 'selected' : ''}>Chinese (Mandarin)</option>
                </select>
                
                <label class="checkbox-option">
                    <input type="checkbox" 
                        ${autoPlay ? 'checked' : ''}
                        onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'autoPlay', this.checked)">
                    Play automatically
                </label>
                
                <div class="node-label text-input">Optional Text (overrides input)</div>
                <textarea class="node-input" style="min-height: 60px;"
                    onchange="window.flowBuilder.updateNodeSetting('${node.id}', 'text', this.value)"
                    placeholder="Enter text or leave empty to use node input..."
                >${text}</textarea>
            </div>
        `;
    },
    
    execute: async (node, input, context) => {
        try {
            // Use optional text from settings or input from previous node
            const textToConvert = node.settings?.text || input;
            
            if (!textToConvert) {
                throw new Error('No text to convert to speech');
            }
            
            // Check if text is too long (Puter API limit is 3000 characters)
            if (textToConvert.length > 3000) {
                context.flowBuilder.log('warning', 
                    `Text exceeds 3000 character limit. Truncating to first 3000 characters.`, 
                    node.id);
                
                textToConvert = textToConvert.substring(0, 3000);
            }
            
            const language = node.settings?.language || 'en-US';
            const autoPlay = node.settings?.autoPlay !== false;

            // Convert text to speech using Puter API
            const audio = await puter.ai.txt2speech(textToConvert, language);

            if (autoPlay) {
                audio.play();
            }

            // Log success with character count
            context.flowBuilder.log('success', 
                `Generated speech from text (${textToConvert.length} characters)`, 
                node.id);

            // Return the audio object for potential downstream use
            return {
                text: textToConvert,
                audio: audio,
                language: language
            };
        } catch (error) {
            throw new Error(`Text to speech failed: ${error.message}`);
        }
    }
};