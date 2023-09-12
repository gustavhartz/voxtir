import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { BsFillFileEarmarkMusicFill } from 'react-icons/bs';

import {
  useCreateDocumentMutation,
  useSupportedLanguagesQuery,
  useUploadAudioFileMutation,
} from '../../graphql/generated/graphql';
import useFileUpload from '../../hook/useFileUpload';

interface DocumentCreationModalProps {
  token: string;
  defaultProjectId: string;
  onClose: () => void;
  refetchDocuments: () => void;
}

const DocumentCreationModal: React.FC<DocumentCreationModalProps> = ({
  token,
  defaultProjectId,
  onClose,
  refetchDocuments
}) => {
  const supportedAudioFileTypes = [
    'audio/mpeg', // MP3 audio
    'audio/ogg', // Ogg Vorbis audio
    'audio/wav', // Waveform Audio File Format
    'audio/aac', // Advanced Audio Coding
    'audio/webm', // WebM audio
    'audio/x-m4a', // Apple audio
  ];
  const maxSizeInMB = 100; // Specify the max size in MB here
  const { fileUrl, file, fileName, fileSize, handleFileChange } = useFileUpload(
    supportedAudioFileTypes,
    maxSizeInMB
  );
  const [language, setLanguage] = useState<string>('');
  const [documentName, setDocumentName] = useState<string>('');
  const [speakerCount, setSpeakerCount] = useState<number | ''>('');
  const [transcriptionType, setTranscriptionType] = useState<
    'AUTOMATIC' | 'MANUAL'
  >('MANUAL');

  const { data } = useSupportedLanguagesQuery({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  const [createDocument, { loading }] = useCreateDocumentMutation({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });
  const [uploadAudioFile, { loading: audioLoading }] =
    useUploadAudioFileMutation({
      context: {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleSubmit = async () => {
    if (
      fileUrl === null ||
      !language ||
      !documentName ||
      speakerCount === '' ||
      file === null ||
      !fileSize
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

    await uploadAudioFile({
      variables: {
        fileInput: {
          docType: 'esf',
          file: file,
        },
        projectId: defaultProjectId,
        documentId: documentId,
        contentLength: file.size,
      },
    })
      .then((res) => {
        console.log(res.data);
        console.log(res.errors);
        refetchDocuments();
        onClose();
      })
      .catch((err) => {
        console.error(err);
      });

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
        <label className="block font-semibold">Selected File</label>
        <p className="text-gray-400 pb-4">The name of the document.</p>
        {fileUrl && (
          <div className="bg-gray-100 rounded-md">
            <div className="py-4 flex flex-row items-center px-4">
              <BsFillFileEarmarkMusicFill size={40} />
              <div className="flex flex-row ml-4 justify-between w-full items-center">
                <div className="flex flex-col">
                  <span className="text-xl font-medium">{fileName}</span>
                  {fileSize && <span>{Math.floor(fileSize)}MB</span>}
                </div>
                <button
                  onClick={() => handleFileChange(null)}
                  className="bg-gray-900 hover:bg-gray-500 group !duration-[1000ms] transition-all font-medium text-white py-2 px-2 rounded-md"
                >
                  <AiOutlineClose size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
        {!fileUrl && (
          <div
            className="justify-center grid grid-cols-1 hover:bg-gray-50 border-dashed border-4 border-gray-300 rounded-lg p-4 mb-4 cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            <p className="text-center mb-3 flex flex-col text-gray-900 font-semibold text-md">
              Drag and drop an audio file{' '}
              <span className="w-full font-bold text-md py-4">or</span>
            </p>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileInputChange}
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="bg-gray-100 mx-28 hover:bg-gray-200 transition-colors text-center text-gray-900 font-semibold py-1 px-4 rounded cursor-pointer"
            >
              Browse
            </label>
          </div>
        )}
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
          <select
            defaultValue="none"
            onChange={(e) => setLanguage(e.currentTarget.value)}
            className="h-10 mt-2 mb-1 w-full rounded border-r-8 border-transparent font-normal px-1 text-md outline outline-gray-300 focus:outline-gray-400 focus:outline-2"
          >
            <option key="none" value="none" disabled>
              Select a language
            </option>
            {data?.supportedLanguages?.map((language) => {
              if (language?.languageName) {
                return (
                  <option
                    key={language?.languageName}
                    value={language?.languageName}
                  >
                    {language?.languageName.charAt(0).toUpperCase() +
                      language?.languageName.slice(1)}
                  </option>
                );
              }
            })}
          </select>
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
            Transcription Type
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
            className="h-10 mt-2 w-full rounded border-r-8 border-transparent font-normal px-1 text-md outline outline-gray-300 focus:outline-gray-400 focus:outline-2"
          >
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
          </select>
        </div>
        <button
          onClick={onClose}
          className="mt-6 bg-gray-200 text-gray-900 mr-2 py-2 px-4 rounded"
        >
          {loading || audioLoading ? 'Cancel' : 'Close'}
        </button>
        <button
          onClick={handleSubmit}
          disabled={
            loading ||
            audioLoading ||
            !fileUrl ||
            !language ||
            !documentName ||
            !speakerCount
          }
          className="mt-6 disabled:animate-pulse bg-gray-900 disabled:bg-gray-400 text-white py-2 px-4 rounded"
        >
          {loading || audioLoading ? 'Loading...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default DocumentCreationModal;
