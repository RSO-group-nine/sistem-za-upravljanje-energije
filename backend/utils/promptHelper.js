const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generatePrompt = async (prompt) => {
	try {
		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = await response.text();
		return text;
	} catch (error) {
		console.error("Error generating response:", error);
		throw new Error(
			"Failed to get a response from the Generative AI model."
		);
	}
};

module.exports = {
	generatePrompt,
};
