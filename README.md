# gAIlery 🏛️🤖

A modular, multi-wing gallery web application featuring interactive, AI-driven conversations about historical artwork. Built with a clean "adapter" architecture separating core UI/chat logic from museum-specific data fetching.

## Architecture
- **Root (`/`)**: Master styles (`style.css`), landing page, and core engine (`js/core.js`).
- **Wings (Adapters)**: Modular subfolders (`/va`, `/chicago`) containing wing-specific API adapters and views.
- **Serverless**: Uses a Netlify function (`/.netlify/functions/chat`) to handle AI communication.

## Local Development
1. Clone or download the repository.
2. Run a local static server from the root directory (or open the root `index.html`).
3. Navigate into individual museum wings to chat with the local curators.
