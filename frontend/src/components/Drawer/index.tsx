import React from 'react';
import {
  TbInfoCircle,
  TbKeyboard,
  TbFileExport,
  TbTrash,
  TbFileImport,
} from 'react-icons/tb';
import { Tooltip } from 'react-tooltip';
import { asBlob } from '../../utils/html-to-docx';
import { saveAs } from 'file-saver';
import { getEditorInstance } from '../Editor';
import { useAppDispatch } from '../../hooks';
import { toggleModal } from '../../state/keyboard';

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
  const handleOpenModal = () => {
    dispatch(toggleModal());
    console.log('dispatched');
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
        className="absolute top-0 right-0 w-16 h-screen"
        aria-label="Sidebar"
      >
        <div className="space-y-6 flex flex-col items-center py-8 w-full h-full overflow-y-auto bg-white shadow-lg">
          <button
            onClick={handleOpenModal}
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
            onClick={() => {
              console.log('Clicked on file import');
            }}
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
