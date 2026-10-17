// Inherits chat engine and shared variables from core.js

// 1. FETCH LIVE ARTWORK FROM THE ART INSTITUTE OF CHICAGO API
async function loadGalleryArt() {
    try {
        const response = await fetch("https://api.artic.edu/api/v1/artworks/search?query[term][is_public_domain]=true&limit=50&fields=id,title,image_id,artist_title,description");
        const data = await response.json();
        
        // Filter out any results that don't have an image_id
        const validArtworks = data.data.filter(art => art.image_id);
        const randomArt = validArtworks[Math.floor(Math.random() * validArtworks.length)];
        
        const imageId = randomArt.image_id;
        const imageUrl = `https://www.artic.edu/iiif/2/${imageId}/full/843,/0/default.jpg`;
        
        // Set the image on screen with a bulletproof fallback
        const imgElement = document.getElementById("art-image");
        if (imgElement) {
            imgElement.src = imageUrl;
            imgElement.onerror = () => {
                console.warn("Museum image restricted/blocked, switching to local backup image.");
                imgElement.src = "../images/test1.jpg";
            };
        }

        // Grab description or fallback, and strip HTML tags
        let rawDesc = randomArt.description || `Title: ${randomArt.title} by ${randomArt.artist_title || "Unknown"}`;
        currentArtworkDescription = rawDesc.replace(/<[^>]*>?/gm, '');

        // Clear chat window and reset history for the new piece
        document.getElementById("chat-window").innerHTML = ""; 
        chatHistory = [];
        
        addMessage("AI", `Ah, "${randomArt.title}" from the Chicago collection. Take a look—what catches your eye first?`);

    } catch (error) {
        console.error("Failed to fetch live art:", error);
        addMessage("AI", "Oops, the Midwest database is taking a nap. Try clicking Next again!");
    }
}

// Hook up the Next button to our live loader
document.getElementById("next-btn").onclick = loadGalleryArt;

// Initial load on startup
loadGalleryArt();