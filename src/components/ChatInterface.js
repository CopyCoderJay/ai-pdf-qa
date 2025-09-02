import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, Plus } from 'lucide-react';
import axios from 'axios';

// Add your Gemini API key here
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
const callGemini = async (prompt) => {
  const response = await axios.post(
    GEMINI_API_URL,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 1024 },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
      ]
    },
    { headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY }, timeout: 30000 }
  );
  if (response.data?.candidates?.length > 0) {
    const t = response.data.candidates[0]?.content?.parts?.[0]?.text || '';
    return t.trim() || 'I could not generate an answer.';
  }
  throw new Error('Invalid response from Gemini');
};

const ChatInterface = ({ conversationHistory, onNewMessage, documentInfo, suggestedQuestion, onSuggestedQuestionUsed, onUploadFile }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Set suggested question when it changes
  useEffect(() => {
    if (suggestedQuestion) {
      setInputMessage(suggestedQuestion);
    }
  }, [suggestedQuestion]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    // Allow asking even before upload; will prompt below if missing docId

    const question = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setError('');

    // Clear suggested question after use
    if (suggestedQuestion && onSuggestedQuestionUsed) {
      onSuggestedQuestionUsed();
    }

    try {
      const response = await generateAIResponse(question);
      onNewMessage(question, response);
    } catch (err) {
      setError(`Error getting AI response: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (question) => {
    try {
      // Get relevant text chunks from the PDF for context
      let contextText = "";
      if (documentInfo && documentInfo.textChunks) {
        // Use more chunks for better context (first 5 chunks)
        const relevantChunks = documentInfo.textChunks.slice(0, 5);
        contextText = relevantChunks.map((chunk, index) => 
          `[Page ${chunk.page}, Chunk ${index + 1}]: ${chunk.text}`
        ).join('\n\n');
        
        console.log(`Using ${relevantChunks.length} chunks from pages: ${relevantChunks.map(c => c.page).join(', ')}`);
      }

      // Create a context-aware prompt for PDF Q&A
      const prompt = `You are a helpful AI assistant helping users understand PDF documents. 

Context from the uploaded PDF:
${contextText || "PDF content is being processed. Please ask general questions about the document."}

User Question: ${question}

Please provide a helpful, informative response based on the PDF context above. If the question is about specific content in the PDF, use the context to answer it clearly. If it's a general question about the document, provide relevant insights based on what you can see.

Answer:`;

      console.log('Sending request to Gemini API with context...');
      console.log('Context length:', contextText.length);
      
      const response = await axios.post(
        GEMINI_API_URL,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY
          },
          timeout: 30000 // 30 second timeout
        }
      );

      console.log('Gemini API Response:', response.data);

      if (response.data && response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          const generatedText = candidate.content.parts[0].text;
          
          if (generatedText && generatedText.trim().length > 0) {
            return generatedText.trim();
          } else {
            throw new Error('Generated response is empty');
          }
        } else {
          throw new Error('Invalid response structure from Gemini API');
        }
      } else {
        throw new Error('No response candidates from Gemini API');
      }
      
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      if (error.response) {
        // Server responded with error status
        if (error.response.status === 400) {
          throw new Error('Invalid request to Gemini API. Please check your API key and try again.');
        } else if (error.response.status === 401) {
          throw new Error('Invalid API key. Please check your Google Gemini API key.');
        } else if (error.response.status === 403) {
          throw new Error('Access denied. Please check your API key permissions.');
        } else if (error.response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment before asking another question.');
        } else if (error.response.status === 500) {
          throw new Error('Gemini API server error. Please try again in a few minutes.');
        } else if (error.response.status === 404) {
          throw new Error('Gemini model not found. Please try again later.');
        } else {
          throw new Error(`Gemini API Error ${error.response.status}: ${error.response.statusText}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('No response from Gemini API. Please check your internet connection and try again.');
      } else {
        // Something else happened
        throw new Error(error.message || 'Failed to connect to Gemini API. Please try again.');
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.includes('pdf') && onUploadFile) {
      onUploadFile(file);
    }
    e.target.value = '';
  };


  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Chat Messages */}
      <div className="p-6 h-96 overflow-y-auto">
        {conversationHistory.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>{documentInfo ? 'Start asking questions about your PDF document!' : 'Please upload a PDF first to begin chatting.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversationHistory.map((message, index) => (
              <div key={index} className="animate-fade-in">
                {/* User Message */}
                <div className="flex justify-end mb-3">
                  <div className="bg-primary text-white px-4 py-2 rounded-2xl rounded-br-md max-w-xs lg:max-w-md">
                    {message.question}
                  </div>
                </div>
                
                {/* AI Response */}
                <div className="flex justify-start mb-3">
                  <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-md max-w-xs lg:max-w-md">
                    {message.answer}
                  </div>
                </div>
                
                {/* Timestamp */}
                <div className="text-xs text-gray-400 text-center mb-4">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6 pb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="text-red-500" size={16} />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Input Section - OpenAI-like composer with action chips */}
      <div className="border-t p-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border shadow-sm px-3 py-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything"
                className="flex-1 px-3 py-2 outline-none"
                disabled={isLoading}
              />
              {/* Plus button to upload inside composer */}
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileSelected} />
              <button
                type="button"
                onClick={handleAttachClick}
                title="Attach PDF"
                className="w-9 h-9 rounded-full border bg-gray-50 hover:bg-gray-100 flex items-center justify-center"
              >
                <Plus size={16} />
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-primary hover:bg-primary/90 disabled:bg-gray-300 text-white px-4 py-2 rounded-full transition-colors flex items-center gap-2"
              >
                <Send size={16} />
                Send
              </button>
            </div>
            {/* No extra action chips here to keep only the global "+" uploader */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
