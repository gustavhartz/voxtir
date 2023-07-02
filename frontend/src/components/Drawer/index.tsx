import React from 'react';
import { TbInfoCircle, TbKeyboard } from "react-icons/tb";

const Drawer = () => {
    return (
        <>
            <aside id="default-sidebar" className="absolute top-0 right-0 w-16 h-screen" aria-label="Sidebar">
                <div className="space-y-6 flex flex-col items-center py-8 w-full h-full overflow-y-auto bg-white shadow-lg">
                    <TbKeyboard className="text-4xl text-gray-600 hover:text-gray-800 cursor-pointer" />
                    <TbInfoCircle className="text-4xl text-gray-600 hover:text-gray-800 cursor-pointer" />
                </div>
            </aside>
        </>
    )
}

export default Drawer;