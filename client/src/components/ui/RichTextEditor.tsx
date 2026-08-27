import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  RemoveFormatting,
  Eye,
  FileCode,
  Undo,
  Redo,
  Sparkles,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  minHeight?: string;
  className?: string;
  error?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write detailed description or article content here...',
  label,
  minHeight = '220px',
  className = '',
  error,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isCodeMode, setIsCodeMode] = useState<boolean>(false);
  const [htmlCode, setHtmlCode] = useState<string>(value || '');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Synchronize external value changes with contentEditable innerHTML when not focused
  useEffect(() => {
    if (editorRef.current && !isFocused) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setHtmlCode(value || '');
  }, [value, isFocused]);

  // Execute formatting command
  const executeCommand = (command: string, arg: string | undefined = undefined) => {
    if (isCodeMode) return;
    document.execCommand(command, false, arg);
    if (editorRef.current) {
      const updatedValue = editorRef.current.innerHTML;
      onChange(updatedValue);
      setHtmlCode(updatedValue);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
      setHtmlCode(content);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setHtmlCode(val);
    onChange(val);
    if (editorRef.current) {
      editorRef.current.innerHTML = val;
    }
  };

  const handleInsertLink = () => {
    const url = prompt('Enter link URL (e.g. https://stitchxplus.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const handleInsertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  const handleFormatBlock = (tagName: string) => {
    executeCommand('formatBlock', `<${tagName}>`);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-charcoal-800 tracking-wide uppercase">
          {label}
        </label>
      )}

      <div
        className={`rounded-2xl border transition-all overflow-hidden bg-white shadow-xs ${
          error
            ? 'border-rose-400 focus-within:ring-2 focus-within:ring-rose-500/20'
            : isFocused
            ? 'border-bronze-500 ring-2 ring-bronze-500/20 shadow-md'
            : 'border-charcoal-200/90 hover:border-charcoal-300'
        }`}
      >
        {/* Toolbar Header */}
        <div className="bg-cream-50/90 border-b border-charcoal-200/70 p-2 flex flex-wrap items-center justify-between gap-1 select-none text-charcoal-700">
          <div className="flex flex-wrap items-center gap-1">
            {/* Undo / Redo */}
            <button
              type="button"
              onClick={() => executeCommand('undo')}
              title="Undo"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <Undo className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('redo')}
              title="Redo"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <Redo className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-charcoal-200 mx-1" />

            {/* Headings */}
            <button
              type="button"
              onClick={() => handleFormatBlock('h1')}
              title="Heading 1"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 font-bold transition-colors"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock('h2')}
              title="Heading 2"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 font-bold transition-colors"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock('h3')}
              title="Heading 3"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 font-bold transition-colors"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-charcoal-200 mx-1" />

            {/* Text Formatting */}
            <button
              type="button"
              onClick={() => executeCommand('bold')}
              title="Bold"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('italic')}
              title="Italic"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('underline')}
              title="Underline"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('strikeThrough')}
              title="Strikethrough"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-charcoal-200 mx-1" />

            {/* Lists & Quote */}
            <button
              type="button"
              onClick={() => executeCommand('insertUnorderedList')}
              title="Bullet List"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('insertOrderedList')}
              title="Numbered List"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleFormatBlock('blockquote')}
              title="Quote Block"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-charcoal-200 mx-1" />

            {/* Alignment */}
            <button
              type="button"
              onClick={() => executeCommand('justifyLeft')}
              title="Align Left"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyCenter')}
              title="Align Center"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('justifyRight')}
              title="Align Right"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-charcoal-200 mx-1" />

            {/* Inserts */}
            <button
              type="button"
              onClick={handleInsertLink}
              title="Insert Link"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleInsertImage}
              title="Insert Image URL"
              className="p-1.5 hover:bg-white rounded-lg hover:text-bronze-700 text-charcoal-600 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand('removeFormat')}
              title="Clear Formatting"
              className="p-1.5 hover:bg-white rounded-lg hover:text-rose-600 text-charcoal-600 transition-colors"
            >
              <RemoveFormatting className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* View Mode Toggle: Visual vs HTML Source Code */}
          <div className="flex items-center gap-1 border-l border-charcoal-200 pl-2">
            <button
              type="button"
              onClick={() => setIsCodeMode(false)}
              className={`p-1.5 px-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                !isCodeMode
                  ? 'bg-bronze-600 text-white shadow-xs'
                  : 'text-charcoal-600 hover:bg-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Visual</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCodeMode(true)}
              className={`p-1.5 px-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                isCodeMode
                  ? 'bg-bronze-600 text-white shadow-xs'
                  : 'text-charcoal-600 hover:bg-white'
              }`}
            >
              <FileCode className="w-3 h-3" />
              <span>HTML</span>
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="p-3 bg-white relative">
          {!isCodeMode ? (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleInput}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{ minHeight }}
              className="prose prose-sm max-w-none text-charcoal-900 text-sm outline-none focus:outline-none leading-relaxed font-sans"
              data-placeholder={placeholder}
            />
          ) : (
            <textarea
              value={htmlCode}
              onChange={handleCodeChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{ minHeight }}
              className="w-full font-mono text-xs p-2 text-charcoal-900 bg-slate-900 text-emerald-400 rounded-xl outline-none focus:outline-none resize-y leading-relaxed"
              placeholder="<!-- Raw HTML Content -->"
            />
          )}

          {/* Placeholder hint when visual mode is empty */}
          {!isCodeMode && !value && (
            <div
              onClick={() => editorRef.current?.focus()}
              className="absolute top-4 left-4 text-charcoal-400 text-sm pointer-events-none italic"
            >
              {placeholder}
            </div>
          )}
        </div>

        {/* Editor Footer Status */}
        <div className="bg-cream-50/50 px-3 py-1.5 border-t border-charcoal-100 flex items-center justify-between text-[11px] text-charcoal-500">
          <div className="flex items-center gap-1 text-bronze-700">
            <Sparkles className="w-3 h-3" />
            <span>Stitchx Rich Atelier Editor</span>
          </div>
          <div>
            <span>{(value || '').replace(/<[^>]*>/g, '').length} characters</span>
          </div>
        </div>
      </div>

      {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
};
