## 🚀 Scaling & Performance Optimization

To ensure this Node.js application handles multiple requests efficiently, we have implemented the following optimizations:

### 1️⃣ Optimize MongoDB Performance
- **Connection Pooling**: Default pooling handles multiple requests efficiently. We can configure:
  ```javascript
  mongoose.connect("mongodb://127.0.0.1:27017/crud_app_db", {
    maxPoolSize: 10,
  });
  ```

- **Indexing**: Frequently queried fields are indexed to improve query speed.
  ```javascript
  const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, index: true },
  });
  ```

- **Pagination**: Large data requests are paginated to reduce memory usage.
  ```javascript
  const users = await User.find().skip(skip).limit(limit);
  ```

### 2️⃣ Optimize Node.js Performance
- **Clustering**: Using the `cluster` module to utilize multiple CPU cores.
  ```javascript
  const cluster = require("cluster");
  const os = require("os");

  if (cluster.isMaster) {
    const numCPUs = os.cpus().length;
    for (let i = 0; i < numCPUs; i++) cluster.fork();
  } else {
    const app = require("./server");
    app.listen(5000, () => console.log(`Worker ${process.pid} started`));
  }
  ```

- **PM2 Process Manager**: Manages and auto-restarts the server for high availability.
  ```bash
  npm install -g pm2
  pm2 start server.js -i max
  ```

- **Compression**: Gzip compression is enabled to reduce response size.
  ```javascript
  const compression = require("compression");
  app.use(compression());
  ```

- **Rate Limiting**: Prevents excessive requests from a single IP to avoid abuse.
  ```javascript
  const rateLimit = require("express-rate-limit");

  // Set up rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
  });

  // Apply rate limiter to all routes
  app.use(limiter);
  ```

### 3️⃣ Use Caching for Faster Responses
- **Redis**: Frequently accessed API responses are cached using Redis.
  ```javascript
  const redis = require("redis");
  const client = redis.createClient();

  app.get("/users", async (req, res) => {
    client.get("users", async (err, data) => {
        if (data) {
            return res.json(JSON.parse(data)); // Return cached data
        }

        const users = await User.find();
        client.setex("users", 3600, JSON.stringify(users)); // Cache for 1 hour
        res.json(users);
    });
  });
  ```
- **Memory Optimization**: Large objects are handled efficiently to prevent memory leaks.

### 4️⃣ Deployment for High Availability
- **Docker**: The application is containerized for scalability.
- **Nginx Reverse Proxy**: Nginx is used to handle load balancing and improve performance.
- **Auto Scaling**: The cloud infrastructure dynamically scales based on incoming traffic.