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
        default: localStorage.getItem("currentPosition") ?? "00:00:00",
        show: this.options.show,
      },
    }
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
              timestamp: localStorage.getItem("currentPosition") ?? "00:00:00",
              show: this.options.show,
            }
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
