import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import { registerRoutes } from "./routes.js";
import responseMiddleware from "./middlewares/response.middleware.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Apply middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:"]
    }
  }
}));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use(responseMiddleware);

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson: unknown) {
    capturedJsonResponse = bodyJson as Record<string, unknown>;
    return originalResJson.call(res, bodyJson);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Register API routes and get HTTP server
    const server = await registerRoutes(app);

    // Global error handler
    app.use((err: Error & { status?: number; statusCode?: number }, _req: Request, res: Response) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      console.log(`Error: ${status} - ${message}`);

      res.status(status).json({ message });
      
      if (process.env.NODE_ENV !== 'production') {
        console.error(err);
      }
    });

    // Start server
    const port = parseInt(process.env.PORT || '5000');
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      console.log(`Server running in ${app.get("env")} mode`);
      console.log(`API Documentation available at http://localhost:${port}/api-docs`);
      console.log(`Server listening on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})(); 