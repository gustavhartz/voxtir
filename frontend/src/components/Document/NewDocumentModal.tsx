import React, { useState } from 'react';

import {
  useCreateDocumentMutation,
  useUploadAudioFileMutation,
} from '../../graphql/generated/graphql';
interface DocumentCreationModalProps {
  token: string;
  defaultProjectId: string;
  onClose: () => void;
}

const DocumentCreationModal: React.FC<DocumentCreationModalProps> = ({
  token,
  defaultProjectId,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');
  const [speakerCount, setSpeakerCount] = useState<number | ''>('');
  const [transcriptionType, setTranscriptionType] = useState<
    'AUTOMATIC' | 'MANUAL'
  >('MANUAL');

  const [createDocument] = useCreateDocumentMutation({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });
  const [uploadAudioFile] = useUploadAudioFileMutation({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (
      selectedFile === null ||
      !language ||
      !documentName ||
      speakerCount === ''
    ) {
      // You can show an error message here.
      console.error('New document form failed to submit');
      return;
    }

    // Send formData to your backend API using fetch or Axios.
    // Example: fetch('/api/upload', { method: 'POST', body: formData });
    const documentResponse = await createDocument({
      variables: {
        projectId: defaultProjectId,
        title: documentName,
        transcriptionType: transcriptionType,
        language: language,
        speakerCount: speakerCount,
      },
    });

    const documentId = documentResponse.data?.createDocument;

    if (!documentId || documentResponse.errors) {
      console.error('Did not work');
      return;
    }
    // upload audio

    const audioUploadResponse = await uploadAudioFile({
      variables: {
        fileInput: {
          docType: 'esf',
          file: selectedFile,
        },
        projectId: defaultProjectId,
        documentId: documentId,
        contentLength: selectedFile.size,
      },
    });
    console.log(audioUploadResponse.data);
    console.log(audioUploadResponse.errors);
    if (audioUploadResponse.errors) {
      console.error(audioUploadResponse.errors);
    }

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="cursor-pointer fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-black bg-opacity-50 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="cursor-default bg-white p-6 sm:rounded-lg shadow-lg w-full h-full sm:w-2/3 md:w-3/5 sm:h-fit relative z-60"
      >
        <h2 className="text-3xl font-bold mb-4">Create a new document</h2>
        <div
          className="flex flex-col justify-center items-center border-dashed border-2 border-gray-300 p-4 mb-4 cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
        >
          {selectedFile ? (
            <div>
              <p>Selected File: {selectedFile.name}</p>
              <button onClick={() => setSelectedFile(null)}>Remove</button>
            </div>
          ) : (
            <p className="text-center mb-3 text-gray-500 text-sm flex flex-col">
              Drag and drop an audio file{' '}
              <span className="w-full font-bold text-sm">-- or --</span>
            </p>
          )}
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileInputChange}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="bg-gray-100 hover:bg-gray-200 transition-colors text-center text-gray-900 font-semibold py-1 px-4 rounded cursor-pointer"
          >
            Browse
          </label>
        </div>
        <div className="mt-8">
          <label htmlFor="documentName" className="block font-semibold">
            Document Name
          </label>
          <p className="text-gray-400 pb-2">The name of the document.</p>
          <input
            placeholder="Interview with John Doe"
            type="text"
            id="documentName"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="w-full mt-2 px-2 py-2 text-gray-900 outline-gray-300 font-normal text-md outline rounded-md focus:outline-gray-400 focus:outline-2"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="language" className="block font-semibold">
            Language
          </label>
          <p className="text-gray-400 pb-2">
            Choose the target audio transcription language.
          </p>
          <input
            placeholder="Language in audio"
            type="text"
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full mt-2 px-2 py-2 text-gray-900 outline-gray-300 font-normal text-md outline rounded-md focus:outline-gray-400 focus:outline-2"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="speakerCount" className="block font-semibold">
            Speaker Count
          </label>
          <p className="text-gray-400 pb-2">
            The amount of people speaking in the audio.
          </p>
          <input
            placeholder="Number of speakers"
            type="number"
            id="speakerCount"
            value={speakerCount}
            onChange={(e) => setSpeakerCount(parseInt(e.target.value) || '')}
            className="w-full mt-2 px-2 py-2 text-gray-900 outline-gray-300 font-normal text-md outline rounded-md focus:outline-gray-400 focus:outline-2"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="transcriptionType" className="block font-semibold">
            Transcription Type:
          </label>
          <p className="text-gray-400 pb-2">
            Choose whether you want to automatically make the transcription or
            manually.
          </p>
          <select
            id="transcriptionType"
            value={transcriptionType}
            onChange={(e) => {
              if (
                e.currentTarget.value === 'AUTOMATIC' ||
                e.currentTarget.value === 'MANUAL'
              ) {
                setTranscriptionType(e.currentTarget.value);
              }
            }}
            className="h-10 mt-2 w-full rounded border-r-8 border-transparent font-normal px-4 text-md outline outline-gray-300 focus:outline-gray-400 focus:outline-2"
          >
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
        <button
          onClick={onClose}
          className="mt-6 bg-gray-200 text-gray-900 mr-2 py-2 px-4 rounded"
        >
          Close
        </button>
        <button
          onClick={handleSubmit}
          className="mt-6 bg-gray-900 text-white py-2 px-4 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default DocumentCreationModal;
