import React from 'react';

import Drawer from '../Drawer';
import Track from '../Track';
import { Outlet } from 'react-router-dom';
import Nav from '../Nav';

interface LayoutProps {
}

const Layout: React.FC<LayoutProps> = () => {
  return (
    <div className="flex flex-row w-full h-full max-h-screen">
      <div className="flex flex-row w-full min-h-screen">
        <Nav />
        <div className="flex flex-row w-full max-h-screen h-full">
          <div className="overflow-y-scroll w-full">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
