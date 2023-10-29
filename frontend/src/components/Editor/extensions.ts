import { HocuspocusProvider } from '@hocuspocus/provider';
import Bold from '@tiptap/extension-bold';
import Collaboration from '@tiptap/extension-collaboration';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import Italic from '@tiptap/extension-italic';
import Mention from '@tiptap/extension-mention';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import Underline from '@tiptap/extension-underline';

import suggestion from '../Extensions/Custom/Speakers/Suggestion';
import TrackTimeStamp from '../Extensions/Custom/TimeStamp';

export const getExtensions = (provider: HocuspocusProvider) => {
  return [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Underline,
    Heading,
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
  ];
};
