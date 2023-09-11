import { useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { FiEdit3 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import {
  Document,
  useTrashDocumentMutation,
} from '../../graphql/generated/graphql';
import TranscriptionStatus from '../TranscriptionStatus';

interface DocumentProps {
  token: string;
  document: Omit<Document, 'projectId'> | null;
  projectId: string | undefined;
  handleRefetch: () => void;
}

const Document: React.FC<DocumentProps> = (props) => {
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { document, projectId, token, handleRefetch } = props;
  const navigate = useNavigate();

  const [trashDocument] = useTrashDocumentMutation({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });
  const isNotDoneAutomatic =
    document?.transcriptionType === 'AUTOMATIC' &&
    document?.transcriptionStatus !== 'DONE';

  const handleEditDocument = (e: React.MouseEvent) => {
    console.log('Edit document');
  };

  const handleDeleteDocument = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(document?.id, projectId);
    console.log('triggered');
    if (document?.id && projectId) {
      trashDocument({
        variables: {
          documentId: document?.id,
          projectId: projectId,
        },
      }).then(() => {
        handleRefetch();
      });
    }
  };

  const handleToggleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDelete(!showDelete);
  };

  const navigateToDocument = (e: React.MouseEvent) => {
    if (document?.id && !isNotDoneAutomatic) {
      navigate(`/document/${document?.id}`);
    }
  };
  if (document === null) {
    return <div>Document does not exist.</div>;
  }

  return (
    <div onClick={navigateToDocument} key={document?.id}>
      {showDelete && (
        <div className="flex relative z-[9999] flex-col justify-center items-center relative h-28 -mb-28 bg-opacity-70 rounded-md bg-gray-900 w-inherit">
          <span className="text-ellipsis overflow-hidden mb-2 whitespace-nowrap text-white font-semibold text-lg">
            Are you sure you want to delete {document.title}?
          </span>
          <div className="flex flex-row items-center space-x-4">
            <button
              onClick={handleDeleteDocument}
              className="bg-red-500 px-4 py-1 font-medium text-white rounded-lg"
            >
              Yes
            </button>
            <button
              onClick={handleToggleDelete}
              className="bg-white px-4 py-1 font-medium text-gray-900 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      <div
        className={`border-2 
          ${
            isNotDoneAutomatic
              ? 'bg-slate-50 !text-gray-600 cursor-not-allowed'
              : 'hover:scale-[1.01] hover:shadow-md cursor-pointer'
          }  border-slate-100
              shadow-sm text-gray-900 duration-500 transition-all w-full rounded-md flex flex-row justify-between items-center px-4 py-4 font-semibold`}
      >
        <div className="flex flex-row items-center w-full">
          <TranscriptionStatus
            status={document?.transcriptionStatus}
            type={document?.transcriptionType}
          />
          <span className="flex flex-col justify-startw-full text-start text-lg font-medium text-ellipsis overflow-hidden whitespace-nowrap">
            {document?.title}
            {document?.description}
            <span className="text-xs text-gray-400 ml-0.2">
              {document?.transcriptionStatus === 'DONE'
                ? 'COMPLETED'
                : document?.transcriptionStatus}
            </span>
          </span>
        </div>
        {document?.lastModified && (
          <div className="text-end text-md w-full flex flex-col items-end">
            {new Date(document?.lastModified).toDateString()}
            <div className="flex flex-row mt-2 shadow-md rounded-md">
              <div
                onClick={handleEditDocument}
                className="rounded-bl-md rounded-tl-md roundedbg-white pointer-events-auto flex flex-row items-center p-2 justify-between text-md font-semibold hover:bg-gray-100 transition-all cursor-pointer"
              >
                <FiEdit3 size={20} />
              </div>
              <div
                onClick={handleToggleDelete}
                className="rounded-tr-md rounded-br-md bg-white flex flex-row items-center p-2 justify-between text-md font-semibold hover:bg-gray-100 transition-all cursor-pointer"
              >
                <AiOutlineDelete size={20} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Document;
