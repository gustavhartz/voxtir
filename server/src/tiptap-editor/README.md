## Tiptap editor

The purpose of this code is two fold
* Generate the HTML from the database state
* Allow for creation of documents serverside

A little documentation can be found [here](https://tiptap.dev/api/utilities/html/#generate-json-from-html) and [here](https://tiptap.dev/hocuspocus/server/hooks) in the section "Create a Y.js document from JSON/HTML (once)".

Because the Editor uses a very strict schema any changes here or in the frontend schema should be imposed both places!! The typings are simply generated based on inspecting the produces TipTap json structure.

The code has also been simplified here to avoid issues with running in NodeJS environment, since it does not have the browser API etc.


Example from 11/09/2023

each section corresponds to a newline element

```
// Usage
const jsonData: TipTapTransformerDocument = {
  default: {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'vuhjfse' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'sefesf' }],
      },
      { type: 'paragraph', content: [{ type: 'text', text: 'esf' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'sef' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'g' }] },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'fsefse' }],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'fse' },
          { type: 'mention', attrs: { id: 'fse' } },
          { type: 'text', text: ' ' },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'timeStampButton', attrs: { timestamp: '00:00:08' } },
          { type: 'text', text: ' fsefesg' },
        ],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'fsesef' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'bbjhbjhjbbjbhhjb' }],
      },
      { type: 'paragraph', content: [{ type: 'text', text: "j''" }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'j' }] },
      { type: 'paragraph' },
    ],
  },
};
```
