import searchDB from "../db/searchDB.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { spawn } from "child_process";

const answerQuery = asyncHandler(async (req, res) => {
    try {
        const { collectionName ,query } = req.body;

        if (!collectionName) {
            throw new Error("Collection name must be defined.");
        }

        if (!query) {
            throw new Error("Query must be defined.");
        }

        const resultFromDB = await searchDB(collectionName, query);

        console.log("Result from DB:", resultFromDB);

        if (!resultFromDB) {
            throw new Error("No search results found.");
        }

        const pythonProcess = spawn('python', ["src/llm/nim.py"]);

        pythonProcess.stdin.write(JSON.stringify({ query, resultFromDB }) + "\n");
        pythonProcess.stdin.end();

        let resultFromPython = "";
        pythonProcess.stdout.on('data', (data) => {
            resultFromPython += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(data.toString());
        });

        pythonProcess.on('close', (code) => {
            console.log(`Python child process exited with code: ${code}`);

            if (!resultFromPython.trim()) {
                console.error("No response received from Python script.");

                return res
                    .status(500)
                    .json({ error: "No response received from Python script" });
            }

            try {
                const parsedResult = JSON.parse(resultFromPython);

                console.log("Parsed result from Python:", parsedResult);

                res.json({ answer: parsedResult.answer });

            } catch (error) {
                console.error("Error parsing result from Python:", error);

                res
                .status(500)
                .json({ error: "Error parsing result from Python" });
            }
        });
    } catch (error) {
        console.error("Error answering query:", error);

        res
        .status(500)
        .json({ error: "Failed to answer the query" });
    }
});

export { answerQuery };