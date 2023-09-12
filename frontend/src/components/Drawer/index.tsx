import { Editor } from '@tiptap/react';
import { saveAs } from 'file-saver';
import React from 'react';
import {
  TbFileExport,
  TbInfoCircle,
  TbKeyboard,
  TbTrash,
} from 'react-icons/tb';
import { Tooltip } from 'react-tooltip';

import { client } from '../../graphql/client';
import {
  GenerateWordFileFromHtmlDocument,
  GenerateWordFileFromHtmlQueryResult,
  GenerateWordFileFromHtmlQueryVariables,
} from '../../graphql/generated/graphql';
import { useAppDispatch } from '../../hooks';
import { toggleModal as ToggleKeyboardModal } from '../../state/keyboard';

interface DrawerProps {
  editor: Editor | null;
}

const Drawer = (props: DrawerProps): JSX.Element => {
  // Update this function to export the document as a docx file based on the redux context
  const editor = props.editor;

  const onExport = async (): Promise<void> => {
    if (!editor) {
      console.error('Editor instance not found');
      return;
    }
    const data = await editor.getHTML();

    const variables: GenerateWordFileFromHtmlQueryVariables = {
      html: data,
    };

    const response = (await client.query({
      query: GenerateWordFileFromHtmlDocument,
      variables: variables,
    })) as GenerateWordFileFromHtmlQueryResult;
    console.log(response);
    if (response.error) {
      console.error(response.error);
      return;
    }
    if (!response.data?.generateWordFileFromHTML) {
      console.error('No data returned');
      return;
    }
    console.log(response.data?.generateWordFileFromHTML?.url);
    const s3Reponse = await fetch(response.data?.generateWordFileFromHTML?.url);
    const wordBlob = await s3Reponse.blob();
    saveAs(wordBlob, 'VoxtirDocument.docx');
  };

  const dispatch = useAppDispatch();
  const handleOpenKeyboardModal = (): void => {
    dispatch(ToggleKeyboardModal());
  };

  // delete document
  const onDelete = (): void => {
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
            onClick={(): void => {
              console.log('Clicked on info circle');
            }}
            data-tooltip-id="document-sidebar"
            data-tooltip-content="Info"
          >
            <TbInfoCircle className="text-4xl text-gray-600 hover:text-gray-800 cursor-pointer" />
          </button>
          <button
            onClick={(): void => {
              onExport();
            }}
            data-tooltip-id="document-sidebar"
            data-tooltip-content="File export"
          >
            <TbFileExport className="text-4xl text-gray-600 hover:text-gray-800 cursor-pointer" />
          </button>
          <button
            onClick={(): void => {
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
