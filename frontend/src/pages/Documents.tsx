import { useEffect, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { CgFileDocument } from 'react-icons/cg';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import withAccessToken from '../components/Auth/with-access-token';
import DocumentCreationModal from '../components/Document/NewDocumentModal';
import { useProjectsQuery } from '../graphql/generated/graphql';
import { useAppDispatch } from '../hooks';
import { setLatestProject } from '../state/client';

const Documents = ({ token }: { token: string }) => {
  const { data, loading, error } = useProjectsQuery({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });
  const dispatch = useAppDispatch();
  const projectID = useParams().projectID;
  const project = data?.projects?.find((project) => project?.id === projectID);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (project && projectID) {
      dispatch(setLatestProject(projectID));
    }
  });
  useEffect(() => {
    if (error) {
      console.log(error);
    }
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if ((project && !project?.documents) || project?.documents?.length === 0) {
    return (
      <>
        <div className="p-6 bg-gray-100 w-full drop-shadow-sm flex flex-col justify-center items-center">
          <div className="bg-gray-900 p-6 rounded-lg shadow-md">
            <h1 className="text-xl text-white font-semibold mb-4">
              There are no documents in this project
            </h1>
            <button
              onClick={() => setIsModalOpen(!isModalOpen)}
              className="w-full bg-white text-gray-900 px-3 py-2 rounded-md text-lg border-gray-900 transition-colors font-semibold flex items-center justify-center"
            >
              {' '}
              Create new document
            </button>
          </div>
        </div>
        {isModalOpen && project && (
          <DocumentCreationModal
            onClose={() => setIsModalOpen(!isModalOpen)}
            token={token}
            defaultProjectId={project.id}
          />
        )}
      </>
    );
  }

  return (
    <div className="p-6 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-row items-center">
          <CgFileDocument size={30} />
          <h1 className="text-xl font-bold px-2 text-gray-900">
            Documents ({data && project && project.documents?.length})
          </h1>
        </div>
        <button
          className="bg-gray-900 text-white px-3 py-2 rounded-md text-md border-gray-900 transition-colors font-semibold flex items-center"
          onClick={(): void => setIsModalOpen(!isModalOpen)}
        >
          <AiOutlinePlus
            size={20}
            className="mr-1 text-gray-900 fill-white stroke-gray-900"
          />{' '}
          Add
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 w-full">
        {project?.documents?.map((document) => {
          const isNotDoneAutomatic =
            document?.transcriptionType === 'AUTOMATIC' &&
            document?.transcriptionStatus !== 'DONE';

          return (
            <Link
              to={`/document/${document?.id}`}
              key={document?.id}
              className={`${isNotDoneAutomatic && 'pointer-events-none'}`}
            >
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
                  {document?.transcriptionStatus === 'DONE' && (
                    <CgFileDocument className="text-inherit text-4xl mr-4" />
                  )}
                  {document?.transcriptionStatus === 'CREATED' &&
                    document.transcriptionType === 'AUTOMATIC' && (
                      <span className="w-6 h-5 bg-gradient-to-b from-gray-400 to-gray-500 rounded-full ml-2 mr-6"></span>
                    )}
                  <span className="w-full text-start text-lg font-medium text-ellipsis overflow-hidden whitespace-nowrap">
                    {document?.title}
                  </span>
                </div>
                {document?.lastModified && (
                  <div className="text-end text-md w-full">
                    {new Date(document?.lastModified).toDateString()}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
      {isModalOpen && project && (
        <DocumentCreationModal
          onClose={() => setIsModalOpen(!isModalOpen)}
          token={token}
          defaultProjectId={project.id}
        />
      )}
    </div>
  );
};

const DocumentsWithAccessToken = withAccessToken(Documents);

export default DocumentsWithAccessToken;
