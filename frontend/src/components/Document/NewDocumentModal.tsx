import axios, { AxiosRequestConfig } from 'axios';
import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { BsFillFileEarmarkMusicFill } from 'react-icons/bs';
import { toast, ToastContainer } from 'react-toastify';

import {
  useCreateDocumentMutation,
  useSupportedLanguagesQuery,
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
  refetchDocuments,
}) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const supportedAudioFileTypes = [
    'audio/aac',
    'audio/mpeg',
    'audio/wav',
    'audio/aiff',
    'audio/flac',
    'audio/alac',
    'audio/mp4',
    'audio/x-caf',
    'audio/ac3',
  ];
  const maxSizeInMB = 2000; // Specify the max size in MB here
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
    try {
      const documentResponse = await createDocument({
        variables: {
          projectId: defaultProjectId,
          title: documentName,
          transcriptionType: transcriptionType,
          language: language,
          speakerCount: speakerCount,
          mimeType: file.type,
        },
      });
      const documentId = documentResponse.data?.createDocument;

      if (
        !documentId ||
        documentResponse.errors ||
        !documentResponse.data?.createDocument.url
      ) {
        toast(`${documentResponse.errors}`, {
          type: 'error',
          toastId: 'createDocumentFailure',
          position: 'bottom-right',
        });
        return;
      }
      const config: AxiosRequestConfig = {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent?.total ?? 0)
          );
          console.log(`Upload Progress: ${progress}%`);
          // Update progress bar or UI with the progress
          setUploadProgress(progress);
        },
        headers: {
          'Content-Type': file.type,
        },
      };
      await axios.put(documentResponse.data?.createDocument.url, file, config);

      onClose();
      refetchDocuments();
    } catch (err) {
      setUploadProgress(0);
      console.error(err);
      toast(`${err}`, {
        type: 'error',
        toastId: 'createDocumentFailure',
        position: 'bottom-right',
      });
      throw err;
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="p-6 sm:rounded-lg w-full md:w-4/5 lg:w-3/5 xl:w-2/5 max-h-full overflow-auto">
          <div
            onClick={(e) => e.stopPropagation()}
            className="cursor-default overflow-y-scroll bg-white p-6 sm:rounded-lg shadow-lg !w-full h-full sm:w-2/3 md:w-3/5 sm:h-fit relative z-60"
          >
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4">
                <label className="block font-semibold">Upload Progress</label>
                <div className="relative pt-1">
                  <progress
                    className="w-full h-2 bg-gray-200 rounded-sm"
                    value={uploadProgress}
                    max="100"
                  />
                  <span className="text-xs">{uploadProgress}%</span>
                </div>
              </div>
            )}
            {uploadProgress === 0 && (
              <div>
                <h2 className="text-3xl font-bold mb-4">
                  Create a new document
                </h2>
                <label className="block font-semibold">Selected File</label>
                <p className="text-gray-400 pb-4">The name of the document.</p>
                {fileUrl && (
                  <div className="bg-gray-100 rounded-md">
                    <div className="py-4 flex flex-row items-center px-4">
                      <BsFillFileEarmarkMusicFill size={40} />
                      <div className="flex flex-row ml-4 justify-between w-full items-center">
                        <div className="flex flex-col">
                          <span className="text-xl font-medium">
                            {fileName}
                          </span>
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
                  <p className="text-gray-400 pb-2">
                    The name of the document.
                  </p>
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
                    onChange={(e) =>
                      setSpeakerCount(parseInt(e.target.value) || '')
                    }
                    className="w-full mt-2 px-2 py-2 text-gray-900 outline-gray-300 font-normal text-md outline rounded-md focus:outline-gray-400 focus:outline-2"
                  />
                </div>
                <div className="mt-4">
                  <label
                    htmlFor="transcriptionType"
                    className="block font-semibold"
                  >
                    Transcription Type
                  </label>
                  <p className="text-gray-400 pb-2">
                    Choose whether you want to automatically make the
                    transcription or manually.
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
                  {loading ? 'Cancel' : 'Close'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    loading ||
                    !fileUrl ||
                    !language ||
                    !documentName ||
                    !speakerCount
                  }
                  className="mt-6 disabled:animate-pulse bg-gray-900 disabled:bg-gray-400 text-white py-2 px-4 rounded"
                >
                  {loading ? 'Loading...' : 'Submit'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentCreationModal;
