import React from 'react';
import voxtir from '../../assets/voxtir.png';
import { TbNotebook } from "react-icons/tb";
const Drawer = () => {
    const [open, setOpen] = React.useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <>
            <aside id="default-sidebar" className="w-80 h-screen" aria-label="Sidebar">
            <div className="h-full overflow-y-auto bg-white shadow-2xl">
                <ul className="space-y-2 font-medium">
                    <li className="select-none flex px-6 items-center text-3xl text-white mt-8 border-b-2 border-gray-200/60 pb-4">
                        <img src={voxtir} alt="Voxtir" className="w-12 h-12" /> <span className="pl-2 text-black">Voxtir</span>
                    </li>
                    <li className="px-6 py-2 bg-gradient-to-tr from-gradient-start to-gradient-end bg-clip-text text-transparent">
                        <a href="#" className="flex items-center text-inherit">
                            <TbNotebook size="sm" 
                            className="w-7 h-7 text-md" />
                            <span className="ml-3 text-lg">Home</span>
                        </a>
                    </li>
                </ul>
            </div>
            </aside>
            </>
    )
}

export default Drawer;