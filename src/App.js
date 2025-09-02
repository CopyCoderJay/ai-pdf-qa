import React, { useState, useEffect } from 'react';
import PDFProcessor from './components/PDFProcessor';
import ChatInterface from './components/ChatInterface';
import Sidebar from './components/Sidebar';
import { Upload, FileText, Plus } from 'lucide-react';

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestedQuestion, setSuggestedQuestion] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileUpload = async (file) => {
    if (!file || !file.type.includes('pdf')) {
      alert('Please upload a valid PDF file.');
      return;
    }

    setPdfFile(file);
    setIsProcessing(true);

    try {
      const processor = new PDFProcessor();
      const result = await processor.processPDF(file);

      setDocumentInfo(result);
      setSuggestedQuestion(''); // Reset suggested question
      
      // Generate suggested questions based on the document
      const suggestions = generateSuggestedQuestions(result);
      setSuggestedQuestion(suggestions[0]); // Set first suggestion
      
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSuggestedQuestions = (docInfo) => {
    const baseQuestions = [
      "What is this document about?",
      "What are the main topics covered?",
      "Can you summarize the key points?",
      "What are the important conclusions?",
      "What recommendations are mentioned?"
    ];

    // Customize questions based on document length
    if (docInfo.totalPages > 50) {
      baseQuestions[0] = "What is the main purpose of this long document?";
      baseQuestions[1] = "What are the major sections and their content?";
    }

    if (docInfo.totalTextLength > 10000) {
      baseQuestions[2] = "Can you provide a comprehensive summary?";
    }

    return baseQuestions;
  };

  const handleNewMessage = (question, answer) => {
    const newMessage = {
      question,
      answer,
      timestamp: new Date()
    };
    setConversationHistory(prev => [...prev, newMessage]);
  };

  const handleSuggestedQuestionUsed = () => {
    setSuggestedQuestion(''); // Clear the suggested question after use
  };

  return (
    <div className="h-screen w-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-72 hidden md:flex flex-col">
        <Sidebar
          documentInfo={documentInfo}
          pdfFileName={pdfFile?.name}
          onQuestionSelect={(q) => setSuggestedQuestion(q)}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 h-full flex flex-col">
        {/* Header */}
        <header className="h-14 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" size={22} />
            <span className="font-semibold">AI PDF Q&A Assistant</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 text-green-700 bg-green-50 rounded">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-xs font-medium">Gemini API Ready</span>
          </div>
        </header>

        {/* Chat container with drag/drop */}
        <main
          className={`flex-1 overflow-hidden flex flex-col ${dragOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-gray-50' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file && file.type.includes('pdf')) handleFileUpload(file);
          }}
        >
          {/* Chat content */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6">
              {/* Hint removed per request */}

              <ChatInterface
                conversationHistory={conversationHistory}
                onNewMessage={handleNewMessage}
                documentInfo={documentInfo}
                suggestedQuestion={suggestedQuestion}
                onSuggestedQuestionUsed={handleSuggestedQuestionUsed}
                onUploadFile={handleFileUpload}
              />
            </div>
          </div>

          {/* No footer controls; drag & drop is supported above */}
        </main>
      </div>
    </div>
  );
}

export default App;
