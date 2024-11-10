// utils/promptHelper.ts
const OpenAI = require("openai");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();
const apiKey = process.env.OPENAI_API_KEY;
const org_ID = process.env.OPENAI_ORG_ID;
const project_ID = process.env.OPENAI_PROJECT_ID;

console.log(org_ID, project_ID, apiKey);

const openai = new OpenAI({
    organization: org_ID,
    project: project_ID,
    apiKey: apiKey,
});

const generatePrompt = async (prompt) => {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: prompt },
            ],
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("Error with OpenAI API:", error);
        throw new Error("Failed to get response from OpenAI.");
    }
};

module.exports = {
    generatePrompt,
};