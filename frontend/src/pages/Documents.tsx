//TIPTAP
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import History from '@tiptap/extension-history';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Heading from '@tiptap/extension-heading';

import { EditorContent, useEditor } from '@tiptap/react';
import Collaboration from '@tiptap/extension-collaboration';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { useSearchParams } from 'react-router-dom';
//OTHER
import MenuBar from '../components/Menubar';
import React from 'react';

const TipTapEditor = () => {
  // useSearchParams
  const [searchParams, _] = useSearchParams({});
  const id = searchParams.get('id');
  const provider = new HocuspocusProvider({
    url: `ws://127.0.0.1:1234/collaboration/${id}`,
    name: `${id}`,
    token: 'sfe',
  });

  const editor = useEditor({
    //Tiptap styling see https://tailwindcss.com/docs/typography-plugin and https://tiptap.dev/guide/styling#with-tailwind-css
    editorProps: {
      attributes: {
        class: 'prose',
      },
    },
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      HorizontalRule,
      Heading,
      Collaboration.configure({
        document: provider.document,
      }),
      Color.configure({ types: [TextStyle.name] }),
      TextStyle.configure(),
    ],
    content: `
    <h2>
      Hi there,
    </h2>
    <p>
  This is an example of a transcript. The idea is that once in a while you will recieve theses markers [00:30]
  these will be a jumppoint to access the audio at that point. You can also add your own markers by clicking the add button
  </p>
  <p>
 [01:30] The idea is that you can read a section. If it does not make sense then you can press the link and it will take you to the audio at that point. The you can easily edit the text.
 </p>
 <p>
 [2:30] It will automatically save an multiple people should be able to work in the document at once.
    </p>
  `,
  });
  if (!editor) {
    return null;
  }
  return (
    <div className="px-5 py-5">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="element" />
    </div>
  );
};

export default TipTapEditor;
