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
import { asBlob } from '../../utils/html-to-docx';
import { getEditorInstance } from '../Editor';

const Drawer = () => {
  // Update this function to export the document as a docx file based on the redux context
  const onExport = async () => {
    const editor = getEditorInstance();
    if (!editor) {
      console.error('Editor instance not found');
      return;
    }
    const data = await asBlob(editor.getHTML(), {
      orientation: 'portrait',
    });
    // if buffer convert to string
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    saveAs(blob, 'voxtir-export.docx');
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
        className="absolute top-0 right-0 w-16 min-h-screen h-full"
        aria-label="Sidebar"
      >
        <div className="space-y-6 flex flex-col items-center py-8 w-full h-full overflow-y-auto bg-white shadow-lg">
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
