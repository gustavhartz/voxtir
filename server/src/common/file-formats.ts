import { logger } from '../services/logger.js';
// Define a TypeScript enum for audio formats
enum AudioFormat {
  AAC = 'audio/aac',
  MP3 = 'audio/mpeg',
  WAV = 'audio/wav',
  AIFF = 'audio/aiff',
  FLAC = 'audio/flac',
  ALAC = 'audio/alac',
  M4A = 'audio/mp4',
  CAF = 'audio/x-caf',
  AC3 = 'audio/ac3',
  // Add more audio formats here
}

// Create a mapping from MIME type to file extension
const audioFormatToExtension: Record<string, string> = {
  [AudioFormat.AAC]: 'aac',
  [AudioFormat.MP3]: 'mp3',
  [AudioFormat.WAV]: 'wav',
  [AudioFormat.AIFF]: 'aiff',
  [AudioFormat.FLAC]: 'flac',
  [AudioFormat.ALAC]: 'm4a',
  [AudioFormat.M4A]: 'm4a',
  [AudioFormat.CAF]: 'caf',
  [AudioFormat.AC3]: 'ac3',
  // Add more mappings as needed
};

// Function to convert MIME type to file extension
export function mimeTypeToExtension(mimeType: string): string {
  // Return the extension if it exists, otherwise throw an error
  if (!audioFormatToExtension[mimeType]) {
    logger.error(`No extension found for MIME type ${mimeType}`);
    throw new Error(`No extension found for MIME type ${mimeType}`);
  }
  return audioFormatToExtension[mimeType];
}
