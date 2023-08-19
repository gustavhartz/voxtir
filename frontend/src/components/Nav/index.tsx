import React from 'react';
import { FiHome, FiSettings, FiDollarSign } from 'react-icons/fi';
import { IconType } from 'react-icons/lib';
import { useLocation } from 'react-router-dom';

interface Route {
  name: string;
  path: string;
  icon: IconType;
}

const routes: Route[] = [
  { name: 'Projects', path: '/', icon: FiHome }
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
          <route.icon className="mr-3" />
          <span>{route.name}</span>
        </a>
      ))}
    </div>
  );
};

const Nav = () => {
    const [isOpen, setOpen] = React.useState(localStorage.getItem('sidebar') === 'true' ? true : false);

    const handleToggleOpen = () => {
        setOpen(!isOpen);
        localStorage.setItem('sidebar', (!isOpen).toString());
    };

    if (!isOpen) {
        return (
            <div>
                <button onClick={handleToggleOpen}>Open</button>
            </div>
        )
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

    return (
        <div>Error</div>
    )
};

export default Nav;