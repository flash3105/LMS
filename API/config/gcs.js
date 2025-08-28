const { Storage } = require('@google-cloud/storage');

// Parse JSON from environment variable
const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);

// Initialize GCS
const storage = new Storage({ credentials });

const bucketName = 'resources-thuto-lms';
const bucket = storage.bucket(bucketName);

module.exports = bucket;
