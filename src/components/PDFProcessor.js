import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

class PDFProcessor {
  constructor() {
    this.chunkSize = 1000; // Increased from 500 to 1000 words
    this.overlap = 100;    // Increased overlap for better context
  }

  async processPDF(file) {
    try {
      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const textChunks = [];
      let totalTextLength = 0;
      let contentPages = 0;
      let skippedPages = 0;
      
      console.log(`Processing PDF with ${pdf.numPages} pages...`);
      
      // Extract text from each page, but be smarter about skipping headers
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        
        const trimmedText = pageText.trim();
        const textLength = trimmedText.length;
        
        // Skip pages that are likely headers, copyright, or table of contents
        if (this.isHeaderPage(trimmedText, pageNum)) {
          console.log(`Skipping page ${pageNum} (header/toc: ${textLength} chars)`);
          skippedPages++;
          continue;
        }
        
        // Only start collecting content after we've seen some substantial pages
        if (contentPages < 2 && textLength < 500) {
          console.log(`Skipping page ${pageNum} (too short for content: ${textLength} chars)`);
          skippedPages++;
          continue;
        }
        
        totalTextLength += textLength;
        contentPages++;
        
        console.log(`Page ${pageNum}: ${textLength} characters - ACCEPTED`);
        
        // Split text into chunks
        const chunks = this.splitTextIntoChunks(trimmedText, pageNum);
        textChunks.push(...chunks);
        
        // Limit to first 30 content pages to avoid overwhelming the API
        if (contentPages >= 30) {
          console.log(`Reached limit of 30 content pages, stopping extraction`);
          break;
        }
      }
      
      console.log(`Skipped ${skippedPages} header/toc pages`);
      console.log(`Extracted ${contentPages} content pages with ${textChunks.length} chunks`);
      console.log(`Total text length: ${totalTextLength} characters`);
      
      return {
        totalPages: pdf.numPages,
        contentPages: contentPages,
        skippedPages: skippedPages,
        totalChunks: textChunks.length,
        textChunks: textChunks,
        totalTextLength: totalTextLength
      };
      
    } catch (error) {
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
  }

  isHeaderPage(text, pageNum) {
    const lowerText = text.toLowerCase();
    
    // Skip pages that are clearly headers, copyright, or table of contents
    if (pageNum <= 5) {
      // First 5 pages are almost always headers
      return true;
    }
    
    // Skip pages with common header indicators
    if (lowerText.includes('project gutenberg') || 
        lowerText.includes('copyright') ||
        lowerText.includes('table of contents') ||
        lowerText.includes('contents') ||
        lowerText.includes('introduction') ||
        lowerText.includes('preface') ||
        lowerText.includes('chapter i') ||
        lowerText.includes('book i')) {
      return true;
    }
    
    // Skip very short pages (likely headers)
    if (text.length < 200) {
      return true;
    }
    
    // Skip pages that are mostly numbers or chapter titles
    const words = text.split(/\s+/);
    const shortWords = words.filter(w => w.length <= 3).length;
    if (shortWords > words.length * 0.7) {
      return true;
    }
    
    return false;
  }

  splitTextIntoChunks(text, pageNum) {
    const words = text.split(/\s+/);
    const chunks = [];
    
    // Only create chunks if we have enough words
    if (words.length < this.chunkSize) {
      // For short pages, create one chunk
      chunks.push({
        text: text.trim(),
        page: pageNum
      });
    } else {
      // For longer pages, split into chunks
      for (let i = 0; i < words.length; i += this.chunkSize - this.overlap) {
        const chunkWords = words.slice(i, i + this.chunkSize);
        const chunkText = chunkWords.join(' ');
        
        if (chunkText.trim()) {
          chunks.push({
            text: chunkText,
            page: pageNum
          });
        }
      }
    }
    
    return chunks;
  }

  // Improved text search with better relevance scoring
  searchText(textChunks, query) {
    const queryLower = query.toLowerCase();
    const results = [];
    
    textChunks.forEach((chunk, index) => {
      if (chunk.text.toLowerCase().includes(queryLower)) {
        results.push({
          chunk,
          index,
          relevance: this.calculateRelevance(chunk.text, query)
        });
      }
    });
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    return results.slice(0, 5); // Return top 5 results instead of 3
  }

  calculateRelevance(text, query) {
    const textLower = text.toLowerCase();
    const queryWords = query.toLowerCase().split(/\s+/);
    
    let score = 0;
    queryWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        score += matches.length * 10; // Boost score for multiple matches
      }
    });
    
    // Bonus for longer text chunks (more context)
    score += Math.min(text.length / 100, 50);
    
    return score;
  }
}

export default PDFProcessor;
