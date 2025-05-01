// blob_watcher.js
require('dotenv').config();


const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = 'mailbody';
const PROCESSED_CACHE_FILE = path.join(__dirname, 'processed_blobs.json');

// Load processed blobs cache
function loadProcessedBlobs() {
    if (fs.existsSync(PROCESSED_CACHE_FILE)) {
        return new Set(JSON.parse(fs.readFileSync(PROCESSED_CACHE_FILE)));
    }
    return new Set();
}

function saveProcessedBlobs(blobSet) {
    fs.writeFileSync(PROCESSED_CACHE_FILE, JSON.stringify(Array.from(blobSet), null, 2));
}

async function listBlobs(containerClient) {
    const blobs = [];
    for await (const blob of containerClient.listBlobsFlat()) {
        blobs.push(blob.name);
    }
    return blobs;
}

function runNotebook(blobName) {
    console.log(`[Triggering Python Script] Processing ${blobName}`);
    // const process = spawn('python3', ['hello_world.py', blobName]);
    // const process = spawn('python3', ['run_stage_pipeline.py', blobName]);
    const process = spawn('python3', ['run_stage_pipeline_test.py', blobName]);

    process.stdout.on('data', (data) => {
        console.log(`[Python Output]: ${data}`);
    });

    process.stderr.on('data', (data) => {
        console.error(`[Python Error]: ${data}`);
    });

    process.on('close', (code) => {
        console.log(`[Python Exit]: code ${code}`);
    });
}

async function pollForNewBlobs() {
    console.log('[Blob Watcher] Starting polling job...');
    const blobServiceClient = BlobServiceClient.fromConnectionString(CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

    const processed = loadProcessedBlobs();
    const allBlobs = await listBlobs(containerClient);

    for (const blobName of allBlobs) {
        if (!processed.has(blobName)) {
            runNotebook(blobName);
            processed.add(blobName);
        }
    }

    saveProcessedBlobs(processed);
}

// pollForNewBlobs().catch((err) => {
//     console.error('Blob Watcher Error:', err.message);
// });
const cron = require('node-cron');

// Schedule polling every 5 minutes
cron.schedule('*/5 * * * *', () => {
    console.log('[Blob Watcher] Running polling job...');
    pollForNewBlobs().catch((err) => {
        console.error('Blob Watcher Error:', err.message);
    });
});

console.log('[Blob Watcher] Scheduler started. Polling every 5 minutes...');

