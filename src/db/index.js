import { DataAPIClient } from "@datastax/astra-db-ts";

/**
 * Connects to a DataStax Astra database.
 * This function retrieves the database endpoint and application token from the
 * environment variables ASTRA_DB_API_ENDPOINT and ASTRA_DB_APPLICATION_TOKEN.
 *
 * @returns An instance of the connected database.
 * @throws Will throw an error if the environment variables
 * ASTRA_DB_API_ENDPOINT or ASTRA_DB_APPLICATION_TOKEN are not defined.
 */

const connectDB = async () => {
    try {
        const { ASTRA_DB_URL: endpoint, ASTRA_DB_TOKEN: token } = process.env;

        // const token = process.env.ASTRA_DB_TOKEN;
        // const endpoint = process.env.ASTRA_DB_URL;

        if (!token || !endpoint) {
            throw new Error(
                "Environment variables ASTRA_DB_URL and ASTRA_DB_TOKEN must be defined."
            );
        }

        // Create an instance of the DataAPIClient class with your token.
        const client = new DataAPIClient(token);

        // Get the database specified by your endpoint.
        const database = client.db(endpoint);

        // Test the connection
        // console.log("Database connection status: " + await database.testConnection());

        console.log("Database connection successful");
        return database;
    }

    catch (error) {
        console.error("Error connecting to database:", error);
        throw new Error("Failed to connect to the database");
    }
};

export default connectDB ;

