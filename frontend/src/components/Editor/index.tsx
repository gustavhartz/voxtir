import React from 'react';
import { useEditor, EditorContent } from "@tiptap/react";
import { Color } from '@tiptap/extension-color';
import History from '@tiptap/extension-history';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Heading from '@tiptap/extension-heading';
import Mention from '@tiptap/extension-mention';
import TrackTimeStamp from '../Extensions/Custom/TimeStamp';

function Editor () {

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      HorizontalRule,
      Heading,
      Color,
      Mention.configure({
        HTMLAttributes: {
            class: 'text-blue-500',
        }
      }),
      TrackTimeStamp
    ],
    content: localStorage.getItem('document') ?? '<h1>Test</h1> <h2>Test</h2>',
    onTransaction: (editor) => {
      localStorage.setItem('document', editor.editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `h-full w-full min-h-screen prose sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none`
      },
    },
    autofocus: true
  });

  return <EditorContent className="w-full" editor={editor} />;
}

export default Editor;
