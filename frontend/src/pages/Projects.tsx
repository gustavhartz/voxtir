import React, { useState } from 'react';
import { AiOutlineAudit, AiOutlinePlus } from 'react-icons/ai';
import { Link } from 'react-router-dom';

import { PageLoader } from '../components/Auth/page-loader';
import withAccessToken from '../components/Auth/with-access-token';
import ProjectCard from '../components/ProjectCard';
import { useProjectsQuery } from '../graphql/generated/graphql';

const Projects = ({ token }: { token: string }) => {
  const { data, loading, refetch } = useProjectsQuery({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  const [filter, setFilter] = useState('');

  const filteredProjects = data?.projects?.filter(
    (project) => project?.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDeleteCallback = () => {
    refetch();
  };

  React.useEffect(() => {
    refetch();
  });

  if (loading) {
    return <PageLoader />;
  }

  if (!loading && data?.projects?.length === 0) {
    return (
      <div className="p-6 bg-gray-100 w-full drop-shadow-sm flex flex-col justify-center items-center">
        <div className="bg-gray-900 p-6 rounded-lg shadow-md">
          <h1 className="text-xl text-white font-semibold mb-4">
            You have no projects yet.
          </h1>
          <Link
            className="bg-white text-gray-900 px-3 py-2 rounded-md text-lg border-gray-900 transition-colors font-semibold flex items-center justify-center"
            to="/new"
          >
            {' '}
            Create new project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full py-8 px-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-row items-center">
          <AiOutlineAudit size={40} />
          <h1 className="text-3xl font-bold px-2 text-gray-900">
            Projects ({data && filteredProjects?.length})
          </h1>
        </div>
        <Link
          className="bg-gray-900 text-white px-3 py-2 rounded-md text-lg border-gray-900 transition-colors font-semibold flex items-center"
          to="/new"
        >
          <AiOutlinePlus
            size={20}
            className="mr-1 text-gray-900 fill-white stroke-gray-900"
          />{' '}
          Add
        </Link>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search.."
          className="w-full px-2 py-2 border rounded-md focus:outline-none hover:bg-gray-100 focus:bg-gray-100"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-6">
        {filteredProjects?.map((project) => {
          if (project?.id || project?.name) {
            return (
              <ProjectCard
                token={token}
                onDeleteCallback={() => refetch()}
                key={project?.id}
                project={{
                  id: project.id,
                  name: project.name,
                  documentLength: project.documents?.length || 0,
                  createdAt: new Date(),
                  description: project.description || '',
                }}
              />
            );
          }
        })}
      </div>
    </div>
  );
};

const ProjectsWithAccessToken = withAccessToken(Projects);

export default ProjectsWithAccessToken;