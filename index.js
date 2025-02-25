// index.js

const http = require('http');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
const url = require('url');
const fs = require('fs');
const PORT = 2025;
const CONTENT_TYPE_JSON = { "Content-Type": "application/json" };
const DATABASE = "NikkiDB";
const SKETCHES_COLLECTION = "sketches";
const MATERIALS_COLLECTION = "materials";
const MATERIAL_SOURCES_COLLECTION = "material-sources";

const mongoDBUri = "mongodb+srv://momo:NikkiDB2025@nikkidb.di0l3.mongodb.net/?retryWrites=true&w=majority&appName=NikkiDB";
const client = new MongoClient(mongoDBUri);

async function connectToDB() {
    try {
        // Connect to the MongoDB cluster
        await client.connect();
    } catch (e) {
        console.error(e);
    }
}

connectToDB().catch(console.error);

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    if (req.method === 'GET') {
        handleGetRequest(req, res, parsedUrl);
    } else {
        sendResponse(res, 404, CONTENT_TYPE_JSON, { error: 'Method not allowed' });
    }
});

async function handleGetRequest (req, res, parsedUrl) {
    const path = parsedUrl.path.toLowerCase();
    if (path === '/') {
        fs.readFile('./info.html', function (err, data) {
            if (err == null ) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data);
                res.end();
            }
        });
    }
    else if (path === '/sketches' || path === '/sketches/') {
        const result = await client.db(DATABASE).collection(SKETCHES_COLLECTION).find().toArray();
        sendResponse(res, 200, CONTENT_TYPE_JSON, result);
    }
    else if (path.startsWith('/sketches/')) {
        try {
            const sketchId = ObjectId.createFromHexString(getIdFromUrl(parsedUrl));
            const sketch = await client.db(DATABASE).collection(SKETCHES_COLLECTION).findOne({ _id: sketchId });

            if (sketch) {
                sendResponse(res, 200, CONTENT_TYPE_JSON, sketch);
            }
            else {
                sendResponse(res, 404, CONTENT_TYPE_JSON, { error: `Sketch with ID ${sketchId} not found` });
            }
        }
        catch {
            sendResponse(res, 400, CONTENT_TYPE_JSON, { error: `Unable to parse given ID` });
        }
    }
    else if (path === '/materials' || path === '/materials/') {
        const result = await client.db(DATABASE).collection(MATERIALS_COLLECTION).find().toArray();
        sendResponse(res, 200, CONTENT_TYPE_JSON, result);
    }
    else if (path.startsWith('/materials/')) {
        try {
            const materialId = ObjectId.createFromHexString(getIdFromUrl(parsedUrl));
            const material = await client.db(DATABASE).collection(MATERIALS_COLLECTION).findOne({ _id: materialId });

            if (material) {
                sendResponse(res, 200, CONTENT_TYPE_JSON, material);
            }
            else {
                sendResponse(res, 404, CONTENT_TYPE_JSON, { error: `Material with ID ${materialId} not found` });
            }
        }
        catch {
            sendResponse(res, 400, CONTENT_TYPE_JSON, { error: `Unable to parse given ID` });
        }
    }
    else if (path === '/materialsources' || path === '/materialsources/') {
        const result = await client.db(DATABASE).collection(MATERIAL_SOURCES_COLLECTION).find().toArray();
        sendResponse(res, 200, CONTENT_TYPE_JSON, result);
    }
    else if (path.startsWith('/materialsources/')) {
        try {
            const materialSourceId = ObjectId.createFromHexString(getIdFromUrl(parsedUrl));
            const materialSource = await client.db(DATABASE).collection(MATERIAL_SOURCES_COLLECTION).findOne({ _id: materialSourceId });

            if (materialSource) {
                sendResponse(res, 200, CONTENT_TYPE_JSON, materialSource);
            }
            else {
                sendResponse(res, 404, CONTENT_TYPE_JSON, { error: `Material source with ID ${materialSourceId} not found` });
            }
        }
        catch {
            sendResponse(res, 400, CONTENT_TYPE_JSON, { error: `Unable to parse given ID` });
        }
    }
    else {
        // Return a 404 response if the endpoint is not found
        sendResponse(res, 404, CONTENT_TYPE_JSON, { error: 'Endpoint not found' });
    }
}

const getIdFromUrl = (url) => {
    return url.query.id || url.path.split('/').pop();
}

const sendResponse = (res, statusCode, contentType, data) => {
    res.writeHead(statusCode, contentType);
    res.end(JSON.stringify(data));
};

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
