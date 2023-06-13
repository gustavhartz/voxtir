import React, { ReactNode } from 'react';
import { IconType } from 'react-icons';
import { FiArchive, FiEdit, FiShare2 } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { setTrack } from '../state/track';
import { useAppSelector } from '../hooks';
import { useEditor, EditorContent } from "@tiptap/react";
import { Color } from '@tiptap/extension-color';
import History from '@tiptap/extension-history';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Heading from '@tiptap/extension-heading';
import TrackTimeStamp from '../components/TimeStamp';

function Home() {

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      History,
      HorizontalRule,
      Heading,
      Color,
      TrackTimeStamp
    ],
    content: localStorage.getItem('document') ?? '<h1>Test</h1> <h2>Test</h2>',
    onTransaction: (editor) => {
      localStorage.setItem('document', editor.editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `h-full min-h-screen prose sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none`
      },
    },
    autofocus: true
  });

  const dispatch = useDispatch();

  const setNewTrack = () => {
    dispatch(
      setTrack({
        src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        totalLength: 100,
      })
    );  
  };

  return (
    <div className=" px-5 py-5 w-full h-full">
      <EditorContent editor={editor} />
    </div>
  );
}

export default Home;
