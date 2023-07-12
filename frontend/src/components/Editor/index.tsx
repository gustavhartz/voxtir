import React from 'react';
import { useEditor, EditorContent, Editor as ttEditor } from '@tiptap/react';
import { Color } from '@tiptap/extension-color';
import History from '@tiptap/extension-history';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Heading from '@tiptap/extension-heading';
import Mention from '@tiptap/extension-mention';
import TrackTimeStamp from '../Extensions/Custom/TimeStamp';
import suggestion from '../Extensions/Custom/Speakers/Suggestion';
import TextStyle from '@tiptap/extension-text-style';
import Placeholder from '@tiptap/extension-placeholder';
import { PlaceholderText } from './placeholder-text';
let editorInstance: ttEditor | null = null;

export const setEditorInstance = (editor: ttEditor | null) => {
  editorInstance = editor;
};

export const getEditorInstance = (): ttEditor | null => {
  return editorInstance;
};

function Editor() {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      HorizontalRule,
      Heading,
      Color,
      TextStyle,
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
        timestamp: "00:00:00",
        show: false
      }),
    ],
    content: localStorage.getItem('document') ?? PlaceholderText,
    onTransaction: (editor) => {
      localStorage.setItem('document', editor.editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `rounded-lg min-w-full h-full min-h-screen prose sm:prose-base lg:prose-lg focus:outline-none`,
      },
    },
    autofocus: true,
  });
  setEditorInstance(editor);
  return <EditorContent className="w-full !pr-14" editor={editor} />;
}

export default Editor;
