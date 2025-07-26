const express = require('express');
const multer = require('multer');
const axios = require('axios');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for Codespaces/cloud environments
app.set('trust proxy', true);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware - more permissive for development
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginEmbedderPolicy: false
}));
app.use(cors());

// Rate limiting - disabled for development
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100, // limit each IP to 100 requests per windowMs
//     message: {
//         error: 'Too many requests from this IP, please try again later.'
//     }
// });
// app.use('/api/', limiter);

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Accept images, documents, and text files
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Validation schemas
const userSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    age: Joi.number().integer().min(18).max(120).required()
});

const weatherSchema = Joi.object({
    city: Joi.string().min(2).max(50).required()
});

// In-memory storage for demo purposes
let users = [];
let uploadedFiles = [];

// Routes

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// User management routes
app.get('/api/users', (req, res) => {
    res.json({
        success: true,
        data: users,
        count: users.length
    });
});

app.post('/api/users', async (req, res, next) => {
    try {
        const { error, value } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: error.details
            });
        }

        const user = {
            id: Date.now(),
            ...value,
            createdAt: new Date().toISOString()
        };

        users.push(user);
        res.status(201).json({
            success: true,
            data: user,
            message: 'User created successfully'
        });
    } catch (error) {
        next(error);
    }
});

// File upload routes
app.post('/api/upload/single', upload.single('file'), (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const fileInfo = {
            id: Date.now(),
            originalName: req.file.originalname,
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadedAt: new Date().toISOString(),
            url: `/uploads/${req.file.filename}`
        };

        uploadedFiles.push(fileInfo);

        res.json({
            success: true,
            data: fileInfo,
            message: 'File uploaded successfully'
        });
    } catch (error) {
        next(error);
    }
});

app.post('/api/upload/multiple', upload.array('files', 5), (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }

        const filesInfo = req.files.map(file => ({
            id: Date.now() + Math.random(),
            originalName: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            uploadedAt: new Date().toISOString(),
            url: `/uploads/${file.filename}`
        }));

        uploadedFiles.push(...filesInfo);

        res.json({
            success: true,
            data: filesInfo,
            message: `${filesInfo.length} files uploaded successfully`
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/files', (req, res) => {
    res.json({
        success: true,
        data: uploadedFiles,
        count: uploadedFiles.length
    });
});

// Third-party API integration - Weather API
app.get('/api/weather/:city', async (req, res, next) => {
    try {
        const { error, value } = weatherSchema.validate({ city: req.params.city });
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Invalid city name',
                details: error.details
            });
        }

        const city = value.city;
        const API_KEY = process.env.WEATHER_API_KEY || 'demo_key';
        
        // Using OpenWeatherMap API (you'll need to get a free API key)
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        
        try {
            const response = await axios.get(weatherUrl);
            const weatherData = {
                city: response.data.name,
                country: response.data.sys.country,
                temperature: response.data.main.temp,
                description: response.data.weather[0].description,
                humidity: response.data.main.humidity,
                windSpeed: response.data.wind.speed,
                timestamp: new Date().toISOString()
            };

            res.json({
                success: true,
                data: weatherData
            });
        } catch (apiError) {
            if (apiError.response?.status === 404) {
                return res.status(404).json({
                    success: false,
                    error: 'City not found'
                });
            }
            
            // For demo purposes, return mock data if API fails
            res.json({
                success: true,
                data: {
                    city: city,
                    country: 'Demo',
                    temperature: 25,
                    description: 'Demo weather data (API key required for real data)',
                    humidity: 60,
                    windSpeed: 5.5,
                    timestamp: new Date().toISOString()
                },
                note: 'This is demo data. Set WEATHER_API_KEY environment variable for real weather data.'
            });
        }
    } catch (error) {
        next(error);
    }
});

// Third-party API integration - Random Quote API
app.get('/api/quote', async (req, res, next) => {
    try {
        const response = await axios.get('https://api.quotable.io/random');
        res.json({
            success: true,
            data: {
                quote: response.data.content,
                author: response.data.author,
                tags: response.data.tags
            }
        });
    } catch (error) {
        // Fallback quote if API fails
        res.json({
            success: true,
            data: {
                quote: "The only way to do great work is to love what you do.",
                author: "Steve Jobs",
                tags: ["inspirational"]
            },
            note: "Fallback quote due to API unavailability"
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err);

    // Multer errors
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large',
                message: 'File size must be less than 5MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files',
                message: 'Maximum 5 files allowed'
            });
        }
    }

    // Custom file type error
    if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({
            success: false,
            error: 'Invalid file type',
            message: err.message
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation error',
            message: err.message
        });
    }

    // Default error response
    res.status(err.status || 500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`🚀 Advanced Express server running on port ${PORT}`);
    console.log(`📁 File uploads available at http://localhost:${PORT}/uploads`);
    console.log(`🌐 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`📋 Documentation available at http://localhost:${PORT}`);
});

module.exports = app;
