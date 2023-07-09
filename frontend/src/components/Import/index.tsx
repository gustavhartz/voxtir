import React, { useState } from 'react';
import useFileUpload from '../../hook/useFileUpload';
import { useDispatch } from 'react-redux';
import { setSrc } from '../../state/track';
import { toggleModal } from '../../state/track';
import { useAppSelector } from '../../hooks';
import { addNewContent, removeNewContent } from '../../state/track';
const Import: React.FC = () => {
  const { newContent } = useAppSelector((state) => state.track);
  const [HTMLInput, setHTMLInput] = React.useState("");
  const supportedAudioFileTypes = [
    'audio/mpeg',        // MP3 audio
    'audio/ogg',         // Ogg Vorbis audio
    'audio/wav',         // Waveform Audio File Format
    'audio/aac',         // Advanced Audio Coding
    'audio/webm',        // WebM audio
  ];
  const maxSizeInMB = 25; // Specify the max size in MB here
  const dispatch = useDispatch();
  const [isDragOver, setIsDragOver] = useState(false);
  const { file, error, handleFileChange } = useFileUpload(supportedAudioFileTypes, maxSizeInMB);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer && event.dataTransfer.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    handleFileChange(file);
  };

  const uploadFileToState = () => {
    if (file) {
      dispatch(setSrc(file))
    }
  }
  
  const handleUploadContent = () => {
    if (HTMLInput !== newContent) {
      addNewContent(HTMLInput);
    }
  }
  return (
    <>
      <h1 className="text-lg font-semibold mb-2">Upload Audio</h1>
      <div
        className={`drop-zone ${isDragOver ? 'p-4 border-dotted border-2 border-blue-200 bg-gray-100 w-96' : 'p-4 border-dotted border-2 border-gray-300 flex justify-center flex-col w-96'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {error && <p>{error} We support the following file types: {supportedAudioFileTypes.join(', ')}</p>}
        {file ? (
          <>
            <p>Selected file: {file.name}</p>
          </>
        ) : (
          <>
            <p className="w-full text-center font-medium text-gray-400">Drag and drop audio file</p>
          </>
        )}
      </div>
      <button onClick={uploadFileToState} disabled={!file} className="mt-2 disabled:bg-gray-300 disabled:text-gray-400 bg-blue-500 hover:bg-blue-600 text-white h-10 px-2 rounded-md font-bold mr-2">Upload track</button>
      {file && <button onClick={() => handleFileChange(null)} className="px-2 h-10 mr-2 font-bold rounded-md bg-red-500 hover:bg-red-600 text-white py-1 my-2">Undo</button>}
      <h1 className="text-lg font-semibold mb-2 mt-4">Upload HTML to Editor</h1>
      <textarea value={HTMLInput} onChange={(e) => setHTMLInput(e.currentTarget.value)} placeholder="Paste HTML into here or write." className="w-full min-h-fit bg-slate-100/50 p-2 border-dotted border-2"/>
      <button className="disabled:bg-gray-300 disabled:text-gray-400 bg-blue-500 hover:bg-blue-600 text-white h-10 px-2 rounded-md font-bold mr-2" disabled={HTMLInput === newContent || HTMLInput.length === 0} onClick={handleUploadContent}>Upload HTML</button>
    </>
  );
};

export default Import;
