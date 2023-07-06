import React from 'react';
import { useEditor, EditorContent, Editor as ttEditor } from '@tiptap/react';
import { asBlob } from '../../utils/html-to-docx';
import { saveAs } from 'file-saver';

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

const onExport = async (editor: ttEditor) => {
  const data = await asBlob(editor.getHTML(), {
    orientation: 'portrait',
  });
  // if buffer convert to string

  const blob = new Blob([data], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  saveAs(blob, 'document.docx');
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
      '<h1>Te</h1><p><timestamp-button count="1"></timestamp-button></p><p></p><p>Writing some <span style="color: #958DF1">Oh, for some reason that’s purple.</span> test informa <span data-type="mention" class="border-black rounded-md break-clone py-0.5 px-1.5 p-2 bg-blue-500 text-white" data-id="Lea Thompson">@Lea Thompson</span> <span data-type="mention" class="border-black rounded-md break-clone py-0.5 px-1.5 p-2 bg-blue-500 text-white" data-id="Jerry Hall">@Jerry Hall</span> <span data-type="mention" class="border-black rounded-md break-clone py-0.5 px-1.5 p-2 bg-blue-500 text-white" data-id="Tom Cruise">@Tom Cruise</span> <span data-type="mention" class="border-black rounded-md break-clone py-0.5 px-1.5 p-2 bg-blue-500 text-white" data-id="Jerry Hall">@Jerry Hall</span> <span data-type="mention" class="border-black rounded-md break-clone py-0.5 px-1.5 p-2 bg-blue-500 text-white" data-id="Jerry Hall">@Jerry Hall</span> fe</p><p></p>',
    onTransaction: (editor) => {
      localStorage.setItem('document', editor.editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `rounded-lg min-w-full h-full min-h-screen prose sm:prose-base lg:prose-lg focus:outline-none`
      },
    },
    autofocus: true,
  });

  return (
    <div>
      <EditorContent className="w-full" editor={editor} />
      {editor ? (
        <button onClick={() => onExport(editor)}>Log HTML</button>
      ) : null}
    </div>
  );
}

export default Editor;
