ContentVault
A content management application for saving and reading articles from the web with a focus on original content extraction only.
🚨 Important Policy
ContentVault STRICTLY extracts only original content from web sources. NO AI-generated content is ever created. If content extraction fails, the operation fails completely - no fake or AI-generated content is produced.
Features

📚 Original Content Extraction: Extracts real content from web pages
🔍 Smart Search: Search through your saved articles
📌 Organization: Pin, archive, and tag articles
📱 Responsive Design: Works on desktop and mobile
🎨 Clean Reading Experience: Distraction-free article reading
🔒 Privacy Focused: No data collection, everything stored locally

Browser Limitations
Due to CORS (Cross-Origin Resource Sharing) restrictions, this browser-based application has limited extraction capabilities. Most websites (including Wikipedia, news sites, etc.) will fail to extract content.
For production use, you would need:

Backend server for content extraction
Server-side headless browser (Puppeteer, Playwright)
Content extraction APIs
Proper authentication and rate limiting

Getting Started
Prerequisites

Node.js (version 16 or higher)
npm or yarn

Installation

Clone or download this project
Install dependencies:
bashnpm install

Start the development server:
bashnpm run dev

Open your browser and navigate to http://localhost:3000

Building for Production
bashnpm run build
The built files will be in the dist directory.
Project Structure
contentvault/
├── public/           # Static files
├── src/
│   ├── App.tsx       # Main application component
│   ├── main.tsx      # Application entry point
│   └── index.css     # Global styles with Tailwind
├── index.html        # HTML template
├── package.json      # Dependencies and scripts
├── vite.config.ts    # Vite configuration
├── tailwind.config.js # Tailwind CSS configuration
└── README.md         # This file
Technologies Used

React 18 - UI framework
TypeScript - Type safety
Vite - Build tool and dev server
Tailwind CSS - Utility-first CSS framework
Lucide React - Icon library

Content Extraction
The app attempts to extract content using multiple methods:

AllOrigins Proxy: api.allorigins.win
CORS Anywhere: cors-anywhere.herokuapp.com
Direct Fetch: For CORS-enabled sites

Important: If all extraction methods fail, the operation fails completely. No artificial content is generated.
Known Limitations

CORS Restrictions: Most websites block cross-origin requests
Dynamic Content: JavaScript-rendered content cannot be extracted
Authentication: Cannot access content behind login walls
Rate Limiting: Some sites may block repeated requests

Future Enhancements (Require Backend)

Server-side content extraction
PDF and document support
Full-text search
Data persistence (database)
User accounts and sync
Content categorization
Export functionality

License
This project is open source and available under the MIT License.
Contributing
Contributions are welcome! Please ensure any content extraction features maintain the strict "original content only" policy.
