import * as fs from 'fs';

import { Logger, logger as coreLogger } from '../services/logger.js';

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
  logger: Logger;
  constructor(
    pyannoteTranscript: PyannoteTranscript,
    whisperTranscript: WhisperTranscript,
    timestampEveryApproximateSeconds = 25,
    minimumTimeBetweenTimestampsSeconds = 10,
    logger?: Logger
  ) {
    this.whisperTranscript = whisperTranscript;
    this.pyannoteTranscript = pyannoteTranscript;
    this.timestampEveryApproximateSeconds = timestampEveryApproximateSeconds;
    this.minimumTimeBetweenTimestampsSeconds =
      minimumTimeBetweenTimestampsSeconds;
    this.logger = logger || coreLogger;
  }
  /**
   * This function generates the HTML template for a timestamp button used in the frontend editor
   * @param speaker
   * @returns
   */
  static getSpeakerHtmlSpanTemplate(speaker: string): string {
    return `<span data-type="mention" class="border-black rounded-md break-clone py-0.5 px-1.5 p-1 bg-blue-500 text-white" data-id="${speaker}" contenteditable="false">@${speaker}</span>`;
  }
  /**
   * This function takes a timestamp in the format HH:MM:SS as used by the frontend in the editor and creates the HTML for a timestamp button
   * @param timestamp timestamp in the format HH:MM:SS as used by the frontend in the editor
   * @returns
   */
  static getTimespanButtonHtmlTemplate(timestamp: string): string {
    return `<timestamp-button timestamp="${timestamp}"></timestamp-button>`;
  }
  /**
   * This function takes a pyannote transcript and a whisper transcript and merges them into a single HTML document with speaker changes and timestamps
   * it's based upon the https://github.com/fourTheorem/podwhisperer logic, but customized to work with the Pyannote transcript and our own pipeline
   * The core idea is to iterate over the whisper transcript and insert speaker changes and timestamps from the Pyannote transcript and then merge the two
   * into a single HTML document that can be used in the frontend editor. Thus this function is highly dependent on the HTML structure of the frontend editor
   * @param pyannoteTranscript - The json format ml transcription pipeline for pyannote
   * @param whisperTranscript - The json format of the ml transcription pipeline for whisper
   * @param timestampEveryApproximateSeconds - The approximate number of seconds between timestamps
   * @param minimumTimeBetweenTimestampsSeconds - The minimum number of seconds between timestamps
   * @returns
   */
  createSpeakerChangeTranscriptionHTML() {
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

    let textCollector = `<p>${WhisperPyannoteMerger.getSpeakerHtmlSpanTemplate(
      speaker
    )} ${WhisperPyannoteMerger.getTimespanButtonHtmlTemplate(
      '00:00:00'
    )}</p><p>`;

    while (whisperIdx < whisperTranscript.segments.length) {
      whisperSegment = whisperTranscript.segments[whisperIdx];
      pyannoteSegment = pyannoteTranscript.segments[pyannoteIdx];
      // move whisper segment forward
      if (
        whisperSegment.end < pyannoteSegment.start ||
        pyannoteIdx === pyannoteTranscript.segments.length - 1
      ) {
        textCollector += whisperSegment.text;
        whisperIdx++;
        continue;
      } else {
        pyannoteIdx++;
        pyannoteSegment = pyannoteTranscript.segments[pyannoteIdx];
        speaker = pyannoteSegment.speaker;
      }

      if (speaker !== prevSpeaker) {
        textCollector += `</p><p>${WhisperPyannoteMerger.getSpeakerHtmlSpanTemplate(
          speaker
        )}`;
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
        textCollector += ` ${WhisperPyannoteMerger.getTimespanButtonHtmlTemplate(
          convertSecondsToTimestamp(whisperSegment.end)
        )}`;
        setTimestamp = false;
        lastTimestampAt = whisperSegment.end;
      }
    }
    // close last paragraph
    textCollector += '</p>';
    return textCollector;
  }
}
