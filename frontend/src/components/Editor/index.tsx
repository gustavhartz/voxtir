import { HocuspocusProvider } from '@hocuspocus/provider';
import { EditorContent, useEditor } from '@tiptap/react';
import React, { useState } from 'react';

import Drawer from '../Drawer';
import Track from '../Track';
import { getExtensions } from './extensions';
import MenuBar from './menu';

const DOMAIN = import.meta.env.VITE_BACKEND_WS_URL_BASE;

interface EditorProps {
  documentID: string;
  token: string;
}

function Editor(props: EditorProps): JSX.Element {
  const { documentID, token } = props;
  const [editorSyncState, setEditorSyncState] = useState({
    isAuthenticated: false,
    isAuthenticatedComplete: false,
    isAuthenticatedErrorMessage: '',
  });

  const provider = new HocuspocusProvider({
    url: `${DOMAIN}/document/${documentID}`,
    name: `${documentID}`,
    token: `${token}`,
    onAuthenticated(): void {
      if (!editorSyncState.isAuthenticatedComplete) {
        setEditorSyncState({
          ...editorSyncState,
          isAuthenticated: true,
          isAuthenticatedComplete: true,
        });
      }
    },
    onAuthenticationFailed(d): void {
      if (!editorSyncState.isAuthenticatedComplete) {
        setEditorSyncState({
          ...editorSyncState,
          isAuthenticated: false,
          isAuthenticatedComplete: true,
          isAuthenticatedErrorMessage: d.reason,
        });
      }
    },
  });
  const editor = useEditor({
    extensions: getExtensions(provider),
    editorProps: {
      attributes: {
        class: `rounded-lg min-w-full h-full min-h-screen prose sm:prose-base lg:prose-lg focus:outline-none`,
      },
    },
    autofocus: true,
  });
  return (
    <div className="w-full h-full flex flex-row">
      <div className="flex flex-row w-full">
        {editorSyncState.isAuthenticated && editor !== null && (
          <div className="flex flex-col w-full">
            <EditorContent
              className="w-full h-full p-4 overflow-y-scroll"
              editor={editor}
            />
            <div className="px-4 border-t-1 mb-2 border-gray-100">
              <MenuBar editor={editor} />
            </div>
            <div className="w-full">
              <Track />
            </div>
          </div>
        )}
        {!editorSyncState.isAuthenticated &&
          editorSyncState.isAuthenticatedComplete && (
            <p className="w-full">
              {editorSyncState.isAuthenticatedErrorMessage}
            </p>
          )}
        {!editorSyncState.isAuthenticatedComplete && (
          <p className="w-full">Loading</p>
        )}
        <Drawer documentId={documentID} token={token} editor={editor} />
      </div>
    </div>
  );
}

export default Editor;
