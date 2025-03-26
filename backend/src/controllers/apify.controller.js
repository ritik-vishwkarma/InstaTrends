import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApifyClient } from 'apify-client';
import { insertData } from "../models/apify.model.js";
// import connectDB from "../db/index.js";
import { CURRENT_DATE_TIME } from "../constants.js";
// import { storeCollectionName } from "../middleware/store.collectionName.js";

const apifyClient = new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
});

const runActor = asyncHandler(async (req, res) => {
    try {
        const input = req.body;

        if (!input) {
            throw new ApiError(400, "Please provide input for the actor.");
        }

        // Run the Actor
        const run = await apifyClient.actor(process.env.APIFY_ACTOR_ID).call(input);

        if (!run || !run.defaultDatasetId) {
            throw new ApiError(500, "Failed to run the actor or retrieve dataset ID.");
        }

        // Results from Actor
        const { items } = await apifyClient.dataset(run.defaultDatasetId).listItems();

        if (!items || items.length === 0) {
            throw new ApiError(404, "No items found in the dataset");
        }
        

        // Log detailed information about the items
        console.log(`📋 Received ${items.length} items from Apify`);
        
        // Log the first item as a sample (with proper depth)
        console.log("📝 Sample item structure:", JSON.stringify(items[0], null, 2));
        
        // // Log all item types
        // const itemTypes = items.map(item => item.type);
        // console.log("📑 Item types:", itemTypes);



        // Filter the data
        const filteredData = items.map(item => ({
            type: item.type,
            likesCount: item.likesCount,
            commentsCount: item.commentsCount,
            hashtags: item.hashtags,
            mentions: item.mentions,
            caption: item.caption,
            timestamp: item.timestamp
        }));;

        // await connectDB();

        // Create a collection name based on the current date-time string
        const currentDateTime = CURRENT_DATE_TIME;
        const collectionName = `collection_${currentDateTime}`;

        // Insert the data into the database
        await insertData(req.db, collectionName, filteredData);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { data: filteredData, collectionName },
                    "Data fetched successfully")
            );
    } catch (error) {
        console.error("Error running the actor:", error);
        throw new ApiError(500, "Failed to run the actor.");
    }
});

export { runActor };