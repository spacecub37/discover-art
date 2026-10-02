let currentArtworkDescription = "";
let chatHistory = [];

// 1. FETCH LIVE ARTWORK FROM THE ART INSTITUTE OF CHICAGO API
async function loadRandomArtwork() {
    try {
        const response = await fetch("https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&limit=50&fields=id,title,image_id,artist_title,description");
        const data = await response.json();
        
        // Filter out any results that don't have an image_id
        const validArtworks = data.data.filter(art => art.image_id);
        const randomArt = validArtworks[Math.floor(Math.random() * validArtworks.length)];
        
       const imageId = randomArt.image_id;
        const imageUrl = `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`;
        
        // Set the image on screen with a bulletproof local fallback
        const imgElement = document.getElementById("art-image");
        if (imgElement) {
            imgElement.src = imageUrl;
            
            // If the museum blocks it, gracefully drop back to a local image instead of looping
            imgElement.onerror = () => {
                console.warn("Museum image restricted/blocked, switching to local backup image.");
                imgElement.src = "images/test1.jpg"; // Uses your local USB test image!
            };
        }

        // Grab description or fallback, and strip HTML tags
        let rawDesc = randomArt.description || `Title: ${randomArt.title} by ${randomArt.artist_title || "Unknown"}`;
        currentArtworkDescription = rawDesc.replace(/<[^>]*>?/gm, '');

        // Clear chat window and reset history for the new piece
        document.getElementById("chat-window").innerHTML = ""; 
        chatHistory = [];
        
        addMessage("AI", `New live artwork loaded: "${randomArt.title}". What stands out to you about this one?`);

    } catch (error) {
        console.error("Failed to fetch live art:", error);
        addMessage("AI", "Oops, the museum database is taking a nap. Try clicking Next again!");
    }
}

// Hook up the Next button to our live loader
document.getElementById("next-btn").onclick = loadRandomArtwork;

// CHAT SYSTEM
const chatWindow = document.getElementById("chat-window");
const sendBtn = document.getElementById("send-btn");
const userInput = document.getElementById("user-input");

function addMessage(sender, text) {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    div.style.marginBottom = "15px"; // Adds clean separation between turns!
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Send message to Netlify serverless function (No API key needed here!)
async function sendToAI(message) {
    addMessage("You", message);
    chatHistory.push({ role: "user", content: message });

    const systemPrompt = {
        role: "system",
        content: `You are an art interpretation companion. 
The user is looking at an artwork with this background information/description:
"${currentArtworkDescription}"

Your job is to:
- encourage the user to share their thoughts
- interpret the artwork based on the description
- compare their interpretation to common readings
- gently challenge or expand their view
- keep the conversation flowing naturally
- never say you cannot see the artwork
- never say there are no clues
- always base your interpretation on the text provided above.`
    };

    try {
        const response = await fetch("/.netlify/functions/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: chatHistory,
                systemPrompt: systemPrompt
            })
        });

        const data = await response.json();
        
        // OpenAI responses nested through the function return standard choices
        if (data.choices && data.choices.length > 0) {
            const aiText = data.choices[0].message.content;
            addMessage("AI", aiText);
            chatHistory.push({ role: "assistant", content: aiText });
        } else {
            addMessage("AI", "Oops, I had trouble thinking about that response.");
        }

    } catch (error) {
        console.error("API Error:", error);
        addMessage("AI", "Network error communicating with the AI.");
    }
}

// Handle send button
sendBtn.onclick = () => {
    const text = userInput.value.trim();
    if (text.length > 0) {
        sendToAI(text);
        userInput.value = "";
    }
};

// Allow pressing 'Enter' to send
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendBtn.click();
    }
});

// Initial load on startup
loadRandomArtwork();
