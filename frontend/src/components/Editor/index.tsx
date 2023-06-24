import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
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
      Mention.configure({
        HTMLAttributes: {
          class:
            'border-black rounded-md break-clone py-0.5 px-1.5 p-1 bg-blue-500 text-white',
        },
        suggestion,
      }),
      TrackTimeStamp,
    ],
    content:
      localStorage.getItem('document') ??
      '<h1>Te</h1><p><timestamp-button count="1"></timestamp-button></p><p></p><p>Writing some test informa <span data-type="mention" class="border-black rounded-md break-clone py-0.5 px-1.5 p-2 bg-blue-500 text-white" data-id="Lea Thompson">@Lea Thompson</span> <span data-type="mention" class="border-black rounded-md break-clone py-0.5 px-1.5 p-2 bg-blue-500 text-white" data-id="Jerry Hall">@Jerry Hall</span> <span data-type="mention" class="border-black rounded-md break-clone py-0.5 px-1.5 p-2 bg-blue-500 text-white" data-id="Tom Cruise">@Tom Cruise</span> <span data-type="mention" class="border-black rounded-md break-clone py-0.5 px-1.5 p-2 bg-blue-500 text-white" data-id="Jerry Hall">@Jerry Hall</span> <span data-type="mention" class="border-black rounded-md break-clone py-0.5 px-1.5 p-2 bg-blue-500 text-white" data-id="Jerry Hall">@Jerry Hall</span> fe</p><p></p>',
    onTransaction: (editor) => {
      localStorage.setItem('document', editor.editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `h-full w-full min-h-screen prose sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none`,
      },
    },
    autofocus: true,
  });

  return <EditorContent className="w-full" editor={editor} />;
}

export default Editor;