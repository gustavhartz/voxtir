import { HocuspocusProvider } from '@hocuspocus/provider';
import Collaboration from '@tiptap/extension-collaboration';
import { Color } from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Mention from '@tiptap/extension-mention';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import TextStyle from '@tiptap/extension-text-style';
import { Editor as ttEditor, EditorContent, useEditor } from '@tiptap/react';
import React, { useState } from 'react';

import Drawer from '../Drawer';
import suggestion from '../Extensions/Custom/Speakers/Suggestion';
import TrackTimeStamp from '../Extensions/Custom/TimeStamp';

let editorInstance: ttEditor | null = null;
const DOMAIN = import.meta.env.VITE_BACKEND_WS_URL_BASE;

export const setEditorInstance = (editor: ttEditor | null) => {
  editorInstance = editor;
};

export const getEditorInstance = (): ttEditor | null => {
  return editorInstance;
};

function Editor({ documentID, token }: { documentID: string; token: string }) {
  // is synced and is authenticated
  const [editorSyncState, setEditorSyncState] = useState({
    isSynced: false,
    isAuthenticated: false,
    isAuthenticatedComplete: false,
    isAuthenticatedErrorMessage: '',
  });

  const provider = new HocuspocusProvider({
    url: `${DOMAIN}/document/${documentID}`,
    name: `${documentID}`,
    token: `${token}`,
    onSynced: (data) => {
      setEditorSyncState({
        ...editorSyncState,
        isSynced: true,
      });
    },
    onAuthenticated() {
      setEditorSyncState({
        ...editorSyncState,
        isAuthenticated: true,
        isAuthenticatedComplete: true,
      });
    },
    onAuthenticationFailed(d) {
      setEditorSyncState({
        ...editorSyncState,
        isAuthenticated: false,
        isAuthenticatedComplete: true,
        isAuthenticatedErrorMessage: d.reason,
      });
    },
  });
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      HorizontalRule,
      Heading,
      Color,
      TextStyle,
      Collaboration.configure({
        document: provider.document,
      }),
      Placeholder.configure({
        placeholder: 'Start typing here...',
        emptyNodeClass:
          'first:before:h-0 first:before:text-gray-400 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none',
      }),
      Mention.configure({
        HTMLAttributes: {
          class:
            'border-black rounded-md break-clone py-0.5 px-1.5 p-1 bg-blue-500 text-white',
        },
        suggestion,
      }),
      TrackTimeStamp.configure({
        timestamp: '00:00:00',
        show: false,
      }),
    ],
    editorProps: {
      attributes: {
        class: `rounded-lg min-w-full h-full min-h-screen prose sm:prose-base lg:prose-lg focus:outline-none`,
      },
    },
    autofocus: true,
  });
  setEditorInstance(editor);
  return (
    <div className="w-full h-full flex flex-row items-center">
      <div className="w-full h-full">
        {editorSyncState.isAuthenticated && editorSyncState.isSynced && (
          <EditorContent
            className="w-full h-full p-8 overflow-y-scroll"
            editor={editor}
          />
        )}
        {!editorSyncState.isAuthenticated &&
          editorSyncState.isAuthenticatedComplete && (
            <p>{editorSyncState.isAuthenticatedErrorMessage}</p>
          )}
        {!editorSyncState.isAuthenticatedComplete &&
          !editorSyncState.isSynced && <p>Loading</p>}
      </div>
      <Drawer />
    </div>
  );
}

export default Editor;
