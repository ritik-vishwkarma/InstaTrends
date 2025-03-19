import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Simple health check that doesn't use asyncHandler
router.get('/health', (req, res) => {
    console.log("Health check endpoint called");
    res.status(200).json({
        status: 'ok',
        message: 'API is running smoothly'
    });
});

// Add this to your connection.routes.js file
router.get("/collections", asyncHandler(async (req, res) => {
    console.log("Collections endpoint called - listing all collections");
    
    try {
        const db = req.db;
        
        if (!db) {
            console.log("Database connection not available");
            return res.status(500).json({
                status: "error",
                message: "Database connection not available"
            });
        }

        // AstraDB specific approach to list collections
        console.log("Listing collections from AstraDB");
        let collections;
        
        try {
            collections = await db.listCollections();
            console.log("Collections retrieved successfully");
        } catch (listErr) {
            console.error(`Error listing collections: ${listErr.message}`);
            return res.status(500).json({
                status: "error", 
                message: `Error listing collections: ${listErr.message}`
            });
        }
        
        const collectionNames = collections.map(col => col.name || col.id || col);
        
        console.log(`Found ${collectionNames.length} collections`);
        
        return res.status(200).json({
            status: "success",
            count: collectionNames.length,
            collections: collectionNames
        });
    } catch (error) {
        console.error(`Error listing collections: ${error.message}`);
        return res.status(500).json({
            status: "error",
            message: `Failed to list collections: ${error.message}`
        });
    }
}));

// Get sample documents from a collection
router.get("/samples/:collectionName", asyncHandler(async (req, res) => {
    console.log(`Samples endpoint called for collection: ${req.params.collectionName}`);
    
    try {
        const { collectionName } = req.params;
        const db = req.db;
        
        if (!db) {
            console.log("Database connection not available");
            return res.status(500).json({
                status: "error",
                message: "Database connection not available"
            });
        }

        console.log(`Attempting to get collection: ${collectionName}`);
        
        // Try to get the collection
        const collection = db.collection(collectionName);
        
        // Check if collection exists first
        const collectionExists = await db.listCollections({name: collectionName});
        
        if (!collectionExists) {
            console.log(`Collection ${collectionName} does not exist`);
            return res.status(404).json({
                status: "error",
                message: `Collection '${collectionName}' not found`
            });
        }
        
        console.log(`Finding documents in collection: ${collectionName}`);
        const samples = await collection.find({}).limit(1000).toArray();
        console.log(`Found ${samples.length} documents`);

        // Send response
        return res.status(200).json({
            status: "success",
            count: samples.length,
            data: samples
        });
    } catch (error) {
        console.error(`Error in samples endpoint: ${error.message}`);
        return res.status(500).json({
            status: "error",
            message: `Failed to fetch samples from collection: ${error.message}`
        });
    }
}));

export default router;
