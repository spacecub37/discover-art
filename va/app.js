// Inherits core.js chat engine, only defines the museum-specific fetcher
async function loadGalleryArt() {
    try {
        const response = await fetch("https://api.vam.ac.uk/v2/objects/search?q=painting&images_exist=1&page_size=50");
        const data = await response.json();
        const randomArt = data.records[Math.floor(Math.random() * data.records.length)];
        
        const imageId = randomArt._primaryImageId;
        const imageUrl = `https://framemark.vam.ac.uk/collections/${imageId}/full/843,/0/default.jpg`;
        
        const imgElement = document.getElementById("art-image");
        if (imgElement) {
            imgElement.src = imageUrl;
            imgElement.onerror = () => { imgElement.src = "../images/test1.jpg"; };
        }

        const title = randomArt._primaryTitle || "Untitled";
        const artist = randomArt._primaryMaker?.name || "Unknown Maker";
        const date = randomArt._primaryDate || "";
        
        currentArtworkDescription = `"${title}" by ${artist} (${date}), housed at the Victoria and Albert Museum.`;

        document.getElementById("chat-window").innerHTML = ""; 
        chatHistory = [];
        
        addMessage("AI", `Ah, "${title}" by ${artist}. Take a close look—what jumps out at you first?`);

    } catch (error) {
        console.error("V&A Fetch Error:", error);
        addMessage("AI", "The V&A database is taking a quick tea break. Hit Next and let's try another piece! :0)");
    }
}

document.getElementById("next-btn").onclick = loadGalleryArt;
loadGalleryArt();
