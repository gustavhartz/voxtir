import { mergeAttributes, Node } from '@tiptap/core';

const node = Node.create({
  name: 'timeStampButton',
  priority: 1000,

  atom: true,
  inline: true,
  group: 'inline',

  addAttributes() {
    return {
      timestamp: {
        default: '00:00:00',
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

  renderHTML({ HTMLAttributes }) {
    return ['timestamp-button', mergeAttributes(HTMLAttributes)];
  },
});

export default node;
