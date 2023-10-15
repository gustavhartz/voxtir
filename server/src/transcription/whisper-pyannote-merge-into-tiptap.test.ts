import {
  WhisperPyannoteMerger,
  WhisperTranscript,
} from './whisper-pyannote-merge-into-tiptap';

describe('TipTap Transcription Merger', () => {
  const pyannoteTranscript = {
    segments: [{ start: 0, end: 10, idx: 0, speaker: 'A' }],
  };
  const whisperTranscript: WhisperTranscript = {
    text: 'Hi there, this is the first sentence. And this is the second one.',
    chunks: [
      {
        timestamp: [0.0, 2.0],
        text: 'Hi there, this is the first sentence.',
      },
      {
        timestamp: [3.0, 5.0],
        text: 'And this is the second one.',
      },
    ],
  };
  const expectedTipTapJSON = {
    default: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Unnamed document' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'mention', attrs: { id: 'A' } },
            {
              type: 'text',
              text: 'Hi there, this is the first sentence.',
            },
            { type: 'text', text: 'And this is the second one.' },
          ],
        },
      ],
    },
  };

  it('should merge the Pyannote and Whisper transcripts into a TipTapJSONDoc with speaker changes and timestamps', () => {
    const merger = new WhisperPyannoteMerger(
      pyannoteTranscript,
      whisperTranscript
    );
    const result = merger.createSpeakerChangeTranscriptionTipTapJSON();
    expect(result).toEqual(expectedTipTapJSON);
  });
});
