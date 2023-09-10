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
  const { data, loading } = useProjectsQuery({
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
          <CgFileDocument size={40} />
          <h1 className="text-3xl font-bold px-2 text-gray-900">
            Documents ({data && project && project.documents?.length})
          </h1>
        </div>
        <button
          className="bg-gray-900 text-white px-3 py-2 rounded-md text-lg border-gray-900 transition-colors font-semibold flex items-center"
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
          return (
            <Link to={`/document/${document?.id}`} key={document?.id}>
              <div
                className="hover:scale-[1.03] hover:bg-slate-800 bg-slate-900 text-white duration-500 transition-all w-full cursor-pointer shadow-md rounded-md flex flex-row justify-between items-center px-4 py-4 font-semibold
                "
              >
                <div className="flex flex-row items-center w-full">
                  <CgFileDocument className="text-inherit text-4xl mr-4" />
                  <span className=" w-full text-start text-2xl font-bold">
                    {document?.title}
                  </span>
                </div>
                {document?.lastModified && (
                  <div className="text-end">
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
