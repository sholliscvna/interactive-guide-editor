import React from 'react';
import { Section } from '../types';
import { CATEGORIES } from '../constants';

interface PreviewPanelProps {
  image: string | null;
  sections: Section[];
  activeSection: Section | null;
  isPlacingPin: boolean;
  onImageClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onPinClick: (id: string) => void;
  isMovingPinId: string | null;
  statusMessage: string | null;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  image,
  sections,
  activeSection,
  isPlacingPin,
  onImageClick,
  onPinClick,
  isMovingPinId,
  statusMessage,
}) => {
  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 bg-gray-100">
      <div className="md:col-span-2 p-4 flex items-center justify-center bg-slate-200 h-full">
        {image ? (
          <div
            className={`relative w-full max-w-full max-h-full aspect-auto ${isPlacingPin ? 'cursor-crosshair' : ''}`}
            onClick={onImageClick}
          >
            {statusMessage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 pointer-events-none rounded-md">
                    <p className="text-white text-lg font-bold bg-black bg-opacity-70 px-4 py-2 rounded-lg">{statusMessage}</p>
                </div>
            )}
            <img src={image} alt="Guide" className="max-w-full max-h-full object-contain mx-auto shadow-lg" />
            {sections.map(section => (
              <button
                key={section.id}
                className={`absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 focus:outline-none transition-all duration-300 ease-in-out flex items-center justify-center shadow-lg hover:scale-125
                  ${activeSection?.id === section.id ? 'ring-4 ring-offset-2 ring-white scale-125' : ''}
                  ${isMovingPinId === section.id ? 'animate-pulse ring-4 ring-offset-2 ring-blue-400' : ''}`}
                style={{
                  left: `${section.x}%`,
                  top: `${section.y}%`,
                  backgroundColor: CATEGORIES[section.categoryKey].color,
                  borderColor: CATEGORIES[section.categoryKey].color
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onPinClick(section.id);
                }}
              >
                  <span className="text-white text-xs font-bold">{sections.indexOf(section) + 1}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="mt-2 text-sm font-semibold text-gray-900">No Image or Guide Uploaded</p>
            <p className="mt-1 text-sm text-gray-500">Please upload an image or .html guide in the editor panel to begin.</p>
          </div>
        )}
      </div>

      <div className="md:col-span-1 p-6 bg-white overflow-y-auto">
        {activeSection ? (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 pb-3 border-b-4 mb-4" style={{ borderColor: CATEGORIES[activeSection.categoryKey].color }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0" style={{ backgroundColor: CATEGORIES[activeSection.categoryKey].color }}>
                    {sections.findIndex(s => s.id === activeSection.id) + 1}
                </div>
                <h2 className="text-xl font-bold" style={{ color: CATEGORIES[activeSection.categoryKey].color }}>
                  {activeSection.title}
                </h2>
            </div>
            <div 
                className="mt-4 prose prose-sm max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: activeSection.content }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <svg className="w-16 h-16 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <h3 className="text-lg font-semibold">Select a Section</h3>
            <p className="mt-1">Click on a numbered pin on the image to see its details.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;