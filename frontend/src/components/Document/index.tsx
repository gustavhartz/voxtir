import { useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { FiEdit3 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

import {
  Document,
  useTrashDocumentMutation,
  useUpdateDocumentMutation,
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
  const [title, setTitle] = useState(props.document?.title ?? '');
  const [showDelete, setShowDelete] = useState(false);
  const { document, projectId, token, handleRefetch } = props;
  const navigate = useNavigate();

  const [updateDocument] = useUpdateDocumentMutation({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });
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

  const handleEditDocument = (_: React.MouseEvent) => {
    if (document?.id) {
      updateDocument({
        variables: {
          documentId: document?.id,
          title: title,
        },
      }).then(() => {
        setShowEdit(false);
        handleRefetch();
      });
    }
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

  const handleToggleShowEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEdit(!showEdit);
  };

  const navigateToDocument = (_: React.MouseEvent) => {
    if (document?.id && !isNotDoneAutomatic) {
      navigate(`/document/${document?.id}`);
    }
  };
  if (document === null) {
    return <div>Document does not exist.</div>;
  }

  if (showEdit) {
    return (
      <div
        className={`border-2 
      ${
        isNotDoneAutomatic
          ? 'bg-slate-50 !text-gray-600 cursor-not-allowed'
          : 'hover:scale-[1.01] hover:shadow-md cursor-pointer'
      }  border-slate-100
          shadow-sm text-gray-900 duration-500 transition-all w-full rounded-md flex flex-row justify-between items-center px-4 py-4 font-semibold`}
      >
        <div className="flex flex-col w-full mb-6">
          <span className="flex flex-row items-center mb-4">
            <label className="text-xl font-semibold text-black" htmlFor="name">
              Project title
            </label>
          </span>
          <input
            placeholder="Interview with John Doe"
            className={`px-2 py-2 text-gray-900 outline-gray-300 font-normal text-md outline rounded-md focus:outline-gray-400 focus:outline-2`}
            type="text"
            id="name"
            name="name"
            onChange={(e) => setTitle(e.currentTarget.value)}
            value={title}
          />
          <div className="flex flex-row items-end justify-end">
            <button
              onClick={handleToggleShowEdit}
              className="disabled:cursor-not-allowed w-48 bg-gray-600 hover:bg-gray-700 opacity-100 hover:black disabled:opacity-20 duration-500 transition-opacity py-2 mt-4 mr-2 rounded-lg text-white disabled:text-gray-300 font-medium"
            >
              Cancel
            </button>
            <button
              disabled={document?.title === title}
              type="submit"
              onClick={handleEditDocument}
              className="disabled:cursor-not-allowed w-64 bg-gray-900 hover:bg-gray-900 opacity-100 hover:black disabled:opacity-20 duration-500 transition-opacity py-2 mt-4 rounded-lg text-white disabled:text-gray-300 font-medium max-w-md"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div onClick={navigateToDocument} key={document?.id}>
      {showDelete && (
        <div className="flex relative z-[9999] flex-col justify-center items-center h-28 -mb-28 bg-opacity-70 rounded-md bg-gray-900 w-inherit">
          <span className="text-ellipsis overflow-hidden whitespace-nowrap text-white font-semibold text-md">
            Are you sure you want to delete
          </span>
          <span className="text-ellipsis overflow-hidden whitespace-nowrap text-neutral-200 -mt-1 mb-2 font-semibold text-md">
            {document.title}?
          </span>
          <div className="flex flex-row justify-center items-center space-x-4">
            <button
              onClick={handleDeleteDocument}
              className="bg-red-500 transiiton-colors hover:bg-red-600 px-4 py-1 font-medium text-white rounded-lg"
            >
              Yes
            </button>
            <button
              onClick={handleToggleDelete}
              className="bg-white hover:bg-neutral-200 px-4 py-1 font-medium text-gray-900 rounded-lg"
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
                onClick={handleToggleShowEdit}
                className="rounded-bl-md rounded-tl-md roundedbg-white pointer-events-auto flex flex-row items-center p-2 justify-between text-md font-semibold hover:bg-gray-100 transition-all cursor-pointer"
              >
                <FiEdit3 size={20} />
              </div>
              <button
                disabled={showEdit}
                onClick={handleToggleDelete}
                className="rounded-tr-md disabled:bg-gray-400 disabled:text-gray-500/60 rounded-br-md bg-white flex flex-row items-center p-2 justify-between text-md font-semibold hover:bg-gray-100 transition-all cursor-pointer"
              >
                <AiOutlineDelete size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Document;
