import React from 'react'
import Drawer from '../Drawer';
interface LayoutProps {
  children: React.ReactNode | React.ReactNode[];
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='flex flex-col w-full h-full bg-white'>
        <div className='flex flex-row w-full h-full'>
          <Drawer />
          {children}
        </div>
        <div className="h-6">Player</div>
    </div>
  )
}

export default Layout;