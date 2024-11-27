const dotenv = require("dotenv");

// Load environment variables
dotenv.config();
const apiKey = process.env.OPENROUTER_API_KEY;

const generatePrompt = async (prompt) => {
	try {
		const response = await fetch(
			"https://openrouter.ai/api/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "nousresearch/hermes-3-llama-3.1-405b:free",
					messages: [{ role: "user", content: prompt }],
					top_p: 1,
					temperature: 0.9,
					repetition_penalty: 1,
				}),
			}
		);

		const data = await response.json();
		return data.choices[0].message.content;
	} catch (error) {
		console.error("Error with OpenRouter API:", error);
		throw new Error("Failed to get response from OpenRouter.");
	}
};

module.exports = {
	generatePrompt,
};
