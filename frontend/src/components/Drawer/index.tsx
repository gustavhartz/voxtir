import { saveAs } from 'file-saver';
import React from 'react';
import {
  TbFileExport,
  TbFileImport,
  TbInfoCircle,
  TbKeyboard,
  TbTrash,
} from 'react-icons/tb';
import { Tooltip } from 'react-tooltip';

import { useAppDispatch } from '../../hooks';
import { toggleModal as ToggleKeyboardModal } from '../../state/keyboard';
import { toggleModal as ToggleImportModal } from '../../state/track';
import { getEditorInstance } from '../Editor';

const Drawer = () => {
  // Update this function to export the document as a docx file based on the redux context
  const onExport = async () => {
    const editor = getEditorInstance();
    if (!editor) {
      console.error('Editor instance not found');
      return;
    }
    const data = await editor.getHTML();
    // create html blob
    const htmlBlob = new Blob([data], {
      type: 'text/html',
    });
    saveAs(htmlBlob, `VoxtirExport.html`);
  };

  const dispatch = useAppDispatch();
  const handleOpenKeyboardModal = () => {
    dispatch(ToggleKeyboardModal());
  };

  const handleOpenImportModal = () => {
    dispatch(ToggleImportModal());
  };

  // delete document
  const onDelete = () => {
    const editor = getEditorInstance();
    editor?.commands.clearContent();
  };

  return (
    <>
      <aside
        id="default-sidebar"
        className="w-24 h-screen overflow-x-hidden"
        aria-label="Sidebar"
      >
        <div className="overflow-x-hidden space-y-6 flex flex-col items-center py-8 w-full h-full overflow-y-auto bg-white border-solid border-l-2 border-gray-100">
          <button
            onClick={handleOpenKeyboardModal}
            data-tooltip-id="document-sidebar"
            data-tooltip-content="Keyboard shortcuts"
          >
            <TbKeyboard className="text-4xl text-gray-600 hover:text-gray-800 cursor-pointer" />
          </button>
          <button
            onClick={() => {
              console.log('Clicked on info circle');
            }}
            data-tooltip-id="document-sidebar"
            data-tooltip-content="Info"
          >
            <TbInfoCircle className="text-4xl text-gray-600 hover:text-gray-800 cursor-pointer" />
          </button>
          <button
            onClick={() => {
              onExport();
            }}
            data-tooltip-id="document-sidebar"
            data-tooltip-content="File export"
          >
            <TbFileExport className="text-4xl text-gray-600 hover:text-gray-800 cursor-pointer" />
          </button>
          <button
            onClick={handleOpenImportModal}
            data-tooltip-id="document-sidebar"
            data-tooltip-content="File import"
          >
            <TbFileImport className="text-4xl text-gray-600 hover:text-gray-800 cursor-pointer" />
          </button>
          <button
            onClick={() => {
              onDelete();
            }}
            data-tooltip-id="document-sidebar"
            data-tooltip-content="Trash"
          >
            <TbTrash className="text-4xl text-gray-600 hover:text-gray-800 cursor-pointer" />
          </button>
          <Tooltip id="document-sidebar" place="top-start" />
        </div>
      </aside>
    </>
  );
};

export default Drawer;
