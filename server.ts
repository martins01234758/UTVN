import 'dotenv/config';
import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  executeIngestionPipeline, 
  pipelineTelemetry, 
  getGoogleAppsScriptTemplate, 
  getExcelOfficeScriptTemplate,
  IngestionWebhookPayload 
} from './src/services/pipelineEngine.js';
import { mockTransactions } from './src/data/mockData.js';
import { UniversalTransaction } from './src/types/utvn.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

// Maintain shared ledger transactions in memory
const liveTransactions: UniversalTransaction[] = [...mockTransactions];

async function startServer() {
  const app = express();

  // Enable JSON and URL-encoded bodies for webhooks
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // CORS middleware for Google Apps Script, Excel Power Automate, and external ERPs
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-utvn-token, x-idempotency-key, accept');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // --- CI/CD PIPELINE INGESTION WEBHOOK ENDPOINTS ---

  /**
   * Health & Status Endpoint
   */
  app.get('/api/v1/pipeline/status', (req: Request, res: Response) => {
    res.json({
      status: 'ONLINE',
      protocol: 'UTVN-INVARIANT-INGESTION-v2.4',
      uptimeSeconds: process.uptime(),
      timestamp: new Date().toISOString(),
      telemetry: {
        totalProcessed: pipelineTelemetry.totalProcessed,
        successfulSyncs: pipelineTelemetry.successfulSyncs,
        flaggedOrBlocked: pipelineTelemetry.flaggedOrBlocked,
        avgLatencyMs: pipelineTelemetry.avgLatencyMs,
        activeConnectors: pipelineTelemetry.activeConnectors
      }
    });
  });

  /**
   * Ingestion Webhook for Google Sheets, Excel 365, and ERP Apps
   * Called automatically when an enterprise uploads or edits an invoice
   */
  app.post('/api/v1/pipeline/webhook', (req: Request, res: Response) => {
    const payload = req.body as IngestionWebhookPayload;

    if (!payload) {
      return res.status(400).json({
        success: false,
        error: 'Missing JSON payload body in webhook request.'
      });
    }

    try {
      // Execute the automated 6-stage verification and reconciliation pipeline against live ledger
      const result = executeIngestionPipeline(payload, liveTransactions);

      if (result.success && result.transaction) {
        const existingIdx = liveTransactions.findIndex(t => t.utid === result.transaction!.utid);
        if (existingIdx >= 0) {
          liveTransactions[existingIdx] = result.transaction;
        } else {
          liveTransactions.unshift(result.transaction);
        }
      }

      // Return 200 OK or 422 if schema invalid
      if (!result.success) {
        return res.status(422).json(result);
      }

      return res.status(200).json(result);
    } catch (err: any) {
      console.error('Pipeline Webhook Execution Error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Internal pipeline processing error.'
      });
    }
  });

  /**
   * Get Live Ledger Transactions
   */
  app.get('/api/v1/pipeline/transactions', (req: Request, res: Response) => {
    res.json({
      success: true,
      count: liveTransactions.length,
      transactions: liveTransactions
    });
  });

  /**
   * Get Recent Webhook & Pipeline Logs
   */
  app.get('/api/v1/pipeline/logs', (req: Request, res: Response) => {
    res.json({
      success: true,
      count: pipelineTelemetry.recentLogs.length,
      logs: pipelineTelemetry.recentLogs
    });
  });

  /**
   * Pipeline Simulation Endpoint (used by frontend sandbox test runner)
   */
  app.post('/api/v1/pipeline/simulate', (req: Request, res: Response) => {
    const payload = req.body as IngestionWebhookPayload;
    const result = executeIngestionPipeline(payload, liveTransactions);
    if (result.success && result.transaction) {
      const existingIdx = liveTransactions.findIndex(t => t.utid === result.transaction!.utid);
      if (existingIdx >= 0) {
        liveTransactions[existingIdx] = result.transaction;
      } else {
        liveTransactions.unshift(result.transaction);
      }
    }
    res.json(result);
  });

  /**
   * Dynamic Script Generators for Google Sheets & Excel 365
   */
  app.get('/api/v1/pipeline/scripts/google-sheets', (req: Request, res: Response) => {
    const host = req.get('host') || 'localhost:3000';
    const proto = req.get('x-forwarded-proto') || 'https';
    const originUrl = `${proto}://${host}`;
    const script = getGoogleAppsScriptTemplate(originUrl, pipelineTelemetry.apiKey);
    res.type('text/plain').send(script);
  });

  app.get('/api/v1/pipeline/scripts/excel', (req: Request, res: Response) => {
    const host = req.get('host') || 'localhost:3000';
    const proto = req.get('x-forwarded-proto') || 'https';
    const originUrl = `${proto}://${host}`;
    const script = getExcelOfficeScriptTemplate(originUrl, pipelineTelemetry.apiKey);
    res.type('text/plain').send(script);
  });

  // --- VITE MIDDLEWARE / STATIC ASSETS ---
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UTVN Server & Webhook Pipeline running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start UTVN server:', err);
  process.exit(1);
});
