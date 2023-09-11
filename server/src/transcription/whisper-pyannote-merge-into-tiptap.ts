import { Logger, logger as coreLogger } from '../services/logger.js';
import {
  Heading,
  MentionContent,
  Paragraph,
  TextContent,
  TimeStampButtonContent,
  TipTapTransformerDocument,
} from '../types/tiptap-editor.js';

interface WhisperSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
}

interface WhisperTranscript {
  segments: WhisperSegment[];
  text: string;
}

interface PyannoteSegment {
  start: number;
  end: number;
  idx: number;
  speaker: string;
}

interface PyannoteTranscript {
  segments: PyannoteSegment[];
}

function convertSecondsToTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const secondsRemainder = seconds - hours * 3600 - minutes * 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secondsRemainder.toString().padStart(2, '0')}`;
}

export class WhisperPyannoteMerger {
  pyannoteTranscript: PyannoteTranscript;
  whisperTranscript: WhisperTranscript;
  timestampEveryApproximateSeconds: number;
  minimumTimeBetweenTimestampsSeconds: number;
  documentTitle: string;
  logger: Logger;
  constructor(
    pyannoteTranscript: PyannoteTranscript,
    whisperTranscript: WhisperTranscript,
    timestampEveryApproximateSeconds = 25,
    minimumTimeBetweenTimestampsSeconds = 10,
    documentTitle = 'Unnamed document',
    logger?: Logger
  ) {
    this.whisperTranscript = whisperTranscript;
    this.pyannoteTranscript = pyannoteTranscript;
    this.timestampEveryApproximateSeconds = timestampEveryApproximateSeconds;
    this.minimumTimeBetweenTimestampsSeconds =
      minimumTimeBetweenTimestampsSeconds;
    this.logger = logger || coreLogger;
    this.documentTitle = documentTitle;
  }
  /**
   * This function generates the TipTapJsonDoc template for a timestamp button used in the frontend editor
   * @param speaker
   * @returns
   */
  static getSpeakerTemplate(speaker: string): MentionContent {
    return {
      type: 'mention',
      attrs: {
        id: speaker,
      },
    };
  }
  /**
   * This function takes a timestamp in the format HH:MM:SS as used by the frontend in the editor and creates the TipTapJSONDoc for a timestamp button
   * @param timestamp timestamp in the format HH:MM:SS as used by the frontend in the editor
   * @returns
   */
  static getTimeStampTemplate(timestamp: string): TimeStampButtonContent {
    return {
      type: 'timeStampButton',
      attrs: {
        timestamp: timestamp,
      },
    };
  }

  /**
   * This function generates the TipTapJsonDoc template for a text node
   * @param timestamp
   * @returns
   */
  static getTextTemplate(text: string): TextContent {
    return {
      type: 'text',
      text: text,
    };
  }

  /**
   * This function generates the TipTapJsonDoc template for a heading node
   * @param text
   * @param level
   * @returns
   */
  static getHeadingTemplate(level: 1 | 2 | 3 | 4 | 5): Heading {
    return {
      type: 'heading',
      attrs: {
        level: level,
      },
      content: [],
    };
  }

  /**
   * This function generates the TipTapJsonDoc template for a paragraph node
   * @returns
   */
  static getParagraphTemplate(): Paragraph {
    return {
      type: 'paragraph',
      content: [],
    };
  }

  /**
   * This function takes a pyannote transcript and a whisper transcript and merges them into a TipTapJSONDoc as used by the tiptap transformer with speaker changes and timestamps
   * it's based upon the https://github.com/fourTheorem/podwhisperer logic, but customized to work with the Pyannote transcript and our own pipeline
   * The core idea is to iterate over the whisper transcript and insert speaker changes and timestamps from the Pyannote transcript and then merge the two
   * into a single HTML document that can be used in the frontend editor. Thus this function is highly dependent on the HTML structure of the frontend editor
   * @param pyannoteTranscript - The json format ml transcription pipeline for pyannote
   * @param whisperTranscript - The json format of the ml transcription pipeline for whisper
   * @param timestampEveryApproximateSeconds - The approximate number of seconds between timestamps
   * @param minimumTimeBetweenTimestampsSeconds - The minimum number of seconds between timestamps
   * @returns
   */
  createSpeakerChangeTranscriptionHTML(): TipTapTransformerDocument {
    const pyannoteTranscript = this.pyannoteTranscript;
    const whisperTranscript = this.whisperTranscript;
    const timestampEveryApproximateSeconds =
      this.timestampEveryApproximateSeconds;
    const minimumTimeBetweenTimestampsSeconds =
      this.timestampEveryApproximateSeconds;

    this.logger.info(
      `Creating speaker change transcription document based on ${pyannoteTranscript.segments.length} pyannote segments and ${whisperTranscript.segments.length} whisper segments`
    );
    let pyannoteIdx = 0;
    let pyannoteSegment = pyannoteTranscript.segments[pyannoteIdx];
    let whisperIdx = 0;
    let whisperSegment = whisperTranscript.segments[whisperIdx];
    let speaker = pyannoteSegment.speaker;
    let prevSpeaker = '';
    let setTimestamp = false;
    let lastTimestampAt = 0;

    const TipTapJSONDoc: TipTapTransformerDocument = {
      default: {
        type: 'doc',
        content: [],
      },
    };

    const heading = WhisperPyannoteMerger.getHeadingTemplate(2);
    heading.content?.push(
      WhisperPyannoteMerger.getTextTemplate(this.documentTitle)
    );
    TipTapJSONDoc.default.content.push(heading);

    let currentParagraph: Paragraph = {
      type: 'paragraph',
      content: [],
    };
    // Initialize by adding the first speaker and timestamp
    currentParagraph.content?.push(
      WhisperPyannoteMerger.getTimeStampTemplate('00:00:00')
    );
    currentParagraph.content?.push(
      WhisperPyannoteMerger.getSpeakerTemplate(speaker)
    );

    while (whisperIdx < whisperTranscript.segments.length) {
      whisperSegment = whisperTranscript.segments[whisperIdx];
      pyannoteSegment = pyannoteTranscript.segments[pyannoteIdx];
      // move whisper segment forward
      if (
        whisperSegment.end < pyannoteSegment.start ||
        pyannoteIdx === pyannoteTranscript.segments.length - 1
      ) {
        currentParagraph.content?.push(
          WhisperPyannoteMerger.getTextTemplate(whisperSegment.text)
        );
        whisperIdx++;
        continue;
      } else {
        pyannoteIdx++;
        pyannoteSegment = pyannoteTranscript.segments[pyannoteIdx];
        speaker = pyannoteSegment.speaker;
      }

      if (speaker !== prevSpeaker) {
        TipTapJSONDoc.default.content.push(currentParagraph);
        currentParagraph = WhisperPyannoteMerger.getParagraphTemplate();
        currentParagraph.content?.push(
          WhisperPyannoteMerger.getSpeakerTemplate(speaker)
        );
        prevSpeaker = speaker;
        setTimestamp = true;
      }

      if (
        (setTimestamp ||
          lastTimestampAt <
            whisperSegment.end - timestampEveryApproximateSeconds) &&
        lastTimestampAt + minimumTimeBetweenTimestampsSeconds <
          whisperSegment.end
      ) {
        currentParagraph.content?.push(
          WhisperPyannoteMerger.getTimeStampTemplate(
            convertSecondsToTimestamp(whisperSegment.end)
          )
        );
        setTimestamp = false;
        lastTimestampAt = whisperSegment.end;
      }
    }
    return TipTapJSONDoc;
  }
}
