import JSZip from 'jszip';

import { addFiles, DocumentOptions,generateDocument } from './internal';

export async function asBlob(
  html: string,
  options: Partial<DocumentOptions> = {}
) {
  const zip = new JSZip();
  addFiles(zip, html, options);
  return await generateDocument(zip);
}
