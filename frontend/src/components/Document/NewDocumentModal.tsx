import React, { useState } from 'react';

import {
  useCreateDocumentMutation,
  useUploadAudioFileMutation,
} from '../../graphql/generated/graphql';

interface DocumentCreationModalProps {
  token: string;
  defaultProjectId: string;
}

const DocumentCreationModal: React.FC<DocumentCreationModalProps> = ({
  token,
  defaultProjectId,
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
        projectId: '78d05d3f-9c76-43ec-a30e-bf95013028b6',
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
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Create a new document</h2>
        <div
          className="border-dashed border-2 border-gray-300 p-4 mb-4 cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleFileDrop}
        >
          {selectedFile ? (
            <div>
              <p>Selected File: {selectedFile.name}</p>
              <button onClick={() => setSelectedFile(null)}>Remove</button>
            </div>
          ) : (
            <p>Drag and drop an audio file here or click to browse.</p>
          )}
        </div>
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileInputChange}
          className="hidden"
          id="fileInput"
        />
        <label
          htmlFor="fileInput"
          className="bg-blue-500 text-white py-2 px-4 rounded cursor-pointer"
        >
          Browse
        </label>
        <div className="mt-4">
          <label htmlFor="documentName" className="block font-semibold">
            Document Name:
          </label>
          <input
            type="text"
            id="documentName"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className="w-full border border-gray-300 rounded py-1 px-2"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="language" className="block font-semibold">
            Language:
          </label>
          <input
            type="text"
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border border-gray-300 rounded py-1 px-2"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="speakerCount" className="block font-semibold">
            Speaker Count:
          </label>
          <input
            type="number"
            id="speakerCount"
            value={speakerCount}
            onChange={(e) => setSpeakerCount(parseInt(e.target.value) || '')}
            className="w-full border border-gray-300 rounded py-1 px-2"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="transcriptionType" className="block font-semibold">
            Transcription Type:
          </label>
          <select
            id="transcriptionType"
            value={transcriptionType}
            onChange={(e) => {
              if (
                e.target.value === 'AUTOMATIC' ||
                e.target.value === 'MANUAL'
              ) {
                setTranscriptionType(e.target.value);
              }
            }}
            className="w-full border border-gray-300 rounded py-1 px-2"
          >
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </select>
        </div>
        <button
          onClick={handleSubmit}
          className="mt-6 bg-blue-500 text-white py-2 px-4 rounded"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default DocumentCreationModal;
