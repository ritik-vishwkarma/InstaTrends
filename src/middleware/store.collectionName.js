import { asyncHandler } from "../utils/asyncHandler.js";

// Function to generate a random string of specified length
const generateRandomString = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// Generate a timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '_').replace(/-/g, '_').toLowerCase().replace(/[^a-z0-9_]/g, '').replace(/^_+|_+$/g, '');

// Generate a random string
const randomString = generateRandomString(15);

// Combine the timestamp and random string to create a unique identifier
let uniqueIdentifier = `${timestamp}_${randomString}`;

// Ensure the total length is within limits and ends with an alphanumeric character
if (uniqueIdentifier.length > 35) {
    uniqueIdentifier = uniqueIdentifier.substring(0, 34);
    // Ensure the last character is alphanumeric
    if (!/[a-z0-9]$/.test(uniqueIdentifier)) {
        uniqueIdentifier = uniqueIdentifier.slice(0, -1) + 'a';
    }
} else {
    // Ensure the last character is alphanumeric
    if (!/[a-z0-9]$/.test(uniqueIdentifier)) {
        uniqueIdentifier = uniqueIdentifier.slice(0, -1) + 'a';
    }
}

const storeCollectionName = asyncHandler((req, res, next) => {
    const CURRENT_DATE_TIME = uniqueIdentifier;
    req.collectionName = `collection_${CURRENT_DATE_TIME}`;
    next();
});

console.log("storeCollectionName:", storeCollectionName);


export { storeCollectionName };