import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { ImageIcon } from '@heroicons/react/24/outline';
import ImagePickerModal from './ImagePickerModal';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  height = '600px',
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const insertImage = (url: string) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const selection = editor.getSelection();
    const position = selection
      ? { lineNumber: selection.startLineNumber, column: selection.startColumn }
      : editor.getPosition();
    
    const imageMarkdown = `![alt text](${url})`;
    
    // Use editor's built-in methods
    editor.executeEdits('insert-image', [
      {
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text: imageMarkdown,
        forceMoveMarkers: true,
      },
    ]);
    
    // Move cursor to alt text
    setTimeout(() => {
      const newPosition = {
        lineNumber: position.lineNumber,
        column: position.column + 2,
      };
      editor.setPosition(newPosition);
      editor.focus();
    }, 0);
    
    setShowImagePicker(false);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowImagePicker(true)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Inserisci immagine
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowPreview(false)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              !showPreview
                ? 'bg-pink-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => setShowPreview(true)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              showPreview
                ? 'bg-pink-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Anteprima
          </button>
        </div>
      </div>
      <div className="flex">
        {!showPreview && (
          <div className="flex-1">
            <Editor
              height={height}
              defaultLanguage="markdown"
              value={value}
              onChange={(val) => onChange(val || '')}
              onMount={handleEditorDidMount}
              theme="vs-light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        )}
        {showPreview && (
          <div className="flex-1 p-6 overflow-y-auto bg-white" style={{ height }}>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{value}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
      {showImagePicker && (
        <ImagePickerModal
          isOpen={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onSelect={insertImage}
        />
      )}
    </div>
  );
}
