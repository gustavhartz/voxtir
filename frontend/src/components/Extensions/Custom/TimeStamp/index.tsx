import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import Component from './TimeStampButton.tsx';

const node = Node.create({
  name: 'timeStampButton',
  priority: 1000,

  atom: true,
  inline: true,
  group: 'inline',

  addAttributes() {
    return {
      timestamp: {
        default: localStorage.getItem('currentPosition') ?? '00:00:00',
        show: this.options.show,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'timestamp-button',
      },
    ];
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => {
        return this.editor
          .chain()
          .insertContentAt(this.editor.state.selection.head, {
            type: this.type.name,
            attrs: {
              timestamp: localStorage.getItem('currentPosition') ?? '00:00:00',
              show: this.options.show,
            },
          })
          .focus()
          .run();
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    return ['timestamp-button', mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(Component);
  },
});

export default node;
