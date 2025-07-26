# Advanced Express.js Application

A feature-rich Express.js application demonstrating advanced concepts including file upload, error handling, third-party API integration, and security best practices.

## Features

### 🔧 Core Features
- **RESTful API** with Express.js
- **File Upload** with validation and size limits
- **Error Handling** middleware with proper status codes
- **Third-party API Integration** (Weather API & Quote API)
- **Input Validation** using Joi
- **Rate Limiting** for API protection
- **Security Headers** with Helmet
- **Request Logging** with Morgan
- **CORS** support

### 📁 File Upload
- Single and multiple file upload endpoints
- File type validation (images, documents, PDFs)
- File size limits (5MB per file)
- Secure file storage with unique naming
- File metadata tracking

### 🌐 API Integrations
- **Weather API**: Get real-time weather data for any city
- **Quote API**: Fetch inspirational quotes
- Graceful fallback handling for API failures

### 🛡️ Security & Best Practices
- Rate limiting (100 requests per 15 minutes per IP)
- Security headers with Helmet
- Input validation and sanitization
- Error handling without exposing sensitive information
- CORS configuration
- Environment variable configuration

## Installation

1. Clone or navigate to the Assignment_8 directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. (Optional) Get a free Weather API key from [OpenWeatherMap](https://openweathermap.org/api) and add it to your `.env` file:
   ```
   WEATHER_API_KEY=your_actual_api_key_here
   ```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "age": 25
  }
  ```

### File Upload
- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files (max 5)
- `GET /api/files` - Get uploaded files list

### Third-party APIs
- `GET /api/weather/:city` - Get weather for city
- `GET /api/quote` - Get random inspirational quote

## File Upload Specifications

### Supported File Types
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`
- Documents: `.pdf`, `.doc`, `.docx`, `.txt`, `.csv`

### Limits
- Maximum file size: 5MB per file
- Maximum files per upload: 5 files
- Files are stored in the `uploads/` directory

## Error Handling

The application includes comprehensive error handling:
- **Validation Errors**: 400 status with detailed validation messages
- **File Upload Errors**: Specific errors for file size, type, and count limits
- **API Errors**: Graceful handling of third-party API failures
- **404 Errors**: Custom not found responses
- **500 Errors**: Internal server error handling

## Security Features

1. **Rate Limiting**: Prevents abuse with configurable limits
2. **Helmet**: Sets various HTTP headers for security
3. **CORS**: Configurable cross-origin resource sharing
4. **Input Validation**: Joi schemas for request validation
5. **File Validation**: Type and size checking for uploads
6. **Environment Variables**: Sensitive data protection

## Frontend Interface

The application includes a beautiful, responsive web interface at the root URL (`/`) featuring:
- Interactive forms for all API endpoints
- Real-time result display
- File upload with progress feedback
- Weather information display
- Random quote generator
- Complete API documentation

## Project Structure

```
Assignment_8/
├── server.js              # Main application file
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
├── public/
│   └── index.html        # Frontend interface
└── uploads/              # File upload directory (created automatically)
```

## Development Notes

- The application uses in-memory storage for demo purposes
- For production, consider implementing:
  - Database integration (MongoDB, PostgreSQL, etc.)
  - Authentication and authorization
  - File storage service (AWS S3, Cloudinary, etc.)
  - Caching layer (Redis)
  - API documentation (Swagger)
  - Unit and integration tests

## Environment Variables

See `.env.example` for all available configuration options:
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode
- `WEATHER_API_KEY`: OpenWeatherMap API key
- File upload configuration options

## Testing the Application

1. **Start the server**: `npm run dev`
2. **Open browser**: Navigate to `http://localhost:3000`
3. **Test features**:
   - Create users with the form
   - Upload various file types
   - Check weather for different cities
   - Generate random quotes
   - View uploaded files

## API Testing with curl

```bash
# Health check
curl http://localhost:3000/api/health

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","age":25}'

# Upload file
curl -X POST http://localhost:3000/api/upload/single \
  -F "file=@/path/to/your/file.jpg"

# Get weather
curl http://localhost:3000/api/weather/London

# Get quote
curl http://localhost:3000/api/quote
```

## License

ISC
