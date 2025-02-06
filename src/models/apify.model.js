/**
 * Uploads JSON data to a specified collection.
 * @param {Object} collection - The collection to which the data will be uploaded.
 * @param {Array} data - The JSON array containing the data to be uploaded.
 * @param {Function} embeddingStringCreator - A function to create the string for which vector embeddings will be generated.
 * @returns {Promise<void>} A promise that resolves when the data has been uploaded.
 */

async function uploadJsonData(collection, data, embeddingStringCreator) {
    try {
        // Add a $vectorize field to each piece of data.
        const documents = data.map(item => ({
            ...item,
            // metadata: item.metadata || {},
            $vectorize: embeddingStringCreator(item),
        }));

        // Insert the documents into the collection.
        await collection.insertMany(documents);
        console.log("Documents inserted successfully:", documents);
    } catch (error) {
        console.error("Error inserting documents:", error);
        throw new Error("Failed to insert documents into the collection");
    }
}

const insertData = async (db, collectionName, data) => {
    try {

        // Create a collection
        const collection = await db.createCollection(
            collectionName,
            {
                vector: {
                    service: {
                        provider: "nvidia",
                        modelName: "NV-Embed-QA",
                    },
                },
            }
        );

        // Define the embedding string creator function
        const embeddingStringCreator = item => `type: ${item.type}`;

        // Upload JSON data to the collection
        await uploadJsonData(collection, data, embeddingStringCreator);
    } catch (error) {
        console.error("Error inserting data:", error);
        throw new Error("Failed to insert data into the collection");
    }
};

export { insertData };