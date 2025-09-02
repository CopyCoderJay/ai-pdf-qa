import React from 'react';

const Sidebar = ({ documentInfo, onQuestionSelect, pdfFileName }) => {
  const suggestions = [
    'Give me a summary of this document',
    'List key characters or entities',
    'What are the main arguments or themes?',
    'Show important dates/timeline',
    'What are the conclusions or recommendations?'
  ];

  return (
    <aside className="h-full w-full flex flex-col bg-white border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Documents</h2>
        {pdfFileName ? (
          <p className="mt-2 text-sm text-gray-600 truncate" title={pdfFileName}>{pdfFileName}</p>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No file uploaded</p>
        )}
      </div>

      <div className="p-4 border-b">
        <h3 className="text-sm font-medium text-gray-700">Document Info</h3>
        {documentInfo ? (
          <ul className="mt-2 text-sm text-gray-600 space-y-1">
            <li>Pages: <span className="font-medium text-gray-900">{documentInfo.totalPages}</span></li>
            {documentInfo.contentPages !== undefined && (
              <li>Content pages: <span className="font-medium text-gray-900">{documentInfo.contentPages}</span></li>
            )}
            <li>Chunks: <span className="font-medium text-gray-900">{documentInfo.totalChunks}</span></li>
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-400">Upload a PDF to see details</p>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Suggested Questions</h3>
        {documentInfo ? (
          <div className="grid grid-cols-1 gap-2">
            {suggestions.map((q, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onQuestionSelect(q)}
                className="text-left px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 border text-sm"
              >
                {q}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">Upload a PDF to see suggestions</p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;


