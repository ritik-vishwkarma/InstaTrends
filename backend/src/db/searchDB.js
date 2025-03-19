import connectDB from "./index.js";


const searchDB = async (collectionName, query) => {
    try {
        if (!query) {
            throw new Error("Query must be defined.");
        }

        if (!collectionName) {
            throw new Error("Collection name must be defined.");
        }

        const db = await connectDB();

        // const collection = db.collection(req.storeCollectionName);
        // console.log(collection);

        const collection = db.collection(collectionName);
        
        const data = await collection.find(
            {},
            {
                sort: { $vectorize: query },
                limit: 10,
                includeSimilarity: true,
            }
        ).toArray();

        if (!data?.length) {
            throw new Error("No search results found.");
        } else {
            // console.log('Search results:', data);
        }

        // console.log('* Search results:')

        // for await (const doc of data) {
        //     console.log(doc);
        // }

        return data;

    } catch (error) {
        console.error("Error searching database:", error);
        throw new Error("Failed to search the database");
    }
}

export default searchDB;

// console.log(searchDB('Likes count'));
