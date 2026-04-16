const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const dotenv = require("dotenv");
const dns = require('dns');

// Set DNS resolution preference
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

// Configure Cloudinary with timeout and retry options
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000, // 60 seconds
});

const storage = multer.memoryStorage();

async function retryWithTimeout(fn, maxAttempts = 3, timeout = 30000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Operation timed out')), timeout)
      );
      
      return await Promise.race([fn(), timeoutPromise]);
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt)); // Exponential backoff
        continue;
      }
    }
  }
  
  throw lastError;
}

async function imageUploadUtil(file) {
  try {
    const uploadFn = () => cloudinary.uploader.upload(file, {
      resource_type: "auto",
      folder: "ecommerce/products",
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      timeout: 60000,
    });

    const result = await retryWithTimeout(uploadFn);
    
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      throw new Error("Network error: Unable to connect to Cloudinary. Please check your internet connection.");
    } else if (error.http_code === 401) {
      throw new Error("Unauthorized: Check Cloudinary credentials");
    } else if (error.http_code === 400) {
      throw new Error("Invalid file format or corrupted image");
    }
    
    throw new Error(error.message || "Failed to upload image to Cloudinary");
  }
}

// Configure multer with limits
const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB max file size
    files: 10 // max 10 files
  },
  fileFilter: (req, file, cb) => {
    // Accept all image types
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  }
});

module.exports = { upload, imageUploadUtil };