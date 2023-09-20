import { Interval, IntervalTree } from 'node-interval-tree';

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
  words: WhisperWordTimestamp[];
}

interface WhisperWordTimestamp {
  word: string;
  start: number;
  end: number;
  probability: number;
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
  MINIMUM_SEGMENT_LENGTH_SECONDS = 0.3;
  MINIMUM_SPEAKER_SEGMENT_OVERLAP_PERCENTAGE = 0.3;
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
    this.enforcePyannoteSpeakerSegmentMinimumLength(
      this.MINIMUM_SEGMENT_LENGTH_SECONDS
    );
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
   * A Function to clean up the pyannote transcript by removing segments that are too short
   *
   * @memberof WhisperPyannoteMerger
   */
  enforcePyannoteSpeakerSegmentMinimumLength(seconds: number): void {
    this.pyannoteTranscript.segments = this.pyannoteTranscript.segments.filter(
      (segment) => {
        return segment.end - segment.start > seconds;
      }
    );
    // Now there can be segments of the same speaker that are directly after each other, so we need to merge them
    // This is done by iterating over the segments and merging them if they have the same speaker
    let idx = 0;
    while (idx < this.pyannoteTranscript.segments.length - 1) {
      const currentSegment = this.pyannoteTranscript.segments[idx];
      const nextSegment = this.pyannoteTranscript.segments[idx + 1];
      if (currentSegment.speaker === nextSegment.speaker) {
        currentSegment.end = nextSegment.end;
        this.pyannoteTranscript.segments.splice(idx + 1, 1);
      } else {
        idx++;
      }
    }
  }

  /**
   * This function takes a pyannote transcript and a whisper transcript and merges them into a TipTapJSONDoc as used by the tiptap transformer with speaker changes and timestamps
   * it's based upon the https://github.com/fourTheorem/podwhisperer logic, but customized to work with the Pyannote transcript and our own pipeline
   * The core idea is to iterate over the whisper transcript and insert speaker changes and timestamps from the Pyannote transcript and then merge the two
   * into a single JSON structure that can be used in the frontend editor. The TipTap format. Thus this function is highly dependent on the Schema of the frontend editor
   * @param pyannoteTranscript - The json format ml transcription pipeline for pyannote
   * @param whisperTranscript - The json format of the ml transcription pipeline for whisper
   * @param timestampEveryApproximateSeconds - The approximate number of seconds between timestamps
   * @param minimumTimeBetweenTimestampsSeconds - The minimum number of seconds between timestamps
   * @returns
   */
  createSpeakerChangeTranscriptionTipTapJSON(): TipTapTransformerDocument {
    // Setup the document
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

    // Setup the data to add
    const pyannoteTranscript = this.pyannoteTranscript;
    const whisperTranscript = this.whisperTranscript;
    const timestampEveryApproximateSeconds =
      this.timestampEveryApproximateSeconds;
    const minimumTimeBetweenTimestampsSeconds =
      this.timestampEveryApproximateSeconds;

    this.logger.info(
      `Creating speaker change transcription document based on ${pyannoteTranscript.segments.length} pyannote segments and ${whisperTranscript.segments.length} whisper segments`
    );
    if (
      pyannoteTranscript.segments.length === 0 ||
      whisperTranscript.segments.length <= 1
    ) {
      this.logger.warn(
        'ML Pipeline data is not sufficient to create a transcription. Probably an error'
      );
      return TipTapJSONDoc;
    }
    // Merging logic
    let whisperIdx = 0;
    let setTimestamp = false;
    let lastTimestampAt = 0;
    let prevSpeaker = '';
    interface PyannoteIntervalTree extends Interval {
      data: PyannoteSegment;
    }
    // Use interval tree for finding the pyannote segment for a given whisper segment
    const intervalTree = new IntervalTree<PyannoteIntervalTree>();
    for (const pyannoteSegment of pyannoteTranscript.segments) {
      intervalTree.insert({
        low: pyannoteSegment.start,
        high: pyannoteSegment.end,
        data: pyannoteSegment,
      });
    }

    let currentParagraph: Paragraph = {
      type: 'paragraph',
      content: [],
    };

    // Text is the primary focus of the whisper transcript, so we iterate over the whisper transcript
    // and add the pyannote speaker changes and timestamps to improve the whisper transcript
    while (whisperIdx < whisperTranscript.segments.length) {
      const whisperSegment = whisperTranscript.segments[whisperIdx];

      // Identify potential speakers
      const potentialSpeakers = intervalTree
        .search(whisperSegment.start, whisperSegment.end)
        .map((interval) => interval.data);

      const bestSpeaker = this.getBestSpeakerMatch(
        potentialSpeakers,
        whisperSegment
      );

      if (bestSpeaker && bestSpeaker !== prevSpeaker) {
        // If this is not the first speaker without any text before it, we start a new paragraph
        if (whisperIdx !== 0) {
          TipTapJSONDoc.default.content.push(currentParagraph);
          currentParagraph = WhisperPyannoteMerger.getParagraphTemplate();
        }
        currentParagraph.content?.push(
          WhisperPyannoteMerger.getSpeakerTemplate(bestSpeaker)
        );
        setTimestamp = true;
        prevSpeaker = bestSpeaker;
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
            convertSecondsToTimestamp(whisperSegment.start)
          )
        );
        setTimestamp = false;
        lastTimestampAt = whisperSegment.start;
      }

      currentParagraph.content?.push(
        WhisperPyannoteMerger.getTextTemplate(whisperSegment.text)
      );
      whisperIdx++;
    }
    return TipTapJSONDoc;
  }

  /**
   * Determine best match by taking the one with the highest overlap and breaking ties by taking the longest
   *
   * @param {PyannoteSegment[]} potentialSpeakers
   * @param {WhisperSegment} whisperSegment
   * @return {*}  {string} - The best speaker match or null if no match
   * @memberof WhisperPyannoteMerger
   */
  getBestSpeakerMatch(
    potentialSpeakers: PyannoteSegment[],
    whisperSegment: WhisperSegment
  ): string | null {
    let maxOverlap = 0;
    let bestSpeaker = null;
    let bestSpeakerLength = 0;
    for (const potentialSpeaker of potentialSpeakers) {
      const overlapLength =
        Math.min(potentialSpeaker.end, whisperSegment.end) -
        Math.max(potentialSpeaker.start, whisperSegment.start);
      const overlapPercentage = Math.min(
        1e-3 + overlapLength / (whisperSegment.end - whisperSegment.start),
        1
      );

      if (
        overlapPercentage >= maxOverlap &&
        overlapPercentage > this.MINIMUM_SPEAKER_SEGMENT_OVERLAP_PERCENTAGE
      ) {
        if (
          !bestSpeaker || // If no best speaker yet
          overlapPercentage > maxOverlap || // If better overlap
          potentialSpeaker.end - potentialSpeaker.start > bestSpeakerLength // If same overlap, but longer segment. We prefer fewer speaker changes
        ) {
          bestSpeaker = potentialSpeaker.speaker;
          maxOverlap = overlapPercentage;
          bestSpeakerLength = potentialSpeaker.end - potentialSpeaker.start;
        }
      }
    }
    return bestSpeaker;
  }
}
