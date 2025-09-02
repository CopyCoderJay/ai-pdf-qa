# 🤖 AI-Powered PDF Q&A Assistant (React Version)

A modern, responsive React application that transforms any PDF into an intelligent knowledge base using AI-powered insights. Built with React, Tailwind CSS, and Hugging Face AI models.

## ✨ Features

- **📚 PDF Processing**: Upload and process PDFs up to 10MB
- **💬 Chat Interface**: Clean, modern chat-like interface for Q&A
- **🤖 AI Integration**: Powered by Hugging Face's Mistral-7B model
- **💡 Smart Suggestions**: 5 suggested questions to get started
- **🎨 Modern UI**: Beautiful, responsive design with Tailwind CSS
- **📱 Mobile Friendly**: Works perfectly on all devices
- **🔐 Secure**: API token stored locally in browser
- **⚡ Fast**: Client-side PDF processing with PDF.js

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Hugging Face account (free)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-pdf-qa-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 Setup Hugging Face API

1. **Get your free API token**:
   - Go to [Hugging Face Settings](https://huggingface.co/settings/tokens)
   - Sign up for a free account
   - Create a new token with **"Read"** permissions
   - Copy the token (starts with `hf_`)

2. **Add token to the app**:
   - Click the ⚙️ Settings button in the top-right
   - Paste your API token
   - Click "Save Changes"

## 🏗️ Architecture

```
src/
├── components/
│   ├── App.js              # Main application component
│   ├── PDFProcessor.js     # PDF text extraction and processing
│   ├── ChatInterface.js    # Chat conversation interface
│   ├── SuggestedQuestions.js # Question suggestions component
│   └── SettingsPanel.js    # API configuration panel
├── index.js                # React entry point
└── index.css               # Global styles and Tailwind imports
```

## 🛠️ Technology Stack

- **Frontend**: React 18, Tailwind CSS
- **PDF Processing**: PDF.js (client-side)
- **AI Integration**: Hugging Face Inference API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Build Tool**: Create React App

## 📱 How It Works

1. **Upload PDF**: Drag & drop or click to upload
2. **Process Document**: Client-side text extraction and chunking
3. **Ask Questions**: Type questions or click suggested ones
4. **AI Response**: Get intelligent answers based on PDF content
5. **Chat History**: View all conversations with timestamps

## 🎨 UI Components

### Upload Section
- Clean dashed border design
- Drag & drop support
- File validation (PDF only, 10MB limit)
- Processing indicators

### Chat Interface
- Modern chat bubbles
- User messages (right-aligned, blue)
- AI responses (left-aligned, gray)
- Real-time typing indicators
- Smooth scrolling

### Suggested Questions
- 5 helpful starter questions
- Click to auto-fill chat
- Responsive grid layout
- Hover animations

## 🔧 Customization

### Colors
Modify `tailwind.config.js` to change the color scheme:
```javascript
colors: {
  primary: '#6366f1',    // Main brand color
  secondary: '#8b5cf6',  // Secondary color
  success: '#10b981',    // Success states
  // ... more colors
}
```

### PDF Processing
Adjust chunk size and overlap in `PDFProcessor.js`:
```javascript
constructor() {
  this.chunkSize = 500;  // Words per chunk
  this.overlap = 50;     // Overlap between chunks
}
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy Options
- **Vercel**: Drag & drop `build` folder
- **Netlify**: Connect GitHub repo
- **GitHub Pages**: Use `gh-pages` package
- **AWS S3**: Upload `build` folder to S3 bucket

## 📊 Performance

- **PDF Processing**: Client-side for privacy
- **Text Chunking**: Optimized for AI context windows
- **Lazy Loading**: Components load as needed
- **Responsive Design**: Mobile-first approach

## 🔒 Security Features

- **Local Storage**: API tokens stored in browser only
- **No Backend**: All processing happens client-side
- **HTTPS Required**: Secure API communication
- **Input Validation**: File type and size restrictions

## 🐛 Troubleshooting

### Common Issues

1. **PDF not processing**
   - Check file size (max 10MB)
   - Ensure file is valid PDF
   - Try refreshing the page

2. **AI not responding**
   - Verify API token is correct
   - Check Hugging Face service status
   - Ensure token has "Read" permissions

3. **App not loading**
   - Clear browser cache
   - Check Node.js version (16+)
   - Reinstall dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Hugging Face](https://huggingface.co/) for free AI models
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF processing
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React](https://reactjs.org/) for the framework

## 📞 Support

- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions
- **Email**: [your-email@example.com]

---

**Made with ❤️ using React and AI**
