import React, { useState } from 'react';
import { Section } from './types';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import { generateHtmlForDownload } from './services/htmlGenerator';

function App() {
  const [guideTitle, setGuideTitle] = useState<string>('My Interactive Guide');
  const [image, setImage] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isPlacingPin, setIsPlacingPin] = useState<boolean>(false);
  const [isMovingPinId, setIsMovingPinId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            setImage(event.target?.result as string);
            setSections([]);
            setGuideTitle('My Interactive Guide');
            setActiveSectionId(null);
            setEditingSectionId(null);
        };
        reader.readAsDataURL(file);
    } else if (file.type === 'text/html') {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const htmlString = event.target?.result as string;
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlString, 'text/html');

                const title = doc.querySelector('title')?.textContent || 'Imported Guide';
                const imgSrc = doc.querySelector('#image-wrapper img')?.getAttribute('src');
                if (!imgSrc) throw new Error('Could not find image in HTML file.');

                const scriptContent = doc.querySelector('script')?.textContent;
                if (!scriptContent) throw new Error('Could not find script with section data.');

                const sectionsMatch = scriptContent.match(/const sections = (\[.*?\]);/s);
                if (!sectionsMatch || !sectionsMatch[1]) throw new Error('Could not parse sections from HTML file.');
                
                const sectionsData = JSON.parse(sectionsMatch[1]);

                setGuideTitle(title);
                setImage(imgSrc);
                setSections(sectionsData);
                setActiveSectionId(null);
                setEditingSectionId(null);
                
            } catch (error) {
                console.error("Error parsing HTML file:", error);
                alert("Could not parse the uploaded HTML file. Please make sure it's a valid guide created with this tool.");
            }
        };
        reader.readAsText(file);
    } else {
        alert("Unsupported file type. Please upload an image or a previously saved .html guide.");
    }
    e.target.value = ''; // Reset file input
  };

  const startPinPlacement = () => {
    setIsPlacingPin(true);
    setEditingSectionId(null);
    setStatusMessage('Click on the image to place the new pin.');
  };

  const handleStartMovePin = (id: string) => {
    setIsMovingPinId(id);
    setEditingSectionId(null);
    setStatusMessage('Click on the image to set the new location for the pin.');
  };
  
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (isPlacingPin) {
        const newSection: Section = {
          id: `section-${Date.now()}`,
          title: 'New Section',
          content: 'Add your detailed notes here.',
          categoryKey: 'NOTES_OTHER',
          x,
          y,
        };

        setSections(prev => [...prev, newSection]);
        setActiveSectionId(newSection.id);
        setEditingSectionId(newSection.id);
        setIsPlacingPin(false);
        setStatusMessage(null);
    } else if (isMovingPinId) {
        setSections(prev => prev.map(s => s.id === isMovingPinId ? { ...s, x, y } : s));
        setEditingSectionId(isMovingPinId); // Re-open editor
        setIsMovingPinId(null);
        setStatusMessage(null);
    }
  };

  const handleUpdateSection = (updatedSection: Section) => {
    setSections(prev => prev.map(s => s.id === updatedSection.id ? updatedSection : s));
  };
  
  const handleDeleteSection = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
    if (activeSectionId === id) setActiveSectionId(null);
    if (editingSectionId === id) setEditingSectionId(null);
  };

  const handleDownload = () => {
    if (!image) {
      alert("Please upload an image or guide first.");
      return;
    }
    const htmlContent = generateHtmlForDownload(guideTitle, image, sections);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${guideTitle.replace(/\s+/g, '_').toLowerCase()}_guide.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activeSection = sections.find(s => s.id === activeSectionId) || null;
  const editingSection = sections.find(s => s.id === editingSectionId) || null;

  return (
    <div className="flex flex-col h-screen font-sans">
      <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 1 3.09-3.09L12 5.25l2.846.813a4.5 4.5 0 0 1 3.09 3.09L21.75 12l-2.846.813a4.5 4.5 0 0 1-3.09 3.09L12 18.75l-2.187-2.846Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.244 2.25h3.516v3.516h-3.516V2.25Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.249 18.75h3.516v3.516H8.249v-3.516Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 2.25h3.516v3.516H2.25V2.25Z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-800">Interactive Guide Creator</h1>
        </div>
        <button
          onClick={handleDownload}
          className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:bg-gray-400"
          disabled={!image}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download HTML
        </button>
      </header>
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 overflow-hidden">
        <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-xl shadow-lg overflow-y-auto">
          <EditorPanel
            guideTitle={guideTitle}
            setGuideTitle={setGuideTitle}
            onFileSelect={handleFileUpload}
            sections={sections}
            editingSection={editingSection}
            onStartPinPlacement={startPinPlacement}
            onUpdateSection={handleUpdateSection}
            onDeleteSection={handleDeleteSection}
            setEditingSectionId={setEditingSectionId}
            hasImage={!!image}
            onStartMovePin={handleStartMovePin}
          />
        </div>
        <div className="lg:col-span-8 xl:col-span-9 bg-white rounded-xl shadow-lg overflow-hidden">
           <PreviewPanel
             image={image}
             sections={sections}
             activeSection={activeSection}
             isPlacingPin={isPlacingPin || !!isMovingPinId}
             onImageClick={handleImageClick}
             onPinClick={setActiveSectionId}
             isMovingPinId={isMovingPinId}
             statusMessage={statusMessage}
           />
        </div>
      </main>
    </div>
  );
}

export default App;