import React from 'react'
import Track from '../Track';

interface LayoutProps {
  children: React.ReactNode | React.ReactNode[];
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='flex flex-col w-full h-full bg-gray-100'>
        <div className='flex flex-col w-full max-h-fit h-full p-6 lg:p-40 md:p-32 sm:p-6 mb-20'>
          {children}
        </div>
        <div className="fixed bottom-0 h-18 w-full">
          <Track />
        </div>
    </div>
  )
}

export default Layout;