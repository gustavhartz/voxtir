import { useEffect, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { CgFileDocument } from 'react-icons/cg';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import withAccessToken from '../components/Auth/with-access-token';
import DocumentCreationModal from '../components/Document/NewDocumentModal';
import TranscriptionStatus from '../components/TranscriptionStatus';
import { Document, useProjectsQuery } from '../graphql/generated/graphql';
import { useAppDispatch } from '../hooks';
import { setLatestProject } from '../state/client';

type TranscriptionStatusFilter =
  | 'ALL'
  | 'CREATED'
  | 'FAILED'
  | 'QUEUED'
  | 'DONE'
  | 'PROCESSING';

const Documents = ({ token }: { token: string }) => {
  const [selectedFilter, setSelectedFilter] =
    useState<TranscriptionStatusFilter>('ALL');

  const { data, loading, error } = useProjectsQuery({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });
  const dispatch = useAppDispatch();
  const location = useLocation();
  const projectID = useParams().projectID;
  const project = data?.projects?.find((project) => project?.id === projectID);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const allDocumentStatus = project?.documents?.map(
    (document) => document?.transcriptionStatus
  );
  const completedStatus = allDocumentStatus?.filter(
    (status) => status === 'DONE'
  );
  const processingStatus = allDocumentStatus?.filter(
    (status) => status === 'PROCESSING'
  );
  const queuedStatus = allDocumentStatus?.filter(
    (status) => status === 'QUEUED'
  );
  const failedStatus = allDocumentStatus?.filter(
    (status) => status === 'FAILED'
  );
  const createdStatus = allDocumentStatus?.filter(
    (status) => status === 'CREATED'
  );

  const handleFilterChange = (filter: TranscriptionStatusFilter) => {
    setSelectedFilter(filter);
  };

  const filteredDocuments = project?.documents
    ?.filter((document) => {
      if (selectedFilter === 'ALL') {
        return true;
      } else {
        return document?.transcriptionStatus === selectedFilter;
      }
    })
    .sort((a, b) => {
      if (a?.lastModified && b?.lastModified) {
        const dateA = new Date(a.lastModified);
        const dateB = new Date(b.lastModified);

        // Compare dates for sorting
        return dateB.getTime() - dateA.getTime();
      } else {
        return 0;
      }
    });

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
    <div className="p-6 w-full flex flex-col space-y-12">
      <div className="text-gray-900 bg-gray-100 p-5 mt-4 rounded-md flex flex-col space-y-4">
        <h1 className="text-3xl text-gray-900 font-semibold text-ellipsis overflow-hidden whitespace-nowrap">
          {project?.name}
        </h1>
        <p className="text-lg text-gray-500">{project?.description}</p>
      </div>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-row items-center">
            <CgFileDocument size={30} />
            <h1 className="text-xl font-bold px-2 text-gray-900">
              Documents ({data && project && filteredDocuments?.length})
            </h1>
          </div>
          <div className="flex flex-row max-[600px]:flex-col min-[600px]:items-center min-[600px]:space-x-4 max-[600px]:space-y-2">
            <select
              disabled={
                [
                  completedStatus,
                  processingStatus,
                  queuedStatus,
                  failedStatus,
                  createdStatus,
                ].filter((status) => (status ? status?.length > 0 : false))
                  .length <= 1
              }
              id="transcriptionFilter"
              className="disabled:hidden h-10 w-30 text-white rounded border-r-8 border-transparent font-medium bg-gray-900 px-4 text-md outline outline-gray-300 focus:outline-gray-400 focus:outline-2"
              value={selectedFilter}
              onChange={(e) =>
                handleFilterChange(e.target.value as TranscriptionStatusFilter)
              }
            >
              <option value="ALL">Show all</option>
              {completedStatus && completedStatus?.length > 0 && (
                <option value="DONE">
                  Completed ({completedStatus.length})
                </option>
              )}
              {processingStatus && processingStatus?.length > 0 && (
                <option value="PROCESSING">
                  Processing ({processingStatus.length})
                </option>
              )}
              {queuedStatus && queuedStatus?.length > 0 && (
                <option value="QUEUED">Queued ({queuedStatus.length})</option>
              )}
              {failedStatus && failedStatus?.length > 0 && (
                <option value="FAILED">Failed ({failedStatus.length})</option>
              )}
              {createdStatus && createdStatus?.length > 0 && (
                <option value="CREATED">
                  Created ({createdStatus.length})
                </option>
              )}
            </select>
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
        </div>
        <div className="grid grid-cols-1 gap-4 w-full pb-12">
          {filteredDocuments?.map((document) => {
            const isNotDoneAutomatic =
              document?.transcriptionType === 'AUTOMATIC' &&
              document?.transcriptionStatus !== 'DONE';

            return (
              <Link
                to={
                  isNotDoneAutomatic
                    ? location.pathname
                    : `/document/${document?.id}`
                }
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
    </div>
  );
};

const DocumentsWithAccessToken = withAccessToken(Documents);

export default DocumentsWithAccessToken;
