import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import Component from './TimeStampButton.tsx';

export default Node.create({
  name: 'timeStampButton',
  priority: 1000,

  atom: true,
  inline: true,
  group: 'inline',

  onCreate() {},

  addAttributes() {
    return {
      timestamp: {
        default: '00:00:00',
        show: false,
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
            attrs: { show: true },
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
