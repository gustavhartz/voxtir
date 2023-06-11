import { mergeAttributes, Node } from '@tiptap/core'

export interface TrackTimeStampOptions {
  HTMLAttributes: Record<string, any>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    trackTimeStamp: {
      /**
       * Toggle a paragraph
       */
      setTrackTimeStamp: () => ReturnType,
    }
  }
}

const testHandler = () => {
    console.log("clicked");
    alert("haha");
}

const TrackTimeStamp = Node.create<TrackTimeStampOptions>({
  name: 'TrackTimeStamp',

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {
        id: "Test",
        class: "bg-red-500 text-white",
        onclick: testHandler

      },
    }
  },

  group : "block",
  content: 'inline*',

  parseHTML() {
    return [
      { tag: 'button' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['button', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setTrackTimeStamp: () => ({ commands }) => {
        return commands.setNode(this.name)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-l': () => this.editor.commands.setTrackTimeStamp(),
    }
  },
})

export default TrackTimeStamp;