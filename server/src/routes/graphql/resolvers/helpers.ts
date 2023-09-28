import { ReadStream } from 'fs';

import { logger } from '../../../services/logger.js';
export const dumpReadStream = async (stream: ReadStream): Promise<void> => {
  logger.debug('Dumping read stream');
  await new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
    stream.resume(); // Start consuming the stream
  });
};
