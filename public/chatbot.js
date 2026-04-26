(function() {
    // 1. Inject the HTML into the DOM
    const chatbotHTML = `
    <div id="chatbot-widget" class="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
        <!-- Chat Window -->
        <div id="chatbot-window" class="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden mb-4 hidden flex-col transition-all duration-300 origin-bottom-right">
            <!-- Header -->
            <div class="bg-primary text-white p-4 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center text-primary text-xl">
                        <i class="fa-solid fa-robot"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm">MD Care Assistant</h4>
                        <p class="text-xs text-teal-100">Online</p>
                    </div>
                </div>
                <button onclick="toggleChatbot()" class="text-teal-100 hover:text-white transition"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            
            <!-- Messages -->
            <div id="chatbot-messages" class="p-4 h-80 overflow-y-auto bg-slate-50 flex flex-col gap-3 no-scrollbar">
                <!-- Bot Message -->
                <div class="flex items-start gap-2">
                    <div class="w-8 h-8 bg-primary rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs"><i class="fa-solid fa-robot"></i></div>
                    <div class="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-600 max-w-[85%]">
                        Hello! I'm the MD Care Assistant. How can I help you today? You can ask me about our hospital info, departments, or describe your symptoms for general guidance.
                    </div>
                </div>
            </div>
            
            <!-- Input Area -->
            <div class="p-3 bg-white border-t border-slate-100">
                <form id="chatbot-form" class="flex items-center gap-2">
                    <input type="text" id="chatbot-input" placeholder="Type your message..." class="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition">
                    <button type="submit" class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-teal-700 transition flex-shrink-0"><i class="fa-solid fa-paper-plane"></i></button>
                </form>
            </div>
        </div>
        
        <!-- Toggle Button -->
        <button id="chatbot-toggle" onclick="toggleChatbot()" class="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-teal-700 transition hover:scale-105 animate-glow-pulse">
            <i class="fa-solid fa-message text-2xl"></i>
        </button>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    // 2. Chatbot Logic
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotMessages = document.getElementById('chatbot-messages');
    const chatbotForm = document.getElementById('chatbot-form');
    const chatbotInput = document.getElementById('chatbot-input');

    window.toggleChatbot = function() {
        chatbotWindow.classList.toggle('hidden');
        chatbotWindow.classList.toggle('flex');
    };

    // Added msgId parameter to handle removing the "typing" animation
    function addChatMessage(text, isUser = false, msgId = null) {
        const msgDiv = document.createElement('div');
        if (msgId) msgDiv.id = msgId;
        msgDiv.className = `flex items-start gap-2 ${isUser ? 'flex-row-reverse' : ''}`;
        
        let avatar = `<div class="w-8 h-8 bg-primary rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs"><i class="fa-solid fa-robot"></i></div>`;
        
        if (isUser) {
            if (localStorage.getItem('mdcare_auth') === 'true') {
                const picUrl = localStorage.getItem('mdcare_profilePic');
                const userInitial = localStorage.getItem('mdcare_userInitial') || 'U';
                if (picUrl) {
                    avatar = `<div class="w-8 h-8 bg-secondary rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs overflow-hidden shadow-sm"><img src="${picUrl}" class="w-full h-full object-cover"></div>`;
                } else {
                    avatar = `<div class="w-8 h-8 bg-secondary rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm">${userInitial}</div>`;
                }
            } else {
                avatar = `<div class="w-8 h-8 bg-secondary rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs shadow-sm"><i class="fa-solid fa-user"></i></div>`;
            }
        }
        
        const bubble = isUser ? 
            `<div class="bg-primary p-3 rounded-2xl rounded-tr-none shadow-sm text-sm text-white max-w-[85%]">${text}</div>` : 
            `<div class="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-600 max-w-[85%]">${text}</div>`;
            
        msgDiv.innerHTML = avatar + bubble;
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    async function getAIResponse(input) {
        // Extract basic text from the current page to give the AI context
        // Limit to 3000 characters to keep the prompt size reasonable
        const pageContent = document.body.innerText.substring(0, 3000);

        // The 'system prompt' that gives the AI its persona and constraints
        const promptContext = `You are the MD Care Assistant, a helpful and polite AI receptionist for MD Care Hospital located in Basti DanishManda, Jalandhar. Keep your answers brief, friendly, and professional (under 3 sentences if possible). Contact number is 8091919997. You may answer general health questions and provide basic guidance for normal symptoms (like a mild fever). However, advise the user that you are an AI, not a doctor, and recommend they book an appointment or visit the 24/7 Emergency department for severe symptoms.
        
        Here is the text content of the page the user is currently looking at. Use it to answer their questions if relevant:
        "${pageContent}"
        
        User says: ${input}`;

        // Point to your secure backend instead of Google directly
        const endpoint = `/api/chat`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: promptContext
                })
            });

            if (!response.ok) {
                let errorDetails = await response.text();
                try {
                    const jsonError = JSON.parse(errorDetails);
                    if (jsonError.error) {
                        errorDetails = jsonError.error.message || JSON.stringify(jsonError.error);
                    }
                } catch(e) {}
                console.error("Backend Error Details:", errorDetails);
                throw new Error(errorDetails || `Status: ${response.status}`);
            }
            
            const data = await response.json();
            // Check if the Gemini API returned expected content or if it was blocked by safety settings
            if (data.candidates && data.candidates.length > 0) {
                return data.candidates[0].content.parts[0].text;
            } else if (data.promptFeedback) {
                console.warn("Prompt blocked by safety settings:", data.promptFeedback);
                return "I apologize, but I cannot respond to that message.";
            } else {
                throw new Error("Unexpected API response: " + JSON.stringify(data));
            }
        } catch (error) {
            console.error("Chatbot AI Error:", error);
            
            // Provide specific debugging help directly in the chat window
            if (window.location.protocol === 'file:') {
                return "⚠️ **Connection Blocked**: You are opening this website directly from your hard drive (`file://`). Browsers block AI network requests this way for security. Please run your site using a local server (like VS Code 'Live Server').";
            }
            
            if (error.message && !error.message.includes('Failed to fetch')) {
                return "⚠️ **Server Error**: " + error.message;
            }
            return "I'm having trouble connecting to my network right now. Please try again later.";
        }
    }

    if(chatbotForm) {
        chatbotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = chatbotInput.value.trim();
            if (!text) return;
            
            addChatMessage(text, true);
            chatbotInput.value = '';
            
            // Showin a "Typing..." message
            const typingId = 'typing-' + Date.now();
            const typingHtml = `<span class="flex gap-1 items-center h-4"><span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span><span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.15s"></span><span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.3s"></span></span>`;
            addChatMessage(typingHtml, false, typingId);

            // Wait for the AI API to return a response
            const response = await getAIResponse(text);
            
            // Remove the typing animation and show the actual text
            const typingElement = document.getElementById(typingId);
            if(typingElement) typingElement.remove();
            
            // Parse markdown bold text (**) into HTML for better formatting
            const formattedResponse = response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            addChatMessage(formattedResponse, false);
        });
    }
})();