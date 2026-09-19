import { put } from '@vercel/blob';

export async function storeBase64Image(base64: string, mimeType = 'image/png', prefix = 'masteryai') {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('BLOB_READ_WRITE_TOKEN is not configured. Attach a Vercel Blob store to the project.');
  const buffer = Buffer.from(base64, 'base64');
  const ext = mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'jpg' : mimeType.includes('webp') ? 'webp' : 'png';
  const blob = await put(`${prefix}/${Date.now()}-${crypto.randomUUID()}.${ext}`, buffer, { access: 'public', contentType: mimeType, addRandomSuffix: false });
  return blob.url;
}
