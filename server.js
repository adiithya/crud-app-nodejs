import "dotenv/config"; // Load environment variables
import express from "express"; // Framework for building web applications
import cors from "cors"; // Enables Cross-Origin Resource Sharing
import compression from "compression"; // Reduces response size for better performance
import helmet from "helmet"; // Adds security headers to protect against common attacks
import morgan from "morgan"; // Logging middleware for HTTP requests
import cluster from "cluster"; // Allows Node.js to utilize multiple CPU cores
import os from "os"; // Provides OS-related utility methods
import connectDB from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
// import userRoutes from "./routes/userRoutes.js"; // Import user routes

const numCPUs = os.cpus().length;
const PORT = process.env.PORT || 5000;

if (cluster.isPrimary) {
  console.log(`Master process running on PID: ${process.pid}`);

  // Connect MongoDB only once
  connectDB().then(() => {
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }
  });

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(cors());
  app.use(compression());
  app.use(helmet());
  app.use(morgan("combined"));

  // Rate Limiting
  app.use(rateLimiter);

  // Default Route
  app.get("/", (req, res) => {
    res.send("Clustered Server Running");
  });

  // Error Handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} | Worker PID: ${process.pid}`);
  });
}