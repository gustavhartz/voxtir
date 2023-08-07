import * as fs from 'fs';

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

function convertSecondsToTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const secondsRemainder = seconds - hours * 3600 - minutes * 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secondsRemainder.toString().padStart(2, '0')}`;
}

/**
 * This function generates the HTML template for a timestamp button used in the frontend editor
 * @param speaker
 * @returns
 */
function getSpeakerHtml(speaker: string) {
  return `<span data-type="mention" class="border-black rounded-md break-clone py-0.5 px-1.5 p-1 bg-blue-500 text-white" data-id="${speaker}" contenteditable="false">@${speaker}</span>`;
}

/**
 * This function takes a timestamp in the format HH:MM:SS as used by the frontend in the editor and creates the HTML for a timestamp button
 * @param timestamp timestamp in the format HH:MM:SS as used by the frontend in the editor
 * @returns
 */
function getTimestampHtml(timestamp: string) {
  return `<timestamp-button timestamp="${timestamp}"></timestamp-button>`;
}

export const createSpeakerChangeTranscriptionDocument = (
  PyannoteTranscript: PyannoteSegment[],
  whisperTranscript: WhisperTranscript,
  timestampEveryApproximateSeconds: number = 25
): string => {
  let pyannoteIdx = 0;
  let pyannoteSegment = PyannoteTranscript[pyannoteIdx];
  let whisperIdx = 0;
  let whisperSegment = whisperTranscript.segments[whisperIdx];
  let speaker = pyannoteSegment.speaker;
  let prevSpeaker = '';
  let setTimestamp = false;
  let lastTimestampAt = 0;

  let textCollector = `<p>${getSpeakerHtml(speaker)} ${getTimestampHtml(
    '00:00:00'
  )}</p><p>`;

  while (whisperIdx < whisperTranscript.segments.length) {
    // move whisper segment forward
    if (
      whisperSegment.end < pyannoteSegment.start ||
      pyannoteIdx === PyannoteTranscript.length - 1
    ) {
      textCollector += whisperSegment.text;
      whisperIdx++;
      continue;
    } else {
      pyannoteIdx++;
      pyannoteSegment = PyannoteTranscript[pyannoteIdx];
      speaker = pyannoteSegment.speaker;
    }

    if (speaker !== prevSpeaker) {
      textCollector += `</p><p>${getSpeakerHtml(speaker)}`;
      prevSpeaker = speaker;
      setTimestamp = true;
    }

    if (
      setTimestamp ||
      lastTimestampAt < whisperSegment.end - timestampEveryApproximateSeconds
    ) {
      textCollector += ` ${getTimestampHtml(
        convertSecondsToTimestamp(whisperSegment.start)
      )}`;
      setTimestamp = false;
      lastTimestampAt = whisperSegment.end;
    }
  }
  // close last paragraph
  textCollector += '</p>';
  return textCollector;
};

let isRunningDirectly = false;
if (isRunningDirectly) {
  // load in files
  const pyannoteTranscript = JSON.parse(
    fs.readFileSync(
      '/Users/alex/Downloads/whisper-transcript/whisper-transcript.json',
      'utf-8'
    )
  );
  const whisperTranscript = JSON.parse(
    fs.readFileSync(
      '/Users/alex/Downloads/whisper-transcript/whisper-transcript.json',
      'utf-8'
    )
  );
  const mergedTranscript = createSpeakerChangeTranscriptionDocument(
    pyannoteTranscript,
    whisperTranscript
  );
  // write to file
  console.log(mergedTranscript);
  fs.writeFileSync('test.html', mergedTranscript);
}
