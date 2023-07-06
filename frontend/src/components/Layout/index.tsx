import React from 'react'
import Track from '../Track';
import Drawer from '../Drawer';

interface LayoutProps {
  children: React.ReactNode | React.ReactNode[];
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='flex flex-col w-full h-full'>
      <div className='flex flex-row'>
        <div className='flex flex-col w-full max-h-fit h-full p-6'>
          {children}
        </div>
        <div>
          <Drawer />
        </div>
      </div>
        <div className="fixed bottom-0 h-18 w-full">
          <Track />
        </div>
    </div>
  )
}

export default Layout;