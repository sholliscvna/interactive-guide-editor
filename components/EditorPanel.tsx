import React, { useRef, useEffect } from 'react';
import { Section } from '../types';
import { CATEGORIES } from '../constants';

interface EditorPanelProps {
  guideTitle: string;
  setGuideTitle: (title: string) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sections: Section[];
  editingSection: Section | null;
  onStartPinPlacement: () => void;
  onUpdateSection: (section: Section) => void;
  onDeleteSection: (id: string) => void;
  setEditingSectionId: (id: string | null) => void;
  hasImage: boolean;
  onStartMovePin: (id: string) => void;
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;

  // This effect synchronizes the editor's content with the `value` prop.
  // It's crucial for loading initial data or when the selected section changes.
  // The condition `editorRef.current.innerHTML !== value` prevents it from
  // resetting the content (and cursor) while the user is typing.
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const newHtml = editorRef.current.innerHTML;
      if (newHtml !== valueRef.current) {
        onChangeRef.current(newHtml);
      }
    }
  };

  const execCmd = (command: string, valueArg?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, valueArg);
      handleInput(); // Sync state after command
    }
  };

  const handleToolbarClick = (e: React.MouseEvent<HTMLButtonElement>, callback: () => void) => {
    e.preventDefault(); // Prevent editor from losing focus
    callback();
  };

  const handleLink = () => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);

    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      editorRef.current.focus();
      alert("Please select the text you want to link.");
      return;
    }

    const url = prompt('Enter the URL:');
    if (url) {
      selection.removeAllRanges();
      selection.addRange(range);
      execCmd('createLink', url);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        execCmd('insertImage', base64Url);
        if (e.target) e.target.value = '';
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="border border-gray-300 rounded-md shadow-sm">
      <div className="flex items-center p-2 bg-gray-50 border-b rounded-t-md gap-1">
        <button type="button" onMouseDown={(e) => handleToolbarClick(e, () => execCmd('bold'))} className="p-2 rounded hover:bg-gray-200 font-bold">B</button>
        <button type="button" onMouseDown={(e) => handleToolbarClick(e, () => execCmd('italic'))} className="p-2 rounded hover:bg-gray-200 italic">I</button>
        <button type="button" onMouseDown={(e) => handleToolbarClick(e, () => execCmd('underline'))} className="p-2 rounded hover:bg-gray-200 underline">U</button>
        <button type="button" onMouseDown={(e) => handleToolbarClick(e, handleLink)} className="p-2 rounded hover:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" /></svg>
        </button>
        <input type="file" ref={imageInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
        <button type="button" onMouseDown={(e) => handleToolbarClick(e, () => imageInputRef.current?.click())} className="p-2 rounded hover:bg-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput} // Sync on blur to catch edge cases
        className="w-full p-3 min-h-[120px] focus:outline-none prose prose-sm max-w-none"
      />
    </div>
  );
};


const EditorPanel: React.FC<EditorPanelProps> = ({
  guideTitle,
  setGuideTitle,
  onFileSelect,
  sections,
  editingSection,
  onStartPinPlacement,
  onUpdateSection,
  onDeleteSection,
  setEditingSectionId,
  hasImage,
  onStartMovePin,
}) => {
  const handleSectionChange = (field: keyof Section, value: any) => {
    if (editingSection) {
      onUpdateSection({ ...editingSection, [field]: value });
    }
  };

  const handleDelete = () => {
    if (editingSection && window.confirm('Are you sure you want to delete this section?')) {
        onDeleteSection(editingSection.id);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="space-y-6">
        <div>
          <label htmlFor="guideTitle" className="block text-sm font-medium text-gray-700 mb-1">Guide Title</label>
          <input
            type="text"
            id="guideTitle"
            value={guideTitle}
            onChange={(e) => setGuideTitle(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
            <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700 mb-1">Upload Image or Guide</label>
            <input
                type="file"
                id="fileUpload"
                accept="image/*,.html"
                onChange={onFileSelect}
                className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100"
            />
        </div>
      </div>
      <hr className="my-6" />
      
      <div className="flex-grow flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Sections</h2>
            <button
                onClick={onStartPinPlacement}
                disabled={!hasImage}
                className="bg-indigo-100 text-indigo-700 font-bold py-2 px-3 rounded-lg hover:bg-indigo-200 transition-colors flex items-center gap-2 text-sm disabled:bg-gray-200 disabled:text-gray-500"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Add Section
            </button>
        </div>

        {editingSection ? (
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-bold text-gray-700">Editing Section</h3>
                <div>
                    <label htmlFor="sectionTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input type="text" id="sectionTitle" value={editingSection.title} onChange={(e) => handleSectionChange('title', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content / Notes</label>
                    <RichTextEditor value={editingSection.content} onChange={(value) => handleSectionChange('content', value)} />
                </div>
                <div>
                    <label htmlFor="sectionCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select id="sectionCategory" value={editingSection.categoryKey} onChange={(e) => handleSectionChange('categoryKey', e.target.value)} className="w-full border-gray-300 rounded-md shadow-sm">
                        {Object.entries(CATEGORIES).map(([key, { name }]) => (
                            <option key={key} value={key}>{name}</option>
                        ))}
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                    <button onClick={() => onStartMovePin(editingSection.id)} className="w-full bg-blue-100 text-blue-800 font-bold py-2 px-3 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center gap-2 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        Move Pin
                    </button>
                    <button onClick={handleDelete} className="w-full bg-red-100 text-red-800 font-bold py-2 px-3 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        Delete
                    </button>
                </div>
                <button onClick={() => setEditingSectionId(null)} className="w-full bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-lg hover:bg-gray-300">Done Editing</button>
            </div>
        ) : (
            <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                {sections.length > 0 ? sections.map(section => (
                    <div key={section.id} className="p-3 rounded-lg flex justify-between items-center bg-white border">
                        <div className="flex items-center gap-3">
                            <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: CATEGORIES[section.categoryKey].color }}></span>
                            <span className="font-medium text-gray-800 text-sm">{section.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setEditingSectionId(section.id)} className="text-gray-500 hover:text-indigo-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                            </button>
                            <button onClick={() => { if(window.confirm('Are you sure you want to delete this section?')) { onDeleteSection(section.id) }}} className="text-gray-500 hover:text-red-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-gray-500 py-10">
                        {hasImage ? "Click 'Add Section' to place a pin on the image." : "Upload an image or .html guide to start."}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default EditorPanel;