import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import casesRouter from "./Legal/cases.js";
import visitorRouter from "./Visitor/visitor.js";
import facilityRouter from "./Facility/facility.js";
import reservationRouter from "./Facility/reservation.js";
import userRouter from "./User/user.js";
import contractsRouter from "./Legal/contracts.js";
import complianceRouter from "./Legal/compliance.js";
import axios from "axios";
import vision from "@google-cloud/vision";
import { GoogleAuth } from "google-auth-library";
import documentsRouter from "./Legal/documents.js";
import multer from 'multer';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// increase limit for base64 payloads
app.use(express.json({ limit: "50mb" }));
app.use(cors());

app.use(casesRouter);
app.use(visitorRouter);
app.use("/facilities", facilityRouter);
app.use("/facility-reservations", reservationRouter);
app.use("/users", userRouter);
app.use("/", contractsRouter);
// mount compliance router
app.use("/compliance", complianceRouter);
console.log("Mounted router: GET/POST/PUT/DELETE /compliance");
app.use("/api/documents", documentsRouter);

const PORT = process.env.PORT || 4000;
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// In-memory documents store
const documents = [
  {
    id: 1,
    title: "Employment Agreement - John Doe",
    type: "Contract",
    status: "active",
    date: "2024-03-15",
    lastModified: "2024-09-20",
    expiryDate: "2025-03-15",
    size: "245 KB",
    assignee: "Sarah Johnson",
    priority: "high",
    tags: ["Employment", "HR"],
    starred: true
  },
  {
    id: 2,
    title: "NDA - Tech Corp Partnership",
    type: "Agreement",
    status: "active",
    date: "2024-06-01",
    lastModified: "2024-10-01",
    expiryDate: "2026-06-01",
    size: "189 KB",
    assignee: "Michael Chen",
    priority: "high",
    tags: ["Confidential", "Partnership"],
    starred: false
  },
  {
    id: 3,
    title: "Data Privacy Policy 2024",
    type: "Policy",
    status: "draft",
    date: "2024-09-10",
    lastModified: "2024-10-05",
    expiryDate: null,
    size: "512 KB",
    assignee: "Emily Davis",
    priority: "medium",
    tags: ["Privacy", "Compliance"],
    starred: false
  }
];

// Documents API routes
app.get("/api/documents", (req, res) => {
  res.json(documents);
});

app.get("/api/documents/:id", (req, res) => {
  const doc = documents.find(d => d.id === Number(req.params.id));
  if (!doc) return res.status(404).json({ error: "Document not found" });
  res.json(doc);
});

app.post("/api/documents", (req, res) => {
  try {
    const newDoc = { ...req.body, id: Date.now(), date: new Date().toISOString().split("T")[0], lastModified: new Date().toISOString().split("T")[0] };
    documents.unshift(newDoc);
    res.status(201).json(newDoc);
  } catch (err) {
    res.status(500).json({ error: "Failed to create document", message: err.message });
  }
});

app.put("/api/documents/:id", (req, res) => {
  try {
    const idx = documents.findIndex(d => d.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Document not found" });
    documents[idx] = { ...documents[idx], ...req.body, lastModified: new Date().toISOString().split("T")[0] };
    res.json(documents[idx]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update document", message: err.message });
  }
});

app.delete("/api/documents/:id", (req, res) => {
  try {
    const idx = documents.findIndex(d => d.id === Number(req.params.id));
    if (idx === -1) return res.status(404).json({ error: "Document not found" });
    documents.splice(idx, 1);
    res.json({ message: "Document deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete document", message: err.message });
  }
});

// ---- UPDATED: Google Vision Client Initialization (NEW METHOD) ----
const keyFilePath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), "google-credentials.json");

// ---- Replace vision client init with auth-based init ----
let visionClient = null;

try {
  const clientOptions = {};

  if (fs.existsSync(keyFilePath)) {
    console.log("Using service account JSON from:", keyFilePath);
    const keyJson = JSON.parse(fs.readFileSync(keyFilePath, "utf8"));

    const auth = new GoogleAuth({
      credentials: {
        client_email: keyJson.client_email,
        private_key: keyJson.private_key
      },
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });

    clientOptions.auth = auth;
    clientOptions.projectId = keyJson.project_id || process.env.GOOGLE_PROJECT_ID;
  } else if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
    console.log("Using GOOGLE_CLIENT_EMAIL/GOOGLE_PRIVATE_KEY from env");
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: privateKey
      },
      scopes: ["https://www.googleapis.com/auth/cloud-platform"]
    });
    clientOptions.auth = auth;
    clientOptions.projectId = process.env.GOOGLE_PROJECT_ID;
  } else {
    console.log("No explicit credentials provided — relying on default ADC (GOOGLE_APPLICATION_CREDENTIALS).");
  }

  visionClient = new vision.ImageAnnotatorClient(clientOptions);
  console.log("Google Vision client initialized");
} catch (err) {
  console.error("Failed to initialize Google Vision client:", err?.message || err);
  visionClient = null;
}

// Vision API routes
app.post('/api/vision/analyze', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const { mimeType, fileName } = req.body;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    console.log('vision.analyze multipart:', { fileName: fileName || file.originalname, size: file.size, mimeType: mimeType || file.mimetype });

    const REST_API_KEY = process.env.GOOGLE_VISION_KEY;
    
    // REST API path
    if (REST_API_KEY) {
      const base64 = file.buffer.toString('base64');
      const body = {
        requests: [
          {
            image: { content: base64 },
            features: [
              { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
              { type: 'TEXT_DETECTION', maxResults: 5 },
              { type: 'LABEL_DETECTION', maxResults: 10 }
            ]
          }
        ]
      };
      try {
        const axiosRes = await axios.post(`https://vision.googleapis.com/v1/images:annotate?key=${REST_API_KEY}`, body, { headers: { 'Content-Type': 'application/json' }, timeout: 30000 });
        return res.json(axiosRes.data);
      } catch (err) {
        console.error('Vision REST error:', err?.response?.data || err?.message);
        const status = err?.response?.status || 500;
        return res.status(status).json({ error: 'Vision REST API request failed', details: err?.response?.data || err?.message });
      }
    }

    // Service account path
    if (!visionClient) return res.status(500).json({ error: 'Vision client not initialized. Configure service account or set GOOGLE_VISION_KEY.' });

    const imageBuffer = file.buffer;
    try {
      const [textResult] = await visionClient.textDetection({ image: { content: imageBuffer } });
      const [documentResult] = await visionClient.documentTextDetection({ image: { content: imageBuffer } });
      const [labelResult] = await visionClient.labelDetection({ image: { content: imageBuffer } });

      const textAnnotations = textResult.textAnnotations || [];
      const fullText = textAnnotations.length ? textAnnotations[0].description : '';
      const labels = (labelResult.labelAnnotations || []).map(l => ({ description: l.description, score: l.score }));

      return res.json({
        success: true,
        fileName: fileName || file.originalname,
        textAnnotations,
        fullText,
        documentText: documentResult.fullTextAnnotation?.text || '',
        labels,
        pages: documentResult.fullTextAnnotation?.pages?.length || 0,
        confidence: textAnnotations?.[0]?.confidence || 0
      });
    } catch (err) {
      console.error('Vision client error:', err);
      return res.status(500).json({ error: 'Vision client processing failed', message: err?.message || 'unknown', details: err?.details || null });
    }
  } catch (err) {
    console.error('Vision analyze handler unexpected error:', err);
    return res.status(500).json({ error: 'Server error', message: err?.message || String(err) });
  }
});

app.post("/api/vision/ocr", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image provided" });
    const imageBuffer = Buffer.from(image, "base64");
    const [result] = await visionClient.documentTextDetection({ image: { content: imageBuffer } });
    const fullTextAnnotation = result.fullTextAnnotation;
    if (!fullTextAnnotation) {
      return res.json({ success: true, text: "", blocks: [], message: "No text detected" });
    }
    const blocks = (fullTextAnnotation.pages?.[0]?.blocks || []).map(block => {
      const blockText = (block.paragraphs || []).map(p =>
        (p.words || []).map(w => (w.symbols || []).map(s => s.text).join("")).join(" ")
      ).join("\n");
      return { text: blockText, confidence: block.confidence, boundingBox: block.boundingBox };
    });
    res.json({ success: true, text: fullTextAnnotation.text, blocks, language: fullTextAnnotation.pages?.[0]?.property?.detectedLanguages?.[0]?.languageCode || "unknown" });
  } catch (error) {
    console.error("OCR Error:", error);
    res.status(500).json({ error: "OCR processing failed", message: error.message });
  }
});

app.post("/api/vision/safe-search", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: "No image provided" });
    const imageBuffer = Buffer.from(image, "base64");
    const [result] = await visionClient.safeSearchDetection({ image: { content: imageBuffer } });
    const safeSearch = result.safeSearchAnnotation || {};
    res.json({ success: true, safeSearch });
  } catch (error) {
    console.error("Safe Search Error:", error);
    res.status(500).json({ error: "Safe search detection failed", message: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    port: PORT,
    pid: process.pid,
    vision: visionClient ? "initialized" : "not-initialized"
  });
});

app.get('/api/vision/analyze', (req, res) => {
  res.status(405).json({
    error: 'Method Not Allowed',
    message: 'Use POST /api/vision/analyze with multipart/form-data (field name "file") or JSON { image: "<base64>" }.'
  });
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));

async function getCases() {
  const [rows] = await pool.query("SELECT * FROM admin_cases");
  return rows;
}

export default app;