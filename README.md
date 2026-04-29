# CV Analyzer

An AI-powered application that analyzes your CV and matches it with job descriptions to provide detailed insights on skill alignment, experience relevance, and improvement suggestions.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **CV Upload**: Upload your CV in PDF format
- **Job Description Input**: Paste job descriptions for analysis
- **AI-Powered Analysis**: Advanced AI analysis to match CVs with job requirements
- **Match Score**: Get a comprehensive match score between your CV and the job
- **Skill Analysis**: Identify matching and missing skills
- **Experience Mapping**: See how your experience aligns with job requirements
- **Improvement Suggestions**: Get recommendations to improve your profile
- **Secure Processing**: Your data is processed securely and not stored permanently

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Component Library**: Custom UI components (badge, button, card, input, label, progress, textarea)
- **HTTP Client**: Axios
- **Package Manager**: npm

### Backend

- **Language**: Python
- **Framework**: FastAPI
- **Server**: Uvicorn
- **AI Processing**: Advanced NLP and ML models for CV analysis

## 📁 Project Structure

```
cv matching/
├── client/                          # React frontend application
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── AnalyzeButton.tsx   # Button to trigger analysis
│   │   │   ├── FileUpload.tsx      # CV upload component
│   │   │   ├── JobInput.tsx        # Job description input
│   │   │   ├── ResultCard.tsx      # Results display component
│   │   │   └── ui/                 # Reusable UI components
│   │   │       ├── badge.tsx
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── input.tsx
│   │   │       ├── label.tsx
│   │   │       ├── progress.tsx
│   │   │       └── textarea.tsx
│   │   ├── pages/
│   │   │   └── CVAnalyzer.tsx      # Main page component
│   │   ├── services/
│   │   │   └── api.ts              # API communication layer
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript type definitions
│   │   ├── lib/
│   │   │   └── utils.ts            # Utility functions
│   │   ├── App.tsx                 # Main app component
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── tailwind.config.ts          # Tailwind configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── vite.config.ts              # Vite configuration
│   └── package.json                # Frontend dependencies
│
├── server/                          # Python backend application
│   ├── routes/                     # API route handlers
│   ├── services/                   # Business logic services
│   ├── main.py                     # Application entry point
│   ├── requirements.txt            # Python dependencies
│   └── __pycache__/               # Python cache
│
└── README.md                        # This file
```

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn package manager
- Git

### Frontend Setup

1. Navigate to the client directory:

```bash
cd client
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (if needed for API endpoints):

```bash
VITE_API_URL=http://localhost:8000
```

### Backend Setup

1. Navigate to the server directory:

```bash
cd server
```

2. Create a virtual environment (recommended):

```bash
python -m venv venv
```

3. Activate the virtual environment:
   - **Windows PowerShell**:

   ```bash
   .\venv\Scripts\Activate.ps1
   ```

   - **Windows CMD**:

   ```bash
   venv\Scripts\activate.bat
   ```

   - **macOS/Linux**:

   ```bash
   source venv/bin/activate
   ```

4. Install dependencies:

```bash
pip install -r requirements.txt
```

## 🚀 Usage

### Running the Application

1. **Start the Backend Server**:

```bash
cd server
uvicorn main:app --reload
```

The backend will be available at `http://localhost:8000`

2. **Start the Frontend Development Server** (in another terminal):

```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Using the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Upload your CV in PDF format using the file upload component
3. Paste the job description in the text area
4. Click the "Analyze" button
5. View your match score, skill analysis, and improvement suggestions

## 📡 API Documentation

### Endpoints

#### POST `/analyze`

Analyzes a CV against a job description.

**Request:**

- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `cv` (file): PDF file of the CV
  - `job` (string): Job description text

**Response:**

```json
{
  "matchScore": 85,
  "matchPercentage": 85,
  "skillsMatch": {
    "matching": ["Python", "JavaScript", "React"],
    "missing": ["Docker", "Kubernetes"]
  },
  "strengths": ["Strong backend experience", "Full-stack capabilities"],
  "improvements": ["Add cloud deployment experience", "Learn containerization"],
  "summary": "You are well-matched for this position..."
}
```

**Status Codes:**

- `200`: Analysis successful
- `400`: Missing or invalid parameters
- `422`: Invalid CV format or content
- `500`: Server error

## ⚙️ Configuration

### Frontend Configuration

**Tailwind CSS** (`tailwind.config.ts`):

- Custom color palette with primary and accent colors
- Border radius customization
- Responsive design breakpoints

**TypeScript** (`tsconfig.json`):

- Path alias: `@/*` points to `./src/*`
- ES2023 target
- Strict type checking enabled

**Vite** (`vite.config.ts`):

- Tailwind CSS integration
- React plugin enabled
- Development server configuration

### Backend Configuration

Edit `main.py` to configure:

- API host and port
- CORS settings
- API timeout values
- Model parameters

## 👨‍💻 Development

### Available Commands

**Frontend:**

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

**Backend:**

```bash
uvicorn main:app --reload          # Run with auto-reload
uvicorn main:app --host 0.0.0.0    # Run on all interfaces
```

### Code Style

- Frontend uses **ESLint** with React and TypeScript rulesets
- Code formatting with consistent import organization
- Type-safe TypeScript throughout

### Adding New Components

1. Create a new `.tsx` file in `src/components/`
2. Use the existing UI components from `src/components/ui/`
3. Type your props with TypeScript interfaces
4. Export both component and its variants (if applicable)

## 🐛 Troubleshooting

### Build Errors

**Tailwind CSS Unknown Utility Classes:**

- Ensure all custom colors are defined in `tailwind.config.ts`
- Use defined color names (e.g., `primary-50` instead of `gray-50`)

**TypeScript Errors:**

- Clear `node_modules` and reinstall: `npm install`
- Check for conflicting type definitions

### Runtime Issues

**Backend Connection Refused:**

- Ensure backend is running on the correct port
- Check `VITE_API_URL` environment variable
- Verify CORS configuration in backend

**CV Upload Failures:**

- Check file size (recommended < 5MB)
- Ensure file is in PDF format
- Verify file permissions

**Analysis Timeouts:**

- Backend may need optimization
- Try with smaller CV files
- Check system resources

### Port Already in Use

**Frontend (Port 5173):**

```bash
npm run dev -- --port 3000
```

**Backend (Port 8000):**

```bash
uvicorn main:app --port 8001
```

## 📝 Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_API_URL=http://localhost:8000
VITE_API_TIMEOUT=30000
```

## 📄 License

This project is provided as-is for educational and professional use.

## 🤝 Contributing

For contributions, please:

1. Create a new branch for your feature
2. Follow the existing code style
3. Test your changes thoroughly
4. Submit a pull request with a clear description

## 📞 Support

For issues or questions:

1. Check the Troubleshooting section
2. Review the project structure
3. Check browser console for frontend errors
4. Check backend logs for server errors

## 🎯 Future Enhancements

- Support for multiple CV formats (DOCX, TXT)
- CV comparison with multiple job descriptions
- Detailed skill gap analysis with learning resources
- Machine learning model improvements
- User account and history tracking
- Export analysis results as PDF

---

**Last Updated**: April 2026

**Version**: 1.0.0
