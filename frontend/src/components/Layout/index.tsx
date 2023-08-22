import React from 'react';
import { Outlet } from 'react-router-dom';

import { AuthenticationGuard } from '../Auth/authentication-guard';
import Nav from '../Nav';



const Layout: React.FC = () => {
  return (
    <div className="flex flex-row w-full h-full max-h-screen">
      <div className="flex flex-row w-full min-h-screen">
        <Nav />
        <div className="flex flex-row w-full max-h-screen h-full">
          <div className="overflow-y-scroll w-full">
            <AuthenticationGuard component={Outlet} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
