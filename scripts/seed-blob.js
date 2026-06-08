/**
 * One-time script to upload menu_data.json to Vercel Blob.
 * Run after creating the Blob store and setting BLOB_READ_WRITE_TOKEN.
 *
 * Usage: BLOB_READ_WRITE_TOKEN=vercel_blob_xxx node scripts/seed-blob.js
 */

const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('ERROR: Set BLOB_READ_WRITE_TOKEN environment variable first.');
    console.error('Get it from: Vercel Dashboard → mamba-point → Storage → Blob Store');
    process.exit(1);
  }

  const dataPath = path.join(__dirname, '..', 'menu_data.json');
  if (!fs.existsSync(dataPath)) {
    console.error('ERROR: menu_data.json not found. Run extract-menu.js first.');
    process.exit(1);
  }

  const data = fs.readFileSync(dataPath, 'utf-8');
  const parsed = JSON.parse(data);
  console.log(`Uploading menu data: ${parsed.sections.length} sections, version ${parsed.version}`);

  const blob = await put('menu_data.json', data, {
    access: 'public',
    token,
    addRandomSuffix: false
  });

  console.log('Uploaded successfully!');
  console.log('Blob URL:', blob.url);
}

main().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
