import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import {
  AiFillFolderOpen,
  AiFillInfoCircle,
  AiFillPushpin,
  AiOutlineBug,
  AiOutlineFolder,
  AiOutlineInfoCircle,
  AiOutlineMenuFold,
  AiOutlineMenuUnfold} from 'react-icons/ai';
import { BiCoin } from "react-icons/bi";
import { FaRegFileAudio } from 'react-icons/fa';
import { IoMdLogOut } from 'react-icons/io';
import { IconType } from 'react-icons/lib';
import { MdOutlineQuestionAnswer } from "react-icons/md";
import { Link, useLocation } from 'react-router-dom';

import {
  MePinnedProjectsQuery,
  useMePinnedProjectsQuery,
} from '../../graphql/generated/graphql';
import { useAppSelector } from '../../hooks';
import { useAppDispatch } from '../../hooks';
import { refetchPinnedComplete } from '../../state/client';
import withAccessToken from '../Auth/with-access-token';
import BugModal from '../BugModal';
import FeatureModal from '../FeatureModal';

interface Route {
  name: string;
  path: string;
  icon: IconType;
  activeIcon: IconType;
}

const routes: Route[] = [
  {
    name: 'Projects',
    path: '/',
    icon: AiOutlineFolder,
    activeIcon: AiFillFolderOpen,
  },
  {
    name: 'About Us',
    path: '/about',
    icon: AiOutlineInfoCircle,
    activeIcon: AiFillInfoCircle,
  },
];

const SidebarRoutes = () => {
  const location = useLocation();

  return (
    <div className="px-3 pt-6">
      {routes.map((route, index) => (
        <Link
          key={index}
          to={route.path}
          className={`flex items-center py-2 px-4 mb-2 font-normal transition-all hover:font-medium hover:bg-gray-100 text-gray-900 rounded-xl ${
            location.pathname === route.path ? '!font-medium bg-gray-100' : ''
          }`}
        >
          {location.pathname === route.path ? (
            <route.activeIcon size={30} className="mr-3" />
          ) : (
            <route.icon size={30} className="mr-3" />
          )}
          <span className="text-lg">{route.name}</span>
        </Link>
      ))}
    </div>
  );
};

const PinnedRoutes = ({
  pinnedProp,
  latestProject,
}: {
  pinnedProp: MePinnedProjectsQuery | undefined;
  latestProject: string;
}) => {
  const location = useLocation();
  const [pinned, setPinned] = React.useState<MePinnedProjectsQuery | undefined>(
    undefined
  );

  React.useEffect(() => {
    setPinned(pinnedProp);
  }, [pinnedProp]);

  return (
    <>
      {pinned?.pinnedProjects && pinned?.pinnedProjects.length > 0 && (
        <div className="border-t-2 border-b-2 border-gray-100 py-4 bg-white overflow-y-scroll">
          <h1 className="px-4 text-lg font-medium flex flex-row items-center mb-2 mt-4">
            <AiFillPushpin className="mr-2" size={20} />
            Pinned Projects
          </h1>
          {pinned?.pinnedProjects?.map((project) => (
            <Link
              key={project?.id}
              to={`/project/${project?.id}`}
              className={`flex items-center py-2 mx-3 px-4 mb-2 font-normal transition-all hover:font-medium hover:bg-gray-200 text-gray-900 rounded-xl ${
                location.pathname === `/project/${project?.id}` ||
                (location.pathname.includes('document') &&
                  project?.id === latestProject)
                  ? '!font-semibold bg-gray-50'
                  : ''
              }`}
            >
              {location.pathname === `/project/${project?.id}` ||
              (location.pathname.includes('document') &&
                project?.id === latestProject) ? (
                <AiFillFolderOpen size={30} className="mr-3" />
              ) : (
                <AiOutlineFolder size={30} className="mr-3" />
              )}
              <span className="px-2 w-3/4 text-md font-inherit bg-inherit overflow-hidden whitespace-nowrap text-ellipsis">
                {project?.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

const Nav = ({ token }: { token: string }) => {
  const [isBugOpen, setBugOpen] = React.useState(false);
  const [isFeatureOpen, setFeatureOpen] = React.useState(false);
  const [isOpen, setOpen] = React.useState(
    localStorage.getItem('sidebar') === 'true' ? true : false
  );
  const { logout } = useAuth0();
  const { refetchPinned, latestProject } = useAppSelector(
    (state) => state.client
  );
  const dispatch = useAppDispatch();

  const handleToggleOpen = () => {
    setOpen(!isOpen);
    localStorage.setItem('sidebar', (!isOpen).toString());
  };

  const { data, refetch } = useMePinnedProjectsQuery({
    context: {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  });

  React.useEffect(() => {
    if (refetchPinned) {
      refetch();
      dispatch(refetchPinnedComplete());
    }
  }, [refetchPinned, refetch, dispatch]);

  if (!isOpen) {
    return (
      <div
        onClick={handleToggleOpen}
        className="px-4 py-8 cursor-pointer border-r-2 border-gray-100"
      >
        <AiOutlineMenuUnfold className="text-2xl" />
      </div>
    );
  }

  if (isOpen) {
    return (
      <>
        <BugModal isOpen={isBugOpen} toggleOpen={() => setBugOpen(!isBugOpen)} />
        <FeatureModal isOpen={isFeatureOpen} toggleOpen={() => setFeatureOpen(!isFeatureOpen)} />
        <div className="max-w-[270px] w-full flex flex-col min-h-full h-full bg-white border-r-2 border-gray-100">
          <div className="p-6 flex items-center justify-between bg-gray-900 text-white">
            <div className="flex flex-row items-center ">
              <FaRegFileAudio className="text-4xl mr-1 0" />
              <p className="text-2xl font-semibold ">Voxtir</p>
            </div>
            <AiOutlineMenuFold
              onClick={handleToggleOpen}
              className="text-2xl hover:scale-105 cursor-pointer"
            />
          </div>
          <div className="rounded-sm px-4 flex bg-gray-100 flex-col justify-center items-center py-4 mb-4 border-t-2 border-b-2 text-gray-900 font-bold">
                  <div className="flex flex-row items-center">
                    <BiCoin size={45} className="text-slate-900" />
                  </div>
                  <span className="text-lg font-medium flex flex-row items-center">
                    <span className="font-extrabold text-xl pr-1">3</span> 
                    Total credits remaining
                  </span>
                </div>
          <div className="flex-grow flex flex-col h-full justify-between">
              <div>
                <PinnedRoutes pinnedProp={data} latestProject={latestProject} />
                <SidebarRoutes />
              </div>
              <div className="text-gray-900 py-10">
                <button
                    onClick={() => setFeatureOpen(!isFeatureOpen)}
                    className={`hover:bg-gray-200 py-4 flex items-center font-medium px-8 mb-2 w-full transition-all`}>
                    <MdOutlineQuestionAnswer size={25} />
                    <span className="px-4 text-lg font-inherit bg-inherit overflow-hidden whitespace-pre text-ellipsis">
                      Request a feature
                    </span>
                </button>
                <button
                    onClick={() => setBugOpen(!isBugOpen)}
                    className={`hover:bg-gray-200 py-4 flex items-center font-semibold px-8 mb-2 w-full transition-all`}>
                    <AiOutlineBug size={25} />
                    <span className="px-4 text-lg font-medium font-inherit bg-inherit overflow-hidden whitespace-nowrap text-ellipsis">
                      Report a bug
                    </span>
                </button>
                <button
                    onClick={() =>
                      logout({
                        logoutParams: {
                          returnTo: import.meta.env.VITE_AUTH0_LOGOUT_URI,
                        },
                      })}
                    className={`hover:bg-gray-200 py-4 flex items-center font-semibold px-8 w-full transition-all`}>
                    <IoMdLogOut size={25} />
                    <span className="px-4 text-lg font-medium font-inherit bg-inherit overflow-hidden whitespace-nowrap text-ellipsis">
                      Signout
                    </span>
                </button>
              </div>  
          </div>
        </div>
      </>
    );
  }

  return <div>Error</div>;
};

const NavWithAccessToken = withAccessToken(Nav);

export default NavWithAccessToken;