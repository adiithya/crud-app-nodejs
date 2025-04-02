import rateLimit from "express-rate-limit"; // Protects against API abuse by limiting requests

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests, please try again later.",
  },
  headers: true, // Include rate limit info in response headers
  standardHeaders: true, // Return RateLimit headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers (deprecated)
});

export default rateLimiter;