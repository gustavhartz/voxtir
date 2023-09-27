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
import { EditorContent, useEditor } from '@tiptap/react';
import React, { useState } from 'react';

import Drawer from '../Drawer';
import suggestion from '../Extensions/Custom/Speakers/Suggestion';
import TrackTimeStamp from '../Extensions/Custom/TimeStamp';
import Track from '../Track';

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
  return (
    <div className="w-full h-full flex flex-row">
      <div className="flex flex-row w-full">
        {editorSyncState.isAuthenticated && (
          <div className="flex flex-col w-full">
            <EditorContent
              className="w-full h-full p-8 overflow-y-scroll"
              editor={editor}
            />
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
