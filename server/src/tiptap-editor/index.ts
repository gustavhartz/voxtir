import { TiptapTransformer } from '@hocuspocus/transformer';
import Bold from '@tiptap/extension-bold';
import { Color } from '@tiptap/extension-color';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Italic from '@tiptap/extension-italic';
import Mention from '@tiptap/extension-mention';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import TextStyle from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { generateHTML } from '@tiptap/html';
import * as Y from 'yjs';

import prisma from '../prisma/index.js';
import { Doc, TipTapTransformerDocument } from '../types/tiptap-editor.js';
import TrackTimeStamp from './timestamp.js';

const extensions = [
  Bold,
  Italic,
  Underline,
  Document,
  Paragraph,
  Text,
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
  }),
  TrackTimeStamp.configure({
    timestamp: '00:00:00',
    show: false,
  }),
];

export const TipTapJSONToYDoc = (json: Doc): Y.Doc => {
  return TiptapTransformer.toYdoc(json, 'default', extensions);
};

export const yjsStateToTipTapJSON = (
  yjsState: Uint8Array
): TipTapTransformerDocument => {
  const ydoc = new Y.Doc();
  Y.applyUpdate(ydoc, yjsState);
  return TiptapTransformer.fromYdoc(ydoc);
};

export const TipTapJSONToHTML = (json: Doc): string => {
  return generateHTML(json, extensions);
};

const isRunningDirectly = false;
if (isRunningDirectly) {
  // Example of how to run this file directly and get an understanding of the inner workings of the transformer
  const docId = 'a1b19934-3caa-4d0b-ba74-fe25110aed37';
  const doc = await prisma.document.findFirst({
    where: {
      id: docId,
    },
  });

  if (!doc?.data) {
    throw new Error('Document not found');
  }
  const tipTapDoc = yjsStateToTipTapJSON(doc.data);
  JSON.stringify(tipTapDoc, null, 2);
  const html = TipTapJSONToHTML(tipTapDoc.default);
  console.log(html);
  const yDoc = TipTapJSONToYDoc(tipTapDoc.default);
  const yDocState = Y.encodeStateAsUpdate(yDoc);
  const tipTapDoc2 = yjsStateToTipTapJSON(yDocState);
  JSON.stringify(tipTapDoc2, null, 2);
}
