import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectDB } from "./config/database.js";
import { setupSwagger } from "./config/swagger.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { Request, Response } from "express";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import documentRoutes from "./routes/document.routes.js";
import documentCategoryRoutes from "./routes/documentCategory.routes.js";
import forumPostRoutes from "./routes/forumPost.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import uploadRoutes from "./routes/upload.routes.js";

export async function registerRoutes(app: Express): Promise<Server> {
  try {
    // Connect to database
    await connectDB();
    
    // API routes
    app.use("/api/auth", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/projects", projectRoutes);
    app.use("/api/tasks", taskRoutes);
    app.use("/api/documents", documentRoutes);
    app.use("/api/document-categories", documentCategoryRoutes);
    app.use("/api/forum-posts", forumPostRoutes);
    app.use("/api/comments", commentRoutes);
    app.use("/api/upload", uploadRoutes);
    
    // Set up Swagger documentation
    setupSwagger(app);
    
    // API health check endpoint
    app.get("/api/health", (req: Request, res: Response) => {
      res.status(200).json({ 
        status: "ok", 
        message: "API is running"
      });
    });
    
    // Error handling
    app.use(notFound);
    app.use(errorHandler);
    
    const httpServer = createServer(app);
    
    return httpServer;
  } catch (error) {
    console.error("Error registering routes:", error);
    throw error;
  }
} 