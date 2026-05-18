(function() {
    const ui = `
    <div id="md-chatbot" class="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
        <div id="md-chat-window" class="bg-white dark:bg-slate-800 w-[calc(100vw-3rem)] sm:w-96 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 hidden flex-col overflow-hidden mb-4 transition-all transform origin-bottom-right">
            <div class="bg-primary text-white p-4 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-robot text-xl"></i>
                    <span class="font-bold">MD Care AI Assist</span>
                </div>
                <button id="md-chat-close" class="hover:text-gray-200"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div id="md-chat-messages" class="p-4 h-80 overflow-y-auto bg-slate-50 dark:bg-slate-900 flex flex-col gap-3 scroll-smooth">
                <div class="flex gap-2">
                    <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"><i class="fa-solid fa-robot"></i></div>
                    <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-700">Hello! I am the MD Care AI assistant. How can I help you today?</div>
                </div>
            </div>
            <form id="md-chat-form" class="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <input type="text" id="md-chat-input" placeholder="Type your question..." class="flex-grow px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:text-white" autocomplete="off">
                <button type="submit" class="w-10 h-10 min-w-[40px] bg-primary text-white rounded-full flex items-center justify-center hover:bg-teal-700 flex-shrink-0"><i class="fa-solid fa-paper-plane"></i></button>
            </form>
        </div>
        <button id="md-chat-toggle" class="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-teal-700 hover:scale-105 transition animate-glow-pulse text-2xl">
            <i class="fa-solid fa-comment-dots"></i>
        </button>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', ui);

    const chatWindow = document.getElementById('md-chat-window');
    const messages = document.getElementById('md-chat-messages');
    const form = document.getElementById('md-chat-form');
    const input = document.getElementById('md-chat-input');

    let chatMemory = [];

    document.getElementById('md-chat-toggle').onclick = () => {
        chatWindow.classList.toggle('hidden');
        if (!chatWindow.classList.contains('hidden')) {
            input.focus();
        }
    };
    document.getElementById('md-chat-close').onclick = () => chatWindow.classList.add('hidden');


    function appendMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `flex gap-2 ${sender === 'user' ? 'flex-row-reverse' : ''}`;
        const bubbleClass = sender === 'user' ? 'bg-primary text-white rounded-tr-none shadow-md' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm';
        const icon = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
        const iconBg = sender === 'user' ? 'bg-secondary' : 'bg-primary';
        
        let formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
        
        if (sender === 'bot' && (text.toLowerCase().includes('appointment') || text.toLowerCase().includes('book'))) {
            formattedText += `<div class="mt-3"><a href="index.html#appointment" onclick="document.getElementById('md-chat-close').click(); if(typeof handleAppointmentClick === 'function') { event.preventDefault(); handleAppointmentClick(); } else if(typeof openAppointmentModal === 'function') { event.preventDefault(); openAppointmentModal(); }" class="bg-primary text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-teal-700 transition shadow-sm inline-flex items-center w-fit"><i class="fa-solid fa-calendar-check mr-2"></i> Book an Appointment</a></div>`;
        }

        div.innerHTML = `
            <div class="w-8 h-8 ${iconBg} rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">${icon}</div>
            <div class="p-3 rounded-2xl text-sm max-w-[80%] flex flex-col ${bubbleClass}">${formattedText}</div>
        `;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    form.onsubmit = async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;

        appendMessage(text, 'user');
        input.value = '';

        chatMemory.push({ role: 'user', content: text });
        if (chatMemory.length > 10) chatMemory = chatMemory.slice(-10);

        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'flex gap-2';
        typingDiv.innerHTML = `
            <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"><i class="fa-solid fa-robot"></i></div>
            <div class="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
                <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
            </div>
        `;
        messages.appendChild(typingDiv);
        messages.scrollTop = messages.scrollHeight;

        try {
            let docsInfo = "";
            if (window.doctorsList && Array.isArray(window.doctorsList)) {
                docsInfo = "Doctors available: " + window.doctorsList.map(d => `${d.name} (${d.dept})`).join(', ') + ". ";
            }
            
            const pageContext = document.body.innerText.substring(0, 1500).replace(/\n/g, " ");
            const systemPrompt = `You are the MD Care AI Assistant, a helpful, empathetic receptionist for MD Care Hospital. 
            Rules:
            1. Keep answers concise (under 3 sentences).
            2. Be polite and professional.
            3. If the user mentions symptoms or needs a doctor, recommend booking an appointment and mention a relevant doctor if possible.
            4. Do NOT use markdown links, just use bolding for emphasis.
            
            ${docsInfo}
            Page context: ${pageContext}`;
            
            let historyStr = chatMemory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
            const context = systemPrompt + "\n\nRecent Conversation:\n" + historyStr;
            
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context })
            });
            
            const data = await res.json();
            const tDiv = document.getElementById(typingId);
            if (tDiv) tDiv.remove();

            if (!res.ok) {
                appendMessage("Error: " + (data.error || "Server issue."), 'bot');
            } else {
                appendMessage(data.reply, 'bot');
                chatMemory.push({ role: 'assistant', content: data.reply });
                if (chatMemory.length > 10) chatMemory = chatMemory.slice(-10);
            }
        } catch (err) {
            const tDiv = document.getElementById(typingId);
            if (tDiv) tDiv.remove();
            appendMessage("Network error. Please try again later.", 'bot');
        }
    };
})();