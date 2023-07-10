import React, { useState } from 'react';
import useFileUpload from '../../hook/useFileUpload';
import { useDispatch } from 'react-redux';
import { setTrack } from '../../state/track';
import { getEditorInstance } from '../Editor';

const Import: React.FC = () => {
  const [HTMLInput, setHTMLInput] = React.useState('');
  const supportedAudioFileTypes = [
    'audio/mpeg', // MP3 audio
    'audio/ogg', // Ogg Vorbis audio
    'audio/wav', // Waveform Audio File Format
    'audio/aac', // Advanced Audio Coding
    'audio/webm', // WebM audio
    'audio/x-m4a', // Apple audio
  ];
  const maxSizeInMB = 100; // Specify the max size in MB here
  const dispatch = useDispatch();
  const [isDragOver, setIsDragOver] = useState(false);
  const { error, fileUrl, fileName, fileSize, fileType, handleFileChange } =
    useFileUpload(supportedAudioFileTypes, maxSizeInMB);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event?.dataTransfer?.files[0];
    handleFileChange(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const uploadFileToState = () => {
    if (fileUrl && fileName && fileSize && fileType) {
      dispatch(
        setTrack({
          src: fileUrl,
          fileName: fileName,
          fileSize: fileSize,
          fileType: fileType,
        })
      );
    }
  };

  const handleUploadContent = () => {
    let editor = getEditorInstance();
    if (!editor) {
      console.error('Editor instance not found');
      return;
    }
    editor.commands.setContent(HTMLInput);
  };

  return (
    <>
      <h1 className="text-lg font-semibold mb-2">Upload Audio</h1>
      <div
        className={`drop-zone ${
          isDragOver
            ? 'p-4 border-dotted border-2 border-blue-200 bg-gray-100 w-96'
            : 'p-4 border-dotted border-2 border-gray-300 flex justify-center flex-col w-96'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {error && (
          <p>
            {error} We support the following file types:{' '}
            {supportedAudioFileTypes.join(', ')}
          </p>
        )}
        {fileUrl && fileName ? (
          <>
            <p>Selected file: {fileName}</p>
          </>
        ) : (
          <>
            <p className="w-full text-center font-medium text-gray-400">
              Drag and drop audio file
            </p>
          </>
        )}
      </div>
      <button
        onClick={uploadFileToState}
        disabled={!fileUrl}
        className="mt-2 disabled:bg-gray-300 disabled:text-gray-400 bg-blue-500 hover:bg-blue-600 text-white h-10 px-2 rounded-md font-bold mr-2"
      >
        Upload track
      </button>
      {fileUrl && (
        <button
          onClick={() => handleFileChange(null)}
          className="px-2 h-10 mr-2 font-bold rounded-md bg-red-500 hover:bg-red-600 text-white py-1 my-2"
        >
          Undo
        </button>
      )}
      <h1 className="text-lg font-semibold mb-2 mt-4">Upload HTML to Editor</h1>
      <textarea
        value={HTMLInput}
        onChange={(e) => setHTMLInput(e.currentTarget.value)}
        placeholder="Paste HTML into here or write."
        className="w-full min-h-fit bg-slate-100/50 p-2 border-dotted border-2"
      />
      <button
        className="disabled:bg-gray-300 disabled:text-gray-400 bg-blue-500 hover:bg-blue-600 text-white h-10 px-2 rounded-md font-bold mr-2"
        disabled={HTMLInput.length === 0}
        onClick={handleUploadContent}
      >
        Upload HTML
      </button>
    </>
  );
};

export default Import;
