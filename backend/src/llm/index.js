import searchDB from "../db/searchDB.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { spawn } from "child_process";

const cleanJSON = (data) => {
    try {
        let jsonString = JSON.stringify(data);

        jsonString = jsonString
            .replace(/\s{2,}/g, " ") // Remove extra spaces
            .replace(/"_  _id"/g, '"_id"') // Fix "_  _id" issue
            .replace(/"timestamp":"20225-/g, '"timestamp":"2025-') // Fix invalid timestamp
            .replace(/\n/g, ' ') // Remove new lines
            .replace(/\t/g, '') // Remove tab spaces
            .replace(/\r/g, '') // Remove carriage returns
            .replace(/,}/g, '}'); // Fix trailing commas

        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error cleaning JSON:", error);
        return null;
    }
};

const answerQuery = asyncHandler(async (req, res) => {
    try {
        const { collectionName, query } = req.body;

        if (!collectionName || !query) {
            return res.status(400).json({ error: "Collection name and query are required." });
        }

        console.log("🔍 Searching DB: ", { collectionName, query });

        // Get results from Astra DB
        const resultFromDB = await searchDB(collectionName, query);

        if (!resultFromDB) {
            return res.status(404).json({ error: "No search results found." });
        }

        const cleanedData = cleanJSON(resultFromDB);

        if (!cleanedData) {
            return res.status(500).json({ error: "Failed to clean JSON data." });
        }

        console.log("✅ Cleaned Data:", cleanedData);

        // Prepare payload for Python
        const inputPayload = JSON.stringify({ query, resultFromDB: cleanedData });

        // Spawn Python process
        const pythonProcess = spawn('python', ["src/llm/nim.py"]);

        // Send data to Python process
        console.log("🚀 Sending to Python:", inputPayload);
        pythonProcess.stdin.write(inputPayload + "\n");
        pythonProcess.stdin.end();

        let resultFromPython = "";

        pythonProcess.stdout.on('data', (data) => {
            resultFromPython += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error("⚠️ Python Error:", data.toString());
        });

        pythonProcess.on('close', (code) => {
            console.log(`✅ Python process exited with code: ${code}`);

            if (code !== 0) {
                return res.status(500).json({ error: "Python script execution failed." });
            }

            if (!resultFromPython.trim()) {
                return res.status(500).json({ error: "No response received from Python script." });
            }

            try {
                const parsedResult = JSON.parse(resultFromPython);
                console.log("📩 Parsed Result:", parsedResult);

                if (parsedResult.error) {
                    return res.status(500).json({ error: parsedResult.error });
                }

                res.json({ answer: parsedResult.answer });

            } catch (error) {
                console.error("⚠️ Error parsing result from Python:", error);
                res.status(500).json({ error: "Error parsing result from Python" });
            }
        });

    } catch (error) {
        console.error("⚠️ Error answering query:", error);
        res.status(500).json({ error: "Failed to answer the query" });
    }
});

export { answerQuery };
