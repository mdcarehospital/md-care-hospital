(function() {
    const ui = `
    <div id="md-chatbot" class="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
        <div id="md-chat-window" class="bg-white w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-100 hidden flex-col overflow-hidden mb-4 transition-all">
            <div class="bg-primary text-white p-4 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <i class="fa-solid fa-robot text-xl"></i>
                    <span class="font-bold">MD Care AI</span>
                </div>
                <button id="md-chat-close" class="hover:text-gray-200"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div id="md-chat-messages" class="p-4 h-80 overflow-y-auto bg-slate-50 flex flex-col gap-3">
                <div class="flex gap-2">
                    <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"><i class="fa-solid fa-robot"></i></div>
                    <div class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-700">Hello! I am the MD Care AI assistant. How can I help you today?</div>
                </div>
            </div>
            <form id="md-chat-form" class="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input type="text" id="md-chat-input" placeholder="Type your question..." class="flex-grow px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" autocomplete="off">
                <button type="submit" class="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center hover:bg-teal-700 flex-shrink-0"><i class="fa-solid fa-paper-plane"></i></button>
            </form>
        </div>
        <button id="md-chat-toggle" class="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-teal-700 hover:scale-105 transition animate-glow-pulse text-2xl">
            <i class="fa-solid fa-message"></i>
        </button>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', ui);

    const chatWindow = document.getElementById('md-chat-window');
    const messages = document.getElementById('md-chat-messages');
    const form = document.getElementById('md-chat-form');
    const input = document.getElementById('md-chat-input');

    document.getElementById('md-chat-toggle').onclick = () => chatWindow.classList.toggle('hidden');
    document.getElementById('md-chat-close').onclick = () => chatWindow.classList.add('hidden');

    function appendMessage(text, sender) {
        const div = document.createElement('div');
        div.className = `flex gap-2 ${sender === 'user' ? 'flex-row-reverse' : ''}`;
        const bubbleClass = sender === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100';
        const icon = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
        const iconBg = sender === 'user' ? 'bg-secondary' : 'bg-primary';
        
        div.innerHTML = `
            <div class="w-8 h-8 ${iconBg} rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">${icon}</div>
            <div class="p-3 rounded-2xl shadow-sm text-sm max-w-[80%] ${bubbleClass}">${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</div>
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

        const typingId = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = typingId;
        typingDiv.className = 'text-xs text-slate-400 italic ml-10';
        typingDiv.innerText = 'AI is typing...';
        messages.appendChild(typingDiv);
        messages.scrollTop = messages.scrollHeight;

        try {
            const context = "You are the MD Care Assistant, a helpful AI receptionist for MD Care Hospital. Keep answers under 3 sentences. Be polite. Recommend booking an appointment for medical issues. Context: " + document.body.innerText.substring(0, 2000) + "\\nUser asks: " + text;
            
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ context })
            });
            
            const data = await res.json();
            document.getElementById(typingId).remove();

            if (!res.ok) {
                appendMessage("Error: " + (data.error || "Server issue."), 'bot');
            } else {
                appendMessage(data.reply, 'bot');
            }
        } catch (err) {
            document.getElementById(typingId).remove();
            appendMessage("Network error. Please try again later.", 'bot');
        }
    };
})();