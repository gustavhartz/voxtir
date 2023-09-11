import { useEffect, useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { BsChevronLeft } from 'react-icons/bs';
import { CgFileDocument } from 'react-icons/cg';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import withAccessToken from '../components/Auth/with-access-token';
import Document from '../components/Document';
import DocumentCreationModal from '../components/Document/NewDocumentModal';
import {
  useProjectsQuery,
  useTrashDocumentMutation,
} from '../graphql/generated/graphql';
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

  const { data, loading, error, refetch } = useProjectsQuery({
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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const projectID = useParams().projectID;
  const project = data?.projects?.find((project) => project?.id === projectID);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const allDocumentStatus = project?.documents
    ?.filter((document) => !document?.isTrashed)
    .map((document) => document?.transcriptionStatus);
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
    .filter((document) => !document?.isTrashed)
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

  const handleGoPrev = () => {
    navigate(-1);
  };

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

  useEffect(() => {
    if (project) {
      document.title = `Voxtir - ${project.name}`;
    }
  }, [project]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (
    (project &&
      !project?.documents?.filter((document) => !document?.isTrashed)) ||
    project?.documents?.filter((document) => !document?.isTrashed).length === 0
  ) {
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
    <div className="p-6 w-full flex flex-col space-y-8">
      <div className="text-gray-900 bg-gray-100 p-5 rounded-md flex flex-col space-y-4">
        <div className="flex flex-row items-center w-full justify-between pr-5">
          <h1 className="text-3xl text-gray-900 font-semibold text-ellipsis overflow-hidden whitespace-nowrap">
            {project?.name}
          </h1>
          <span
            onClick={() => handleGoPrev()}
            className="group flex flex-row items-center text-md font-medium cursor-pointer"
          >
            <BsChevronLeft
              size={20}
              className="mr-1 group-hover:-translate-x-1 transition-all duration-500"
            />{' '}
            Go back
          </span>
        </div>
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
            return (
              <Document
                key={document?.id}
                document={document}
                handleRefetch={refetch}
                projectId={project?.id}
                token={token}
              />
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
