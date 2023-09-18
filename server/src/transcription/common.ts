import { logger } from '../services/logger.js';

// CONSTANTS
export const AWS_AUDIO_BUCKET_PRESIGNED_URL_EXPIRATION = 60 * 60 * 2; // 2 Hours in milliseconds

// TRANSCRIPTION BUCKET SETUP
export const audioFilePrefix = 'raw-audio';
export const speechToTextFilePrefix = 'speech-to-text';
export const speakerDiarizationFilePrefix = 'speaker-diarization';
export const generatedTranscriptionFilePrefix = 'generated-transcription';
export const sagemakerJSONFilePrefix = 'sagemaker-input';
// NOTE: This is the prefix for the output of the sagemaker job. But the output is not used
export const sagemakerOutputFilePrefix = 'sagemaker-output';

interface audioTranscriptionKeyParts {
  prefix: string;
  documentId: string;
  fileType: string;
  fullKey: string;
}
/**
 * Simple function to split an audio transcription key into its parts. Expects the key to be in the format <AUDIO_FOLDER_PREFIX>/<DOCUMENT_ID>.<FILE_TYPE>
 * @param key
 * @returns
 */
export function splitAudioTranscriptionBucketKey(
  key: string
): audioTranscriptionKeyParts {
  if (
    key.split('/').length !== 2 ||
    !(key.split('.').length === 2 || key.split('.').length === 3)
  ) {
    logger.error(
      `Unexpected key format for audio transcription file ${key}, expected <AUDIO_FOLDER_PREFIX>/<DOCUMENT_ID>.<FILE_TYPE>`
    );
    throw new Error(
      `Unexpected key format for audio transcription file ${key}, expected <AUDIO_FOLDER_PREFIX>/<DOCUMENT_ID>.<FILE_TYPE>`
    );
  }

  const prefix = key.split('/')[0];
  const documentId = key.split('/')[1].split('.')[0];
  const fileType = key.split('/')[1].split('.')[1];

  return { prefix, documentId, fileType, fullKey: key };
}

export const LanguageCodePairs = {
  english: 'en',
  chinese: 'zh',
  german: 'de',
  spanish: 'es',
  russian: 'ru',
  korean: 'ko',
  french: 'fr',
  japanese: 'ja',
  portuguese: 'pt',
  turkish: 'tr',
  polish: 'pl',
  catalan: 'ca',
  dutch: 'nl',
  arabic: 'ar',
  swedish: 'sv',
  italian: 'it',
  indonesian: 'id',
  hindi: 'hi',
  finnish: 'fi',
  vietnamese: 'vi',
  hebrew: 'he',
  ukrainian: 'uk',
  greek: 'el',
  malay: 'ms',
  czech: 'cs',
  romanian: 'ro',
  danish: 'da',
  hungarian: 'hu',
  tamil: 'ta',
  norwegian: 'no',
  thai: 'th',
  urdu: 'ur',
  croatian: 'hr',
  bulgarian: 'bg',
  lithuanian: 'lt',
  latin: 'la',
  maori: 'mi',
  malayalam: 'ml',
  welsh: 'cy',
  slovak: 'sk',
  telugu: 'te',
  persian: 'fa',
  latvian: 'lv',
  bengali: 'bn',
  serbian: 'sr',
  azerbaijani: 'az',
  slovenian: 'sl',
  kannada: 'kn',
  estonian: 'et',
  macedonian: 'mk',
  breton: 'br',
  basque: 'eu',
  icelandic: 'is',
  armenian: 'hy',
  nepali: 'ne',
  mongolian: 'mn',
  bosnian: 'bs',
  kazakh: 'kk',
  albanian: 'sq',
  swahili: 'sw',
  galician: 'gl',
  marathi: 'mr',
  punjabi: 'pa',
  sinhala: 'si',
  khmer: 'km',
  shona: 'sn',
  yoruba: 'yo',
  somali: 'so',
  afrikaans: 'af',
  occitan: 'oc',
  georgian: 'ka',
  belarusian: 'be',
  tajik: 'tg',
  sindhi: 'sd',
  gujarati: 'gu',
  amharic: 'am',
  yiddish: 'yi',
  lao: 'lo',
  uzbek: 'uz',
  faroese: 'fo',
  'haitian creole': 'ht',
  pashto: 'ps',
  turkmen: 'tk',
  nynorsk: 'nn',
  maltese: 'mt',
  sanskrit: 'sa',
  luxembourgish: 'lb',
  myanmar: 'my',
  tibetan: 'bo',
  tagalog: 'tl',
  malagasy: 'mg',
  assamese: 'as',
  tatar: 'tt',
  hawaiian: 'haw',
  lingala: 'ln',
  hausa: 'ha',
  bashkir: 'ba',
  javanese: 'jw',
  sundanese: 'su',
};

export function getSpeakerDiarizationOutputKey(documentId: string): string {
  return `${speakerDiarizationFilePrefix}/${documentId}.json`;
}

export function getSpeechToTextOutputKey(documentId: string): string {
  return `${speechToTextFilePrefix}/${documentId}.json`;
}

export function getGeneratedTranscriptionFileKey(documentId: string): string {
  return `${generatedTranscriptionFilePrefix}/${documentId}.json`;
}
