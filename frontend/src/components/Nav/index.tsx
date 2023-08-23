import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { AiFillFolderOpen, AiOutlineFolder } from 'react-icons/ai';
import { FaRegFileAudio, FaRegUserCircle, FaUserCircle } from 'react-icons/fa';
import { FiArrowUpRight } from 'react-icons/fi';
import { IoMdLogOut } from 'react-icons/io';
import { IconType } from 'react-icons/lib';
import { useLocation } from 'react-router-dom';
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
    name: 'Profile',
    path: '/me',
    icon: FaRegUserCircle,
    activeIcon: FaUserCircle,
  },
];

const SidebarRoutes = () => {
  const location = useLocation();
  const [currentRoute, setCurrentRoute] = React.useState(location.pathname);

  const handleRouteClick = (path: string) => {
    setCurrentRoute(path);
  };

  return (
    <div className="px-3">
      {routes.map((route, index) => (
        <a
          key={index}
          href={route.path}
          className={`flex items-center py-2 px-4 mb-2 font-normal transition-all hover:font-medium hover:bg-gray-100 text-gray-900 rounded-xl ${
            currentRoute === route.path ? '!font-medium bg-gray-100' : ''
          }`}
          onClick={() => handleRouteClick(route.path)}
        >
          {currentRoute === route.path ? (
            <route.activeIcon size={30} className="mr-3" />
          ) : (
            <route.icon size={30} className="mr-3" />
          )}
          <span className="text-lg">{route.name}</span>
        </a>
      ))}
    </div>
  );
};

const Nav = () => {
  const [isOpen, setOpen] = React.useState(
    localStorage.getItem('sidebar') === 'true' ? true : false
  );
  const { logout } = useAuth0();
  const handleToggleOpen = () => {
    setOpen(!isOpen);
    localStorage.setItem('sidebar', (!isOpen).toString());
  };

  if (!isOpen) {
    return (
      <div>
        <button onClick={handleToggleOpen}>Open</button>
      </div>
    );
  }

  if (isOpen) {
    return (
      <div className="w-96 flex flex-col min-h-full h-full bg-white border-r-2 border-gray-100">
        <div className="p-6 mb-2 flex items-center bg-gray-900 text-white">
          <FaRegFileAudio className="text-4xl mr-1 0" />
          <p className="text-2xl font-semibold ">Voxtir</p>
        </div>
        <div className="flex-grow my-4">
          <SidebarRoutes />
        </div>
        <div className="flex flex-col items-center py-4 px-4">
          <div className="bg-gray-800 w-full h-14 flex justify-between px-4 items-center mb-4 rounded-lg drop-shadow-sm">
            <p className="text-lg text-white font-medium">
              Upgrade to{' '}
              <span className="bg-black text-white px-2 py-1 rounded-lg ml-1">
                PRO
              </span>
            </p>
            <div className="bg-white p-1 rounded-full shadow-sm">
              <FiArrowUpRight size={28} />
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="text-black font-medium flex items-center text-lg"
          >
            <IoMdLogOut size={26} className="mr-2" /> Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div>
        <button onClick={handleToggleOpen}>Open</button>
      </div>
    );
  }

  if (isOpen) {
    return (
      <div className="w-64 flex flex-col min-h-full h-full bg-white border-r-2 border-gray-100">
        <div className="p-4 mb-2">
          <p className="text-2xl font-semibold text-gray-700">Voxtir</p>
        </div>
        <div className="flex-grow">
          <SidebarRoutes />
        </div>
        <div className="flex flex-col items-center py-4 px-2">
          <div className="bg-gradient-to-br from-purple-400 to-indigo-900 text-white px-4 py-6 rounded-xl mb-4">
            <p className="text-sm">Upgrade to PRO access all features</p>
          </div>
          <button className="text-black">Sign Out</button>
        </div>
      </div>
    );
  }

  return <div>Error</div>;
};

export default Nav;
