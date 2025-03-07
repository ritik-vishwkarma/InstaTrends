import OpenAI from "openai";
import searchDB from "../db/searchDB.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// If your GitHub token works for OpenAI API authentication, we'll keep it
const token = process.env["GITHUB_TOKEN"];
console.log("Using token:", token?.substring(0, 3) + "..." + (token?.length > 6 ? token?.substring(token.length - 3) : ""));
const endpoint = "https://models.inference.ai.azure.com"
const modelName = "gpt-4o";

const openaiClient = new OpenAI({
    baseURL: endpoint,
    apiKey: token
});

/**
 * Query GitHub's OpenAI model with context and user query
 * @param {Array|Object} context - The context data from database
 * @param {string} query - The user query
 * @returns {Object} - Response object with answer or error
 */
const GitHubModelGPT4 = async (context, query) => {
    try {
        if (!context || !query) {
            return { error: "Context and query are required." };
        }
        
        const response = await openaiClient.chat.completions.create({
            messages: [
                { role: "system", content: `Context: ${JSON.stringify(context)}` },
                { role: "user", content: query }
            ],
            model: modelName,
            temperature: 0.7,   
            max_tokens: 4096,
            top_p: 0.6
        });

        const choices = response.choices || [];
        const answer = choices.length ? choices[0].message.content : "No answer found.";

        // Return consistent object structure
        return { answer };
    } catch (error) {
        console.error("API Request Error:", error);
        return { error: `API Request Error: ${error.message}` };
    }
};

/**
 * Handle LLM query requests
 */
const llmRunner = asyncHandler(async (req, res) => {
    try {
        const { collectionName, query } = req.body;

        if (!collectionName || !query) {
            return res.status(400).json({ error: "Collection name and query are required." });
        }

        console.log("🔍 Searching DB: ", { collectionName, query });

        // Get results from Astra DB
        const resultFromDB = await searchDB(collectionName, query);
        
        // Check for empty results
        if (!resultFromDB || (Array.isArray(resultFromDB) && resultFromDB.length === 0)) {
            return res.status(404).json({ error: "No search results found." });
        }

        console.log("✅ Search Results Found:", resultFromDB.length || "object");

        // Get response from OpenAI
        const result = await GitHubModelGPT4(resultFromDB, query);

        // Check for errors in the response
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }

        // Return successful response
        return res.status(200).json({ answer: result.answer });
    } catch (error) {
        console.error("Error in llmRunner:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// Simple test function similar to your working example
const testOpenAI = async () => {
    try {
        const response = await openaiClient.chat.completions.create({
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "What is the capital of France?" }
            ],
            model: modelName
        });

        console.log("Test response:", response.choices[0].message.content);
        return true;
    } catch (error) {
        console.error("Test failed:", error);
        return false;
    }
};

// Run test on module load
// testOpenAI().then(success => {
//     console.log("OpenAI client test:", success ? "PASSED" : "FAILED");
// });

export { llmRunner };