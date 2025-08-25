const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Path to your service account JSON
const keyFile = path.join(__dirname, 'thuto-lms-e3abedcba630.json');

// Initialize GCS
const storage = new Storage({ keyFilename: keyFile });


const bucketName = 'resources-thuto-lms';
const bucket = storage.bucket(bucketName);

module.exports = bucket;
