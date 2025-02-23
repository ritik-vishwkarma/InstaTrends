import axios from 'axios';

const queryEndpoint = async (req, res) => {
    try {
        const { collectionName, query } = req.body;

        if (!collectionName || !query) {
            return res.status(400).json({ error: 'Collection name and query are required.' });
        }

        console.log("🔍 Querying FastAPI endpoint with collectionName:", collectionName, "and query:", query);

        const response = await axios.post('http://127.0.0.1:8000/query', {
            collectionName: collectionName,
            query: query
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("✅ Query response from FastAPI:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error calling FastAPI endpoint:', error);
        res.status(500).json({ error: 'Failed to query FastAPI endpoint.' });
    }
};

export { queryEndpoint };