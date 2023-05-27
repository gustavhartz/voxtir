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
import { FaHome } from 'react-icons/fa';
import { IconContext, IconType } from 'react-icons';

import { Link } from 'react-router-dom';

const TipTapEditor = () => {
  const Icon: IconType = FaHome;

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
        class: 'prose max-w-none outline-transparent relative z-20',
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
    <h2>
    Hi there,
  </h2>    <h2>
  Hi there,
</h2>

<h2>
Hi there,
</h2>    <h2>
Hi there,
</h2>
  `,
  });
  if (!editor) {
    return null;
  }
  return (
    <div className="flex">
      {/* Return to home container */}
      <div className="top-0 left-0 h-screen w-10 flex  flex-col p-2 m-2">
        <div className="">
          <Link to="/">
            <IconContext.Provider value={{ color: 'black', size: '1em' }}>
              <Icon className="text-white text-xl cursor-pointer fixed" />
            </IconContext.Provider>
          </Link>
        </div>
      </div>
      {/* Document section */}
      <div className="flex flex-col">
        <div className="w-full bg-red-600 h-16 sticky top-0 z-30">
          <p className="text-white p-2">Audio bar</p>
        </div>
        <div className="w-full bg-black h-16 items-center justify-center">
          <p className="text-white p-2">Interview with Andrew</p>
        </div>
        <div className="h-full w-full">
          <EditorContent editor={editor} className=" z-0" />
        </div>
      </div>
      {/* Settings panel */}
      <div className="top-0 right-0 h-screen w-1/5 flex flex-col">
        <div className="fixed bg-white drop-shadow-xl h-full">
          <div className="p-4 mb-2 text-center">
            <p className="text-xl font-semibold text-brand-black">VOXTIR</p>
          </div>
          <div className="flex-grow">
            <div>fs</div>
          </div>
          <div className="flex flex-col items-center py-4 px-2">
            <div className="bg-gradient-to-br from-purple-400 to-indigo-900 text-white px-4 py-6 rounded-xl mb-4">
              <p className="text-sm">Upgrade to PRO access all features</p>
            </div>
            <button className="text-black hover:text-brand-blue">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipTapEditor;
