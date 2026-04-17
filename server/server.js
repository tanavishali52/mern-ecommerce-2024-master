const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const dns = require("dns");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");

// Load environment variables
dotenv.config();

// Ensure Node can resolve DNS in environments where the configured DNS server is localhost
// (common when a local DNS proxy is configured but not running).
const configuredDnsServers = dns.getServers();
if (process.env.DNS_SERVERS) {
  const servers = process.env.DNS_SERVERS.split(",").map((s) => s.trim()).filter(Boolean);
  if (servers.length) {
    dns.setServers(servers);
    console.log(`[DNS] Using servers from DNS_SERVERS: ${servers.join(", ")}`);
  }
} else if (
  configuredDnsServers.length === 1 &&
  (configuredDnsServers[0] === "127.0.0.1" || configuredDnsServers[0] === "::1")
) {
  const fallbackServers = ["1.1.1.1", "8.8.8.8"];
  dns.setServers(fallbackServers);
  console.warn(
    `[DNS] Detected localhost DNS (${configuredDnsServers[0]}). Falling back to ${fallbackServers.join(
      ", "
    )}. Set DNS_SERVERS to override.`
  );
}

// Import routes
const authRouter = require("./routes/auth/auth-routes");
const adminProductsRouter = require("./routes/admin/products-routes");
const adminOrderRouter = require("./routes/admin/order-routes");
const adminBannerRouter = require("./routes/admin/banner-routes");
const adminReviewRouter = require("./routes/admin/review-routes");
const adminSettingsRouter = require("./routes/admin/settings-routes");
const shopProductsRouter = require("./routes/shop/products-routes");
const shopCartRouter = require("./routes/shop/cart-routes");
const shopAddressRouter = require("./routes/shop/address-routes");
const shopOrderRouter = require("./routes/shop/order-routes");
const shopProfileRouter = require("./routes/shop/profile-routes");
const shopSearchRouter = require("./routes/shop/search-routes");
const shopReviewRouter = require("./routes/shop/review-routes");
const shopWishlistRouter = require("./routes/shop/wishlist-routes");
const commonFeatureRouter = require("./routes/common/feature-routes");

const app = express();
const PORT = process.env.PORT || 5001;

// MongoDB connection with retry logic
async function connectToMongoDB({ maxRetries = 5, retryDelayMs = 5000 } = {}) {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is not set');
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log("MongoDB connected successfully");
      return;
    } catch (error) {
      console.error("MongoDB connection error:", error.message);

      if (attempt >= maxRetries) {
        throw error;
      }

      console.log(
        `Retrying connection in ${Math.round(retryDelayMs / 1000)} seconds... (Attempt ${attempt}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
}

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174", 
      "http://localhost:5175", 
      "http://localhost:5176",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
      "http://127.0.0.1:5176"
    ],
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));

// API routes
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrderRouter);
app.use("/api/admin/banners", adminBannerRouter);
app.use("/api/admin/reviews", adminReviewRouter);
app.use("/api/admin/settings", adminSettingsRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/orders", shopOrderRouter);
app.use("/api/shop/profile", shopProfileRouter);
app.use("/api/shop/search", shopSearchRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/wishlist", shopWishlistRouter);
app.use("/api/common/features", commonFeatureRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

// Function to check if a port is available
const isPortAvailable = (port) => {
  return new Promise((resolve) => {
    const server = createServer()
      .listen(port, () => {
        server.close();
        resolve(true);
      })
      .on('error', () => {
        resolve(false);
      });
  });
};

// Find first available port
async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
    if (port - startPort > 10) {
      throw new Error('No available ports found');
    }
  }
  return port;
}

// Graceful shutdown handler
function handleGracefulShutdown(httpServer, wsServer) {
  const shutdown = async () => {
    console.log('\nReceived shutdown signal. Starting graceful shutdown...');

    // Close WebSocket server first
    if (wsServer) {
      wsServer.close(() => {
        console.log('WebSocket server closed.');
      });
    }

    // Then close HTTP server
    httpServer.close(() => {
      console.log('HTTP server closed.');
      
      // Finally close database connection
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed.');
        process.exit(0);
      });
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

// Start server
async function startServer() {
  try {
    await connectToMongoDB();
    
    const port = await findAvailablePort(PORT);
    const httpServer = createServer(app);
    
    // Create WebSocket server
    const wsServer = new WebSocketServer({ server: httpServer });

    // Handle WebSocket connections
    wsServer.on('connection', (ws) => {
      console.log('New WebSocket connection established');
      
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          // Handle different message types
          switch(data.type) {
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
              break;
            // Add more message type handlers as needed
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected');
      });
    });

    // Start HTTP server
    httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      if (port !== PORT) {
        console.log(`Note: Original port ${PORT} was in use, using port ${port} instead`);
      }
    });

    handleGracefulShutdown(httpServer, wsServer);

    // Handle uncaught exceptions and rejections
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
