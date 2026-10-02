exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { messages, systemPrompt } = JSON.parse(event.body);
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "API key not configured on server" })
            };
        }

        const apiMessages = [systemPrompt, ...messages];

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: apiMessages,
                temperature: 0.7
            })
        });

        const data = await response.json();

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};