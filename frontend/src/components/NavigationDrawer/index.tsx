import React from "react";
import { FiHome, FiSettings, FiDollarSign } from 'react-icons/fi';
import { IconType } from 'react-icons/lib';
import { useLocation } from 'react-router-dom';

interface Route {
  name: string;
  path: string;
  icon: IconType;
}

const routes: Route[] = [
  { name: 'Home', path: '/', icon: FiHome },
  { name: 'Settings', path: '/settings', icon: FiSettings },
  { name: 'Billing', path: '/billing', icon: FiDollarSign },
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
          className={`flex items-center py-2 px-4 mb-2 text-white hover:bg-brand-grey rounded-xl ${
            currentRoute === route.path ? ' bg-brand-blue' : ''
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

const Sidebar = () => {
  return (
    <div className="top-0 left-0 h-screen w-48 flex flex-col bg-brand-black ">
      <div className="p-4 mb-2">
        <p className="text-xl font-semibold text-white">VOXTIR</p>
      </div>
      <div className="flex-grow">
        <SidebarRoutes />
      </div>
      <div className="flex flex-col items-center py-4 px-2">
        <div className="bg-gradient-to-br from-purple-400 to-indigo-900 text-white px-4 py-6 rounded-xl mb-4">
          <p className="text-sm">Upgrade to PRO access all features</p>
        </div>
        <button className="text-white hover:text-brand-blue">Sign Out</button>
      </div>
    </div>
  );
};

export default Sidebar;