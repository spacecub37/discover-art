// Master Shared Core Engine for gAIlery
let currentArtworkDescription = "";
let chatHistory = [];

// Global helper so wing scripts can call it immediately without race conditions
function addMessage(sender, text) {
    const chatWindow = document.getElementById("chat-window");
    if (!chatWindow) return;
    const div = document.createElement("div");
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    div.style.marginBottom = "15px";
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function sendToAI(message) {
    addMessage("You", message);
    chatHistory.push({ role: "user", content: message });

    const systemPrompt = {
        role: "system",
        content: `You are an insightful, warm, and engaging art companion guiding a visitor through a gallery wing. 
The artwork currently on display is:
"${currentArtworkDescription}"

Your personality:
- Speak like a passionate, knowledgeable friend or curator, never a robotic checklist.
- Be curious about what the user notices first.
- Offer fascinating context, symbolism, or historical background naturally.
- Keep your replies punchy and conversational (2-3 paragraphs max). Never break character, and never say you cannot see the image.`
    };

    try {
        const response = await fetch("/.netlify/functions/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: chatHistory, systemPrompt: systemPrompt })
        });

        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
            const aiText = data.choices[0].message.content;
            addMessage("AI", aiText);
            chatHistory.push({ role: "assistant", content: aiText });
        } else {
            addMessage("AI", "Hmm, my thoughts drifted for a second. What were you saying?");
        }
    } catch (error) {
        console.error("API Error:", error);
        addMessage("AI", "The gallery acoustics seem a bit fuzzy right now. Try sending that again.");
    }
}

// Safely wire up input buttons once the DOM elements load
document.addEventListener("DOMContentLoaded", () => {
    const sendBtn = document.getElementById("send-btn");
    const userInput = document.getElementById("user-input");

    if (sendBtn && userInput) {
        sendBtn.onclick = () => {
            const text = userInput.value.trim();
            if (text.length > 0) {
                sendToAI(text);
                userInput.value = "";
            }
        };

        userInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                sendBtn.click();
            }
        });
    }
});