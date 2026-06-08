import { list } from '@vercel/blob';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // List blobs to find our menu_data.json
    const { blobs } = await list({
      prefix: 'menu_data',
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    if (!blobs.length) {
      return res.status(404).json({ error: 'Menu data not found' });
    }

    // Fetch the blob content
    const response = await fetch(blobs[0].url);
    const data = await response.text();

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).send(data);
  } catch (err) {
    console.error('Failed to load menu:', err);
    return res.status(500).json({ error: 'Failed to load menu' });
  }
}
